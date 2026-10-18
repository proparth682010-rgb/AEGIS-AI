/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Incident,
  Playbook,
  Asset,
  AuditEntry,
  DetectionRule,
  ThreatAnalysisResult,
  SecurityPostureReport,
  CopilotMessage,
  NormalizedEvent
} from '../types';
import { DEMO_SCENARIOS, INITIAL_INCIDENTS, INITIAL_PLAYBOOKS, INITIAL_ASSETS, INITIAL_AUDIT_LOGS } from './demoData';
import { DEFAULT_DETECTION_RULES } from './rulesEngine';
import { runDeterministicAnalysis, generateDeterministicCopilotResponse } from './fallbackAi';
import { parseSecurityLogs } from './normalizer';

const API_BASE = '';

async function safeFetch<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || errJson.message || `Request failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    if (fallbackData !== undefined) {
      console.warn(`[AEGIS API] Using client-side fallback for ${url}:`, err.message);
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  async getHealth() {
    return safeFetch('/api/health', undefined, {
      status: 'HEALTHY',
      system: 'AEGIS AI Defensive SOC Engine (Client Standby)',
      timestamp: new Date().toISOString(),
      aiProvider: {
        activeProvider: 'Deterministic Heuristic Fallback',
        model: 'Local Correlator & Bayesian Rules',
        configured: false,
        keyStatus: 'STANDBY_MODE',
        latencyEstimateMs: 10
      },
      uptimeSeconds: 120,
      nodeVersion: 'v22.x'
    });
  },

  async analyzeThreat(rawLogs: string): Promise<ThreatAnalysisResult> {
    try {
      const res = await fetch('/api/threats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLogs })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn('[AEGIS API] Backend analysis endpoint failed, falling back to client-side deterministic analyzer:', err);
      const parsed = parseSecurityLogs(rawLogs);
      return runDeterministicAnalysis(parsed.events);
    }
  },

  async sendCopilotChat(query: string, contextEvents: NormalizedEvent[] = [], lastAnalysis?: ThreatAnalysisResult): Promise<CopilotMessage> {
    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, contextEvents, lastAnalysis })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      return generateDeterministicCopilotResponse(query, contextEvents, lastAnalysis);
    }
  },

  async getIncidents(): Promise<Incident[]> {
    return safeFetch('/api/incidents', undefined, INITIAL_INCIDENTS);
  },

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    return safeFetch('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  },

  async transitionIncident(id: string, status: string, note?: string): Promise<Incident> {
    return safeFetch(`/api/incidents/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ status, note })
    });
  },

  async assignIncident(id: string, assignedTo: string): Promise<Incident> {
    return safeFetch(`/api/incidents/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo })
    });
  },

  async addIncidentNote(id: string, content: string, author: string = 'Security Analyst') {
    return safeFetch(`/api/incidents/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, author })
    });
  },

  async getPlaybooks(): Promise<Playbook[]> {
    return safeFetch('/api/playbooks', undefined, INITIAL_PLAYBOOKS);
  },

  async executePlaybook(id: string, dryRun: boolean, analystApproved: boolean): Promise<any> {
    return safeFetch(`/api/playbooks/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ dryRun, analystApproved })
    });
  },

  async getAuditLogs(): Promise<AuditEntry[]> {
    return safeFetch('/api/audit', undefined, INITIAL_AUDIT_LOGS);
  },

  async getAssets(): Promise<Asset[]> {
    return safeFetch('/api/assets', undefined, INITIAL_ASSETS);
  },

  async getRules(): Promise<DetectionRule[]> {
    return safeFetch('/api/rules', undefined, DEFAULT_DETECTION_RULES);
  },

  async toggleRule(id: string): Promise<DetectionRule> {
    return safeFetch(`/api/rules/${id}/toggle`, {
      method: 'POST'
    });
  },

  async getExecutiveReport(): Promise<SecurityPostureReport> {
    return safeFetch('/api/reports/executive', undefined, {
      timestamp: new Date().toISOString(),
      postureScore: 82,
      rating: 'GOOD',
      activeIncidentsCount: { critical: 2, high: 1, medium: 0, low: 0, total: 3 },
      meanTimeToDetectMinutes: 3.4,
      meanTimeToContainMinutes: 11.2,
      topThreatVectors: [
        { vector: 'Cloud Storage & Public S3 Policies', count: 9, percentage: 38 },
        { vector: 'IAM Credential Leak & Escalation', count: 7, percentage: 29 },
        { vector: 'Container Ingress RCE', count: 5, percentage: 21 },
        { vector: 'Impossible Travel', count: 3, percentage: 12 }
      ],
      highRiskAssets: INITIAL_ASSETS.filter(a => a.status !== 'HEALTHY'),
      mitreCoveragePercent: 84,
      executiveSummary: 'Enterprise posture score is 82/100 (GOOD). 3 active incidents monitored in automated response workflow.',
      keyRecommendations: [
        'Enforce Service Control Policy (SCP) blocking s3:PutBucketPolicy with Public Principal.',
        'Transition developer CLI access to temporary IAM Identity Center (SSO) credentials.',
        'Apply AWS WAF rate-limiting rule on public Kubernetes API gateway ingress.'
      ]
    });
  },

  async getDemoScenarios() {
    return safeFetch('/api/demo/scenarios', undefined, DEMO_SCENARIOS);
  },

  async resetDemo() {
    return safeFetch('/api/demo/reset', { method: 'POST' }, { message: 'Reset locally' });
  }
};
