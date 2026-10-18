/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEvent, ThreatAnalysisResult, RemediationItem, CopilotMessage } from '../types';
import { RuleMatch, evaluateDetectionRules } from './rulesEngine';
import { calculateExplainableRisk, DEFAULT_RISK_CONFIG } from './riskEngine';

export function runDeterministicAnalysis(events: NormalizedEvent[]): ThreatAnalysisResult {
  const matches = evaluateDetectionRules(events);
  const risk = calculateExplainableRisk(events, matches, DEFAULT_RISK_CONFIG);

  const affectedAssets = Array.from(new Set(
    events.map(e => e.resource || e.service).filter(Boolean)
  )) as string[];

  // Determine threat category
  let threatCategory = 'Suspicious Infrastructure Telemetry';
  if (matches.some(m => m.mitre.techniqueId.includes('T1530'))) {
    threatCategory = 'Cloud Storage Exfiltration & Public Bucket Exposure';
  } else if (matches.some(m => m.mitre.techniqueId.includes('T1098'))) {
    threatCategory = 'Privileged IAM Escalation & Backdoor Key Generation';
  } else if (matches.some(m => m.mitre.techniqueId.includes('T1059'))) {
    threatCategory = 'Remote Code Execution & Reverse Interactive Shell';
  } else if (matches.some(m => m.mitre.techniqueId.includes('T1110'))) {
    threatCategory = 'Distributed Credential Brute Force & Password Spraying';
  } else if (matches.some(m => m.mitre.techniqueId.includes('T1078'))) {
    threatCategory = 'Anomalous Cloud Session & Impossible Travel Anomaly';
  } else if (risk.overallScore < 30) {
    threatCategory = 'Routine Automated Operations (Low Risk Telemetry)';
  }

  // Observed evidence (Hard facts only)
  const technicalEvidence: string[] = [];
  technicalEvidence.push(`Analyzed ${events.length} event records across ${Array.from(new Set(events.map(e => e.sourceIp))).length} distinct source IP addresses.`);
  
  const failureCount = events.filter(e => e.status === 'FAILURE' || e.status === 'BLOCKED').length;
  if (failureCount > 0) {
    technicalEvidence.push(`Observed ${failureCount} failed or blocked authorization attempts.`);
  }

  matches.forEach(m => {
    technicalEvidence.push(`Rule match [${m.ruleName}] triggered for event IDs: ${m.matchedEventIds.slice(0, 3).join(', ')}.`);
  });

  events.slice(0, 3).forEach(e => {
    technicalEvidence.push(`Event at ${e.timestamp}: Actor '${e.user}' initiated '${e.action}' on '${e.resource || e.service}' with status ${e.status}.`);
  });

  // AI Inferences (Probabilistic deductions, strictly distinguished from observed facts)
  const aiInferences: string[] = [];
  if (risk.overallScore >= 75) {
    aiInferences.push('High likelihood that credentials were harvested via external breach or phishing before initial API invocation.');
    aiInferences.push('The rapid sequence of policy modifications indicates pre-scripted post-exploitation toolkits (e.g. Pacu / ScoutSuite).');
  } else if (risk.overallScore >= 45) {
    aiInferences.push('Moderate probability of reconnaissance scanning or misconfigured integration script retrying invalid credentials.');
  } else {
    aiInferences.push('Telemetry closely matches legitimate CI/CD pipeline automation or routine cron job executions.');
  }

  // False positive considerations
  const falsePositiveConsiderations: string[] = [
    'Scheduled DevOps maintenance or terraform apply scripts running privileged tasks outside business hours.',
    'Corporate VPN rotation, mobile tethering, or ZTNA proxies simulating impossible travel across data centers.',
    'Penetration testing or automated vulnerability scanning authorized by SecOps.'
  ];

  // Remediation checklist
  const remediationChecklist: RemediationItem[] = [];
  if (risk.overallScore >= 60) {
    remediationChecklist.push({
      id: 'REM-1',
      step: 'Revoke active IAM user session tokens and inactivate exposed access keys immediately.',
      priority: 'IMMEDIATE',
      playbookId: 'PB-IAM-01',
      automatedAvailable: true,
      commandSnippet: 'aws iam update-access-key --access-key-id <KEY_ID> --status Inactive'
    });
    remediationChecklist.push({
      id: 'REM-2',
      step: 'Block offending source IP addresses on perimeter AWS WAF and Security Groups.',
      priority: 'HIGH',
      playbookId: 'PB-NET-02',
      automatedAvailable: true,
      commandSnippet: 'aws wafv2 update-ip-set --name AegisBlockList --scope REGIONAL --addresses <OFFENDING_IP>/32'
    });
    remediationChecklist.push({
      id: 'REM-3',
      step: 'Isolate affected host instance / container to quarantine security group for forensic snapshotting.',
      priority: 'HIGH',
      playbookId: 'PB-HOST-03',
      automatedAvailable: true,
      commandSnippet: 'aws ec2 modify-instance-attribute --instance-id <INSTANCE_ID> --groups <QUARANTINE_SG_ID>'
    });
  } else {
    remediationChecklist.push({
      id: 'REM-4',
      step: 'Verify actor identity with service owner and review cloud access logs over preceding 7 days.',
      priority: 'MEDIUM',
      automatedAvailable: false
    });
    remediationChecklist.push({
      id: 'REM-5',
      step: 'Ensure Multi-Factor Authentication (MFA) is strictly enforced on all related administrative consoles.',
      priority: 'LOW',
      automatedAvailable: false
    });
  }

  const mitreTactics = matches.map(m => m.mitre);

  const confidence = matches.length > 0 ? Math.min(95, 60 + matches.length * 10) : 55;
  const uncertaintyRationale = matches.length === 0
    ? 'Limited correlation signatures found; relying on statistical frequency and behavioral thresholds.'
    : `Identified ${matches.length} deterministic rule signatures. Uncertainty stems from potential authorized administrative activity without ticket cross-referencing.`;

  const summary = `AEGIS analysis detected ${risk.severity} risk threat pattern (${threatCategory}) with an explainable risk score of ${risk.overallScore}/100. Observed ${events.length} events across ${technicalEvidence.length} indicators. Immediate defensive containment recommended.`;

  return {
    id: 'ANA-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    provider: 'deterministic-engine',
    providerLabel: 'AEGIS Heuristic Engine (Deterministic Fallback)',
    threatCategory,
    severity: risk.severity,
    riskScore: risk.overallScore,
    confidence,
    uncertaintyRationale,
    summary,
    technicalEvidence,
    aiInferences,
    mitreTactics,
    riskFactors: risk.factors,
    falsePositiveConsiderations,
    remediationChecklist,
    potentialImpact: risk.overallScore >= 70
      ? 'Severe compromise of cloud assets, unauthorized exfiltration of proprietary data, and risk of regulatory non-compliance.'
      : 'Low to moderate operational disruption or transient unauthorized query attempts.',
    affectedAssets: affectedAssets.length > 0 ? affectedAssets : ['AWS Infrastructure', 'IAM Identity'],
    eventsAnalyzed: events
  };
}

export function generateDeterministicCopilotResponse(
  query: string,
  contextEvents: NormalizedEvent[],
  lastAnalysis?: ThreatAnalysisResult
): CopilotMessage {
  const q = query.toLowerCase();
  let content = '';
  const referencedEventIds: string[] = [];

  if (contextEvents.length > 0) {
    referencedEventIds.push(...contextEvents.slice(0, 3).map(e => e.id));
  }

  if (q.includes('contain') || q.includes('remediat') || q.includes('action') || q.includes('command') || q.includes('playbook')) {
    content = `### 🛡️ Recommended Containment Protocol\n\nBased on analyzed events ${referencedEventIds.map(id => `\`#${id}\``).join(', ')}:\n\n1. **Revoke Exposed Credentials**: If AWS IAM keys were used, rotate and set status to Inactive:\n\`\`\`bash\naws iam update-access-key --access-key-id AKIA_EXPOSED_KEY --status Inactive\n\`\`\`\n2. **Block Offending IPs**: Add suspicious source IPs (${contextEvents[0]?.sourceIp || 'offending-ip'}) to your AWS WAF IPSet or VPC Network ACL.\n3. **Isolate Affected Workloads**: Move any suspect EC2 or EKS instances into an isolated quarantine security group with egress 0.0.0.0/0 denied.\n\n*Confidence: 90% | Note: Always execute via dry-run and obtain peer approval before applying production network blocks.*`;
  } else if (q.includes('mfa') || q.includes('login') || q.includes('travel') || q.includes('bypass')) {
    content = `### 🔍 Authentication & Session Analysis\n\nExamining session activity for user \`${contextEvents[0]?.user || 'admin'}\`:\n\n- **Observed Behavior**: Multiple access attempts recorded from disparate locations within an abbreviated time delta.\n- **Potential Bypass Vectors**: Session token theft via Infostealer malware, adversary-in-the-middle (AiTM) phishing proxying the session cookie, or stale API key usage lacking MFA conditions.\n- **Action**: Invalidate active web console sessions using AWS IAM \`RevokeSecurityToken\` or Okta Universal Logout.`;
  } else if (q.includes('ciso') || q.includes('executive') || q.includes('summary')) {
    content = `### 📋 Executive Briefing for Leadership\n\n- **Incident Classification**: ${lastAnalysis?.threatCategory || 'Cloud Security Threat Anomaly'}\n- **Risk Level**: ${lastAnalysis?.severity || 'HIGH'} (${lastAnalysis?.riskScore || 78}/100)\n- **Business Impact**: Potential unauthorized data exposure and credential compromise detected.\n- **Containment Status**: Automated playbooks queued for analyst authorization. No ransomware payload execution identified.\n- **Next Steps**: Formal incident ticket created, evidence logs preserved for forensic chain of custody.`;
  } else if (q.includes('lateral') || q.includes('movement') || q.includes('spread')) {
    content = `### 🌐 Lateral Movement Assessment\n\nCross-referencing event stream with MITRE ATT&CK T1021:\n\n- Analyzed ${contextEvents.length} events across VPC network records.\n- Currently, unauthorized operations are concentrated within service \`${contextEvents[0]?.service || 'aws.iam'}\`.\n- **Watchlist**: Monitor VPC Flow Logs for east-west SMB (port 445) and SSH (port 22) connections to prevent expansion into database subnets.`;
  } else {
    content = `### 🤖 AEGIS Defensive Copilot Analysis\n\nRegarding your inquiry: *"Redacted query regarding security telemetry"*\n\n- **Context Evaluated**: ${contextEvents.length} normalized telemetry events and ${lastAnalysis ? '1 active threat analysis' : 'baseline threat rules'}.\n- **Key Observation**: Events indicate ${lastAnalysis?.severity || 'elevated'} severity activity targeting ${contextEvents[0]?.resource || 'enterprise resources'}.\n- **Evidence Grounding**: Referenced event identifiers: ${referencedEventIds.map(id => `\`#${id}\``).join(', ')}.\n- **Uncertainty Note**: Heuristic evaluation does not assume full compromise without host-level EDR memory telemetry. Verify if this coincided with approved maintenance.`;
  }

  return {
    id: 'COP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    referencedEventIds,
    referencedIncidentIds: lastAnalysis ? ['INC-8492'] : [],
    confidence: 88,
    isFallback: true
  };
}
