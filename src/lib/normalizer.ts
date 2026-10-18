/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedEvent, SeverityLevel } from '../types';
import { redactSecrets } from './sanitizer';

// Max safe payload: 5MB
export const MAX_SAFE_LOG_SIZE_BYTES = 5 * 1024 * 1024;

export interface ParseResult {
  events: NormalizedEvent[];
  errors: string[];
  totalRawLines: number;
  formatDetected: 'CloudTrail JSON' | 'JSON Array/NDJSON' | 'CSV' | 'Syslog / Web Log' | 'Generic Text';
}

function generateId(): string {
  return 'EV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function parseSecurityLogs(input: string): ParseResult {
  const errors: string[] = [];
  const events: NormalizedEvent[] = [];

  if (!input || input.trim().length === 0) {
    return {
      events: [],
      errors: ['Log input is empty. Please paste logs or upload a supported file.'],
      totalRawLines: 0,
      formatDetected: 'Generic Text'
    };
  }

  const byteLength = new Blob([input]).size;
  if (byteLength > MAX_SAFE_LOG_SIZE_BYTES) {
    return {
      events: [],
      errors: [`Payload size (${(byteLength / 1024 / 1024).toFixed(2)} MB) exceeds safe maximum limit of 5.0 MB. Please provide a smaller sample.`],
      totalRawLines: 0,
      formatDetected: 'Generic Text'
    };
  }

  const sanitizedInput = redactSecrets(input.trim());
  const lines = sanitizedInput.split(/\r?\n/).filter(l => l.trim().length > 0);

  // 1. Check if input is CloudTrail JSON with "Records"
  try {
    const parsed = JSON.parse(sanitizedInput);
    if (parsed && Array.isArray(parsed.Records)) {
      parsed.Records.forEach((rec: any, idx: number) => {
        const event = normalizeCloudTrailRecord(rec, idx);
        events.push(event);
      });
      return {
        events,
        errors,
        totalRawLines: lines.length,
        formatDetected: 'CloudTrail JSON'
      };
    } else if (Array.isArray(parsed)) {
      parsed.forEach((item: any, idx: number) => {
        events.push(normalizeGenericJsonObject(item, idx));
      });
      return {
        events,
        errors,
        totalRawLines: lines.length,
        formatDetected: 'JSON Array/NDJSON'
      };
    } else if (typeof parsed === 'object') {
      events.push(normalizeGenericJsonObject(parsed, 0));
      return {
        events,
        errors,
        totalRawLines: lines.length,
        formatDetected: 'JSON Array/NDJSON'
      };
    }
  } catch (e) {
    // Not a single valid JSON document; proceed to NDJSON, CSV, or text
  }

  // 2. Check if every line is JSON (NDJSON)
  let isNdjson = lines.length > 0;
  const ndjsonEvents: NormalizedEvent[] = [];
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].trim();
    if (!line.startsWith('{') || !line.endsWith('}')) {
      isNdjson = false;
      break;
    }
    try {
      JSON.parse(line);
    } catch {
      isNdjson = false;
      break;
    }
  }

  if (isNdjson) {
    lines.forEach((line, idx) => {
      try {
        const obj = JSON.parse(line);
        ndjsonEvents.push(normalizeGenericJsonObject(obj, idx));
      } catch (err) {
        errors.push(`Line ${idx + 1}: Malformed JSON line skipped.`);
      }
    });
    if (ndjsonEvents.length > 0) {
      return {
        events: ndjsonEvents,
        errors,
        totalRawLines: lines.length,
        formatDetected: 'JSON Array/NDJSON'
      };
    }
  }

  // 3. Check CSV format (comma separated with common security header names)
  if (lines.length > 1 && lines[0].includes(',')) {
    const headerLine = lines[0].toLowerCase();
    const commonHeaders = ['timestamp', 'time', 'ip', 'source', 'src_ip', 'user', 'action', 'event', 'status'];
    const matchCount = commonHeaders.filter(h => headerLine.includes(h)).length;

    if (matchCount >= 2) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length >= 2) {
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });
          events.push(normalizeCsvRow(rowObj, i, lines[i]));
        }
      }
      if (events.length > 0) {
        return {
          events,
          errors,
          totalRawLines: lines.length,
          formatDetected: 'CSV'
        };
      }
    }
  }

  // 4. Fallback: Parse line-by-line as Syslog or Common Log Format
  lines.forEach((line, idx) => {
    const ev = normalizeTextLine(line, idx);
    events.push(ev);
  });

  return {
    events,
    errors,
    totalRawLines: lines.length,
    formatDetected: events.some(e => e.sourceIp !== 'UNKNOWN') ? 'Syslog / Web Log' : 'Generic Text'
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeCloudTrailRecord(rec: any, index: number): NormalizedEvent {
  const user = rec.userIdentity?.userName || rec.userIdentity?.arn || rec.userIdentity?.principalId || 'AWS_SERVICE';
  const sourceIp = rec.sourceIPAddress || 'AWS_INTERNAL';
  const action = rec.eventName || 'UNKNOWN_API_CALL';
  const service = rec.eventSource || 'aws.cloud';
  const status = rec.errorCode || rec.errorMessage ? 'FAILURE' : 'SUCCESS';
  const timestamp = rec.eventTime || new Date().toISOString();
  const resource = rec.requestParameters?.bucketName || rec.requestParameters?.instanceId || rec.resources?.[0]?.ARN || 'AWS_RESOURCE';

  return {
    id: generateId(),
    timestamp,
    sourceIp,
    user,
    service,
    action,
    status,
    resource,
    userAgent: rec.userAgent || 'aws-sdk',
    location: rec.awsRegion || 'us-east-1',
    rawLog: JSON.stringify(rec, null, 2),
    severity: determineInitialSeverity(action, status),
    riskScore: determineInitialRisk(action, status)
  };
}

function normalizeGenericJsonObject(obj: any, index: number): NormalizedEvent {
  const timestamp = obj.timestamp || obj.time || obj['@timestamp'] || obj.date || new Date().toISOString();
  const sourceIp = obj.source_ip || obj.sourceIPAddress || obj.src_ip || obj.client_ip || obj.ip || '127.0.0.1';
  const destIp = obj.destination_ip || obj.dest_ip || obj.target_ip;
  const user = obj.user || obj.username || obj.actor || obj.principal || obj.userIdentity?.userName || 'system';
  const action = obj.action || obj.event || obj.eventName || obj.method || obj.operation || 'ACCESS';
  const service = obj.service || obj.app || obj.component || obj.source || 'enterprise-core';
  const statusStr = String(obj.status || obj.result || obj.code || '').toUpperCase();
  const status = (statusStr.includes('FAIL') || statusStr.includes('ERR') || statusStr === '401' || statusStr === '403')
    ? 'FAILURE'
    : (statusStr.includes('BLOCK') ? 'BLOCKED' : 'SUCCESS');
  const userAgent = obj.userAgent || obj.user_agent || obj.client;
  const resource = obj.resource || obj.path || obj.target || obj.uri;
  const location = obj.location || obj.region || obj.geo;

  return {
    id: generateId(),
    timestamp,
    sourceIp,
    destinationIp: destIp,
    user,
    service,
    action,
    status,
    userAgent,
    resource,
    location,
    rawLog: JSON.stringify(obj, null, 2),
    severity: determineInitialSeverity(action, status),
    riskScore: determineInitialRisk(action, status)
  };
}

function normalizeCsvRow(row: Record<string, string>, index: number, rawLine: string): NormalizedEvent {
  const findVal = (keys: string[]): string => {
    for (const k of keys) {
      const match = Object.keys(row).find(rk => rk.toLowerCase().includes(k));
      if (match && row[match]) return row[match];
    }
    return '';
  };

  const timestamp = findVal(['time', 'date']) || new Date().toISOString();
  const sourceIp = findVal(['src', 'source_ip', 'ip', 'client']) || '10.0.0.' + (index % 254);
  const destIp = findVal(['dest', 'target_ip']);
  const user = findVal(['user', 'actor', 'account', 'email']) || 'analyst@enterprise.internal';
  const action = findVal(['action', 'event', 'method', 'command']) || 'INVOKE';
  const service = findVal(['service', 'app', 'system']) || 'cloud-service';
  const statusRaw = findVal(['status', 'result', 'code']).toUpperCase();
  const status = (statusRaw.includes('FAIL') || statusRaw.includes('ERR') || statusRaw === '401' || statusRaw === '403') ? 'FAILURE' : 'SUCCESS';

  return {
    id: generateId(),
    timestamp,
    sourceIp,
    destinationIp: destIp,
    user,
    service,
    action,
    status,
    rawLog: rawLine,
    severity: determineInitialSeverity(action, status),
    riskScore: determineInitialRisk(action, status)
  };
}

function normalizeTextLine(line: string, index: number): NormalizedEvent {
  // Regex to extract IP addresses
  const ipMatch = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  const sourceIp = ipMatch ? ipMatch[0] : 'UNKNOWN';

  // Extract HTTP status or keyword
  let status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'UNKNOWN' = 'SUCCESS';
  if (/\b(401|403|500|failed|failure|denied|unauthorized|reject|refused)\b/i.test(line)) {
    status = 'FAILURE';
  } else if (/\b(blocked|dropped|quarantined)\b/i.test(line)) {
    status = 'BLOCKED';
  }

  // Extract timestamp if available
  const dateMatch = line.match(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?\b/);
  const timestamp = dateMatch ? dateMatch[0] : new Date().toISOString();

  // Extract user if user= or for user
  const userMatch = line.match(/user(?:name)?[:= ]+([a-zA-Z0-9._-]+)/i);
  const user = userMatch ? userMatch[1] : (line.includes('root') ? 'root' : 'unknown-user');

  // Extract action keywords
  let action = 'LOG_ENTRY';
  if (/sudo\s/i.test(line)) action = 'SUDO_EXECUTION';
  else if (/login|auth/i.test(line)) action = 'AUTHENTICATION';
  else if (/exec|bash|sh|cmd|powershell/i.test(line)) action = 'COMMAND_EXECUTION';
  else if (/get|post|put|delete/i.test(line)) action = 'HTTP_REQUEST';
  else if (/ssh/i.test(line)) action = 'SSH_SESSION';

  return {
    id: generateId(),
    timestamp,
    sourceIp,
    user,
    service: 'syslog-endpoint',
    action,
    status,
    rawLog: line,
    severity: determineInitialSeverity(action, status),
    riskScore: determineInitialRisk(action, status)
  };
}

function determineInitialSeverity(action: string, status: string): SeverityLevel {
  const act = action.toUpperCase();
  if (act.includes('PUTBUCKETPOLICY') || act.includes('ATTACHUSERPOLICY') || act.includes('REVERSESHELL') || act.includes('DELETEBUCKET') || act.includes('KMS_DISABLE')) {
    return 'CRITICAL';
  }
  if (act.includes('CREATEACCESSKEY') || act.includes('SUDO') || (act.includes('AUTH') && status === 'FAILURE') || act.includes('GETOBJECT_BULK')) {
    return 'HIGH';
  }
  if (act.includes('LOGIN') || act.includes('ASSUMEROLE') || status === 'FAILURE') {
    return 'MEDIUM';
  }
  return 'LOW';
}

function determineInitialRisk(action: string, status: string): number {
  const sev = determineInitialSeverity(action, status);
  if (sev === 'CRITICAL') return 88;
  if (sev === 'HIGH') return 72;
  if (sev === 'MEDIUM') return 52;
  return 20;
}
