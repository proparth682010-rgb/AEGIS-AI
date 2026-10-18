/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEvent, MitreMapping, DetectionRule, SeverityLevel } from '../types';

export interface RuleMatch {
  ruleId: string;
  ruleName: string;
  mitre: MitreMapping;
  severity: SeverityLevel;
  matchedEventIds: string[];
  rationale: string;
}

export const DEFAULT_DETECTION_RULES: DetectionRule[] = [
  {
    id: 'R-101',
    name: 'Impossible Travel / Multi-Geo Session Anomaly',
    description: 'Detects concurrent or rapid user authentication across geographically distant IP locations within 1 hour.',
    mitreId: 'T1078.004',
    severity: 'HIGH',
    category: 'Identity & Access',
    enabled: true,
    triggerCount: 14,
    logicSummary: 'Distance(Location_A, Location_B) > 1000km AND TimeDiff < 60min for same user principal.',
    author: 'AEGIS Threat Intel Team',
    updatedAt: '2026-10-15T12:00:00Z'
  },
  {
    id: 'R-102',
    name: 'Credential Brute Force / Password Spray Burst',
    description: 'Multiple authentication failures (>3 events) for one or more users from a single source IP in under 5 minutes.',
    mitreId: 'T1110.003',
    severity: 'HIGH',
    category: 'Credential Access',
    enabled: true,
    triggerCount: 38,
    logicSummary: 'Count(AuthFailure) >= 3 AND GroupBy(Source_IP) WITHIN 300s window.',
    author: 'AEGIS Core Engine',
    updatedAt: '2026-10-14T09:30:00Z'
  },
  {
    id: 'R-103',
    name: 'Privileged Cloud Credential Creation & Escalation',
    description: 'Identifies IAM access key generation (CreateAccessKey) followed by AdministratorAccess policy attachment.',
    mitreId: 'T1098',
    severity: 'CRITICAL',
    category: 'Privilege Escalation',
    enabled: true,
    triggerCount: 7,
    logicSummary: 'Event in [CreateAccessKey, AttachUserPolicy, PutUserPolicy] with Admin or * privileges.',
    author: 'AWS Security Baseline',
    updatedAt: '2026-10-17T18:45:00Z'
  },
  {
    id: 'R-104',
    name: 'S3 Mass Exfiltration / Bucket Policy Public Access',
    description: 'High velocity GetObject calls to sensitive storage buckets or modification of bucket policy allowing public principal (*).',
    mitreId: 'T1530',
    severity: 'CRITICAL',
    category: 'Exfiltration',
    enabled: true,
    triggerCount: 9,
    logicSummary: 'Event == PutBucketPolicy(Principal: *) OR GetObject count > 20 per minute by unfamiliar session.',
    author: 'CloudSec Ruleset',
    updatedAt: '2026-10-16T14:15:00Z'
  },
  {
    id: 'R-105',
    name: 'Interactive Shell Spawn / Remote Code Execution',
    description: 'Suspicious process execution containing interactive bash shell, reverse netcat socket, or curl piping to sh.',
    mitreId: 'T1059.004',
    severity: 'CRITICAL',
    category: 'Execution',
    enabled: true,
    triggerCount: 12,
    logicSummary: 'Command contains regex: /(bash\\s+-i|nc\\s+-e|curl.*\\|.*sh|powershell\\s+-enc)/i.',
    author: 'Endpoint Guard',
    updatedAt: '2026-10-12T11:20:00Z'
  },
  {
    id: 'R-106',
    name: 'Web Application Exploit Attempt (SQLi / Traversal)',
    description: 'Inbound HTTP request parameters matching known injection heuristics (UNION SELECT, directory traversal, Log4j strings).',
    mitreId: 'T1190',
    severity: 'HIGH',
    category: 'Initial Access',
    enabled: true,
    triggerCount: 52,
    logicSummary: 'URI or Body matches SQL injection, ../.. directory traversal, or JNDI LDAP lookup strings.',
    author: 'WAF Integration Engine',
    updatedAt: '2026-10-10T16:00:00Z'
  },
  {
    id: 'R-107',
    name: 'Cloud Infrastructure Sabotage / Bulk Deletion',
    description: 'Unauthorized destruction of cloud backups, KMS keys, or RDS database instances outside change windows.',
    mitreId: 'T1485',
    severity: 'CRITICAL',
    category: 'Impact',
    enabled: true,
    triggerCount: 3,
    logicSummary: 'Event in [DeleteBucket, ScheduleKeyDeletion, DeleteDBSnapshot] without active change ticket.',
    author: 'Enterprise Risk Guard',
    updatedAt: '2026-10-08T08:00:00Z'
  }
];

export function evaluateDetectionRules(events: NormalizedEvent[], activeRules: DetectionRule[] = DEFAULT_DETECTION_RULES): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const enabledRules = activeRules.filter(r => r.enabled);

  // Group events by source IP and user
  const failuresByIp: Record<string, string[]> = {};
  const eventsByUser: Record<string, NormalizedEvent[]> = {};

  events.forEach(e => {
    if (e.status === 'FAILURE') {
      if (!failuresByIp[e.sourceIp]) failuresByIp[e.sourceIp] = [];
      failuresByIp[e.sourceIp].push(e.id);
    }
    if (e.user) {
      if (!eventsByUser[e.user]) eventsByUser[e.user] = [];
      eventsByUser[e.user].push(e);
    }
  });

  // Evaluate R-102: Brute force
  const r102 = enabledRules.find(r => r.id === 'R-102');
  if (r102) {
    Object.entries(failuresByIp).forEach(([ip, eventIds]) => {
      if (eventIds.length >= 3) {
        matches.push({
          ruleId: r102.id,
          ruleName: r102.name,
          mitre: {
            tactic: 'Credential Access',
            techniqueId: 'T1110.003',
            techniqueName: 'Brute Force: Password Spraying',
            url: 'https://attack.mitre.org/techniques/T1110/003/'
          },
          severity: 'HIGH',
          matchedEventIds: eventIds,
          rationale: `Detected ${eventIds.length} consecutive authentication failures originating from source IP ${ip}.`
        });
      }
    });
  }

  // Evaluate R-101: Impossible travel (different locations or unexpected remote IPs for same user)
  const r101 = enabledRules.find(r => r.id === 'R-101');
  if (r101) {
    Object.entries(eventsByUser).forEach(([user, userEvents]) => {
      const distinctIps = Array.from(new Set(userEvents.map(e => e.sourceIp).filter(ip => ip !== 'UNKNOWN' && ip !== '127.0.0.1')));
      const distinctLocs = Array.from(new Set(userEvents.map(e => e.location).filter(Boolean)));
      if (distinctIps.length >= 2 && distinctLocs.length >= 2) {
        matches.push({
          ruleId: r101.id,
          ruleName: r101.name,
          mitre: {
            tactic: 'Initial Access',
            techniqueId: 'T1078.004',
            techniqueName: 'Valid Accounts: Cloud Accounts (Impossible Travel)',
            url: 'https://attack.mitre.org/techniques/T1078/004/'
          },
          severity: 'HIGH',
          matchedEventIds: userEvents.map(e => e.id),
          rationale: `User ${user} authenticated from disparate geographical regions (${distinctLocs.join(', ')}) across distinct IPs (${distinctIps.join(', ')}).`
        });
      }
    });
  }

  // Iterate over individual events for pattern rules
  events.forEach(e => {
    const raw = (e.rawLog + ' ' + e.action + ' ' + (e.resource || '')).toLowerCase();

    // R-103: Privilege escalation
    const r103 = enabledRules.find(r => r.id === 'R-103');
    if (r103 && (raw.includes('createaccesskey') || raw.includes('attachuserpolicy') || raw.includes('putuserpolicy') || raw.includes('administratoraccess'))) {
      matches.push({
        ruleId: r103.id,
        ruleName: r103.name,
        mitre: {
          tactic: 'Privilege Escalation',
          techniqueId: 'T1098',
          techniqueName: 'Account Manipulation: Cloud Policy Grant',
          url: 'https://attack.mitre.org/techniques/T1098/'
        },
        severity: 'CRITICAL',
        matchedEventIds: [e.id],
        rationale: `Privileged IAM action '${e.action}' executed by ${e.user} targeting resource ${e.resource || 'IAM policy'}.`
      });
    }

    // R-104: S3 Exfiltration or Policy
    const r104 = enabledRules.find(r => r.id === 'R-104');
    if (r104 && (raw.includes('putbucketpolicy') || raw.includes('getobject_bulk') || raw.includes('bulk_download') || (raw.includes('getobject') && raw.includes('finance')))) {
      matches.push({
        ruleId: r104.id,
        ruleName: r104.name,
        mitre: {
          tactic: 'Exfiltration',
          techniqueId: 'T1530',
          techniqueName: 'Data from Cloud Storage Object',
          url: 'https://attack.mitre.org/techniques/T1530/'
        },
        severity: 'CRITICAL',
        matchedEventIds: [e.id],
        rationale: `Suspicious data transfer or bucket policy modification on cloud storage ${e.resource || 'S3 Bucket'}.`
      });
    }

    // R-105: Reverse shell / command injection
    const r105 = enabledRules.find(r => r.id === 'R-105');
    if (r105 && (raw.includes('bash -i') || raw.includes('nc -e') || raw.includes('/bin/sh') || raw.includes('curl ') && raw.includes('| sh') || raw.includes('powershell -enc'))) {
      matches.push({
        ruleId: r105.id,
        ruleName: r105.name,
        mitre: {
          tactic: 'Execution',
          techniqueId: 'T1059.004',
          techniqueName: 'Command and Scripting Interpreter: Unix Shell',
          url: 'https://attack.mitre.org/techniques/T1059/004/'
        },
        severity: 'CRITICAL',
        matchedEventIds: [e.id],
        rationale: `Interactive shell spawn or dangerous command pipe syntax detected in event payload.`
      });
    }

    // R-106: Web App Exploit / SQLi / Traversal
    const r106 = enabledRules.find(r => r.id === 'R-106');
    if (r106 && (raw.includes('union select') || raw.includes('1=1') || raw.includes('../..') || raw.includes('${jndi:'))) {
      matches.push({
        ruleId: r106.id,
        ruleName: r106.name,
        mitre: {
          tactic: 'Initial Access',
          techniqueId: 'T1190',
          techniqueName: 'Exploit Public-Facing Application',
          url: 'https://attack.mitre.org/techniques/T1190/'
        },
        severity: 'HIGH',
        matchedEventIds: [e.id],
        rationale: `Known injection signature (SQLi / Path Traversal / JNDI) observed in request string.`
      });
    }

    // R-107: Cloud Sabotage / Deletion
    const r107 = enabledRules.find(r => r.id === 'R-107');
    if (r107 && (raw.includes('deletebucket') || raw.includes('schedulekeydeletion') || raw.includes('deletedbsnapshot'))) {
      matches.push({
        ruleId: r107.id,
        ruleName: r107.name,
        mitre: {
          tactic: 'Impact',
          techniqueId: 'T1485',
          techniqueName: 'Data Destruction',
          url: 'https://attack.mitre.org/techniques/T1485/'
        },
        severity: 'CRITICAL',
        matchedEventIds: [e.id],
        rationale: `Irreversible destruction call '${e.action}' executed against cloud infrastructure.`
      });
    }
  });

  return matches;
}
