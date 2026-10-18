/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEvent, RiskFactorBreakdown, SeverityLevel } from '../types';
import { RuleMatch } from './rulesEngine';

export interface RiskConfig {
  severityWeight: number; // default 0.35
  velocityWeight: number; // default 0.20
  assetWeight: number;    // default 0.25
  privilegeWeight: number;// default 0.20
  threatSensitivity: 'LOW' | 'STANDARD' | 'AGGRESSIVE';
}

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  severityWeight: 0.35,
  velocityWeight: 0.20,
  assetWeight: 0.25,
  privilegeWeight: 0.20,
  threatSensitivity: 'STANDARD'
};

export interface RiskEvaluation {
  overallScore: number;
  severity: SeverityLevel;
  factors: RiskFactorBreakdown[];
  formulaExplanation: string;
}

export function calculateExplainableRisk(
  events: NormalizedEvent[],
  matches: RuleMatch[],
  config: RiskConfig = DEFAULT_RISK_CONFIG
): RiskEvaluation {
  if (!events || events.length === 0) {
    return {
      overallScore: 0,
      severity: 'INFO',
      factors: [],
      formulaExplanation: 'No events provided for risk scoring.'
    };
  }

  // 1. Severity Factor (Max 100 raw, scaled by severityWeight)
  let baseSevRaw = 20; // Default baseline
  const hasCriticalMatch = matches.some(m => m.severity === 'CRITICAL');
  const hasHighMatch = matches.some(m => m.severity === 'HIGH');
  const hasMediumMatch = matches.some(m => m.severity === 'MEDIUM');

  if (hasCriticalMatch) {
    baseSevRaw = 95;
  } else if (hasHighMatch) {
    baseSevRaw = 75;
  } else if (hasMediumMatch) {
    baseSevRaw = 50;
  } else if (events.some(e => e.status === 'FAILURE')) {
    baseSevRaw = 35;
  }

  // Adjust for sensitivity
  if (config.threatSensitivity === 'AGGRESSIVE') baseSevRaw = Math.min(100, baseSevRaw + 10);
  if (config.threatSensitivity === 'LOW') baseSevRaw = Math.max(10, baseSevRaw - 10);

  const factor1: RiskFactorBreakdown = {
    name: 'Rule & Threat Signature Severity',
    score: baseSevRaw,
    weight: config.severityWeight,
    weightedScore: Math.round(baseSevRaw * config.severityWeight * 10) / 10,
    rationale: hasCriticalMatch
      ? 'Critical signature matches observed (e.g. S3 exfiltration, privilege escalation or reverse shell).'
      : hasHighMatch
      ? 'High-severity detection rules triggered (e.g. brute force password spray, impossible travel).'
      : hasMediumMatch
      ? 'Moderate risk anomalies identified in event stream.'
      : 'Standard baseline operations with low anomaly indicators.'
  };

  // 2. Anomaly Velocity & Attack Momentum (Max 100 raw)
  const failureCount = events.filter(e => e.status === 'FAILURE' || e.status === 'BLOCKED').length;
  const failureRatio = events.length > 0 ? failureCount / events.length : 0;
  const criticalRuleCount = matches.filter(m => m.severity === 'CRITICAL').length;
  let velocityRaw = 10;
  if (criticalRuleCount >= 2) {
    // Multi-stage critical exploit chain (e.g. privilege escalation + data exfiltration)
    velocityRaw = 95;
  } else if (criticalRuleCount >= 1 && events.length >= 3) {
    velocityRaw = 85;
  } else if (failureCount >= 5 || failureRatio > 0.6) {
    velocityRaw = 90;
  } else if (failureCount >= 2 || failureRatio > 0.3) {
    velocityRaw = 60;
  } else if (failureCount >= 1) {
    velocityRaw = 35;
  }

  const factor2: RiskFactorBreakdown = {
    name: 'Anomaly Velocity & Attack Momentum',
    score: velocityRaw,
    weight: config.velocityWeight,
    weightedScore: Math.round(velocityRaw * config.velocityWeight * 10) / 10,
    rationale: criticalRuleCount >= 2
      ? `Multi-stage attack killchain identified: ${criticalRuleCount} distinct critical threat signatures triggered in sequence.`
      : failureCount > 0
      ? `${failureCount} of ${events.length} events (${Math.round(failureRatio * 100)}%) were failed or blocked invocations, signaling active exploitation or brute-force scanning.`
      : 'Rapid succession of sensitive cloud operations observed within a compressed timeframe.'
  };

  // 3. Asset Criticality & Exposure (Max 100 raw)
  let assetCriticalityRaw = 25;
  const sensitiveKeywords = ['production', 'prod', 'finance', 'payment', 'pci', 'pii', 'customer-vault', 'root', 'master', 'auth', 'kms'];
  const matchedSensitives = events.filter(e => {
    const text = (e.resource || '' + e.service + e.user).toLowerCase();
    return sensitiveKeywords.some(kw => text.includes(kw));
  });

  if (matchedSensitives.length > 0) {
    assetCriticalityRaw = 90;
  } else if (events.some(e => e.service.includes('aws') || e.service.includes('cloud'))) {
    assetCriticalityRaw = 60;
  }

  const factor3: RiskFactorBreakdown = {
    name: 'Asset Criticality & Blast Radius',
    score: assetCriticalityRaw,
    weight: config.assetWeight,
    weightedScore: Math.round(assetCriticalityRaw * config.assetWeight * 10) / 10,
    rationale: matchedSensitives.length > 0
      ? `High-value production resources targeted (${matchedSensitives.length} references to sensitive assets). Risk of catastrophic data or infrastructure exposure.`
      : 'Standard non-critical or internal infrastructure services referenced.'
  };

  // 4. Privilege & Identity Sensitivity (Max 100 raw)
  let privRaw = 20;
  const privUsers = ['root', 'admin', 'administrator', 'iam', 'secops', 'system', 'prod-deployer'];
  const hasPrivUser = events.some(e => privUsers.some(p => e.user.toLowerCase().includes(p)));
  const hasMultiGeo = matches.some(m => m.mitre.techniqueId.includes('T1078'));
  const hasIamModification = events.some(e => (e.service || '').toLowerCase().includes('iam') || (e.action || '').toLowerCase().includes('policy') || (e.action || '').toLowerCase().includes('accesskey'));

  if ((hasPrivUser && hasMultiGeo) || (hasIamModification && hasCriticalMatch)) {
    privRaw = 96;
  } else if (hasPrivUser || hasMultiGeo || hasIamModification) {
    privRaw = 80;
  } else if (events.some(e => e.user !== 'unknown-user')) {
    privRaw = 40;
  }

  const factor4: RiskFactorBreakdown = {
    name: 'Identity & Privilege Sensitivity',
    score: privRaw,
    weight: config.privilegeWeight,
    weightedScore: Math.round(privRaw * config.privilegeWeight * 10) / 10,
    rationale: (hasIamModification && hasCriticalMatch)
      ? 'Unauthorized IAM policy manipulation and administrative entitlement granting identified.'
      : hasPrivUser
      ? 'Privileged accounts (root/admin/IAM credentials) actively implicated in the event chain.'
      : 'Standard user identity context without elevated cloud administrator entitlements.'
  };

  const totalWeighted = factor1.weightedScore + factor2.weightedScore + factor3.weightedScore + factor4.weightedScore;
  const overallScore = Math.min(100, Math.max(0, Math.round(totalWeighted)));

  let severity: SeverityLevel = 'LOW';
  if (overallScore >= 80) severity = 'CRITICAL';
  else if (overallScore >= 60) severity = 'HIGH';
  else if (overallScore >= 40) severity = 'MEDIUM';
  else if (overallScore >= 15) severity = 'LOW';
  else severity = 'INFO';

  const formulaExplanation = `Calculated via formula: (${factor1.score} × ${config.severityWeight}) + (${factor2.score} × ${config.velocityWeight}) + (${factor3.score} × ${config.assetWeight}) + (${factor4.score} × ${config.privilegeWeight}) = ${overallScore} / 100 [${severity}].`;

  return {
    overallScore,
    severity,
    factors: [factor1, factor2, factor3, factor4],
    formulaExplanation
  };
}
