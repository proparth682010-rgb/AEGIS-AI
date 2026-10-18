export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'CONTAINING' | 'RESOLVED' | 'REOPENED';

export interface MitreMapping {
  tactic: string;
  techniqueId: string;
  techniqueName: string;
  url?: string;
}

export interface NormalizedEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp?: string;
  user: string;
  service: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED' | 'UNKNOWN';
  userAgent?: string;
  resource?: string;
  location?: string;
  rawLog: string;
  detectedThreats?: string[];
  severity: SeverityLevel;
  riskScore: number;
  synthetic?: boolean;
}

export interface RiskFactorBreakdown {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  rationale: string;
}

export interface RemediationItem {
  id: string;
  step: string;
  priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  playbookId?: string;
  automatedAvailable: boolean;
  commandSnippet?: string;
}

export interface ThreatAnalysisResult {
  id: string;
  timestamp: string;
  provider: 'gemini-3.8-flash' | 'deterministic-engine';
  providerLabel: string;
  threatCategory: string;
  severity: SeverityLevel;
  riskScore: number; // 0 - 100
  confidence: number; // 0 - 100
  uncertaintyRationale: string;
  summary: string;
  technicalEvidence: string[];
  aiInferences: string[];
  mitreTactics: MitreMapping[];
  riskFactors: RiskFactorBreakdown[];
  falsePositiveConsiderations: string[];
  remediationChecklist: RemediationItem[];
  potentialImpact: string;
  affectedAssets: string[];
  eventsAnalyzed: NormalizedEvent[];
}

export interface IncidentNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface IncidentAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  description: string;
  threatCategory: string;
  riskScore: number;
  confidence: number;
  mitreTactics: MitreMapping[];
  affectedAssets: string[];
  events: NormalizedEvent[];
  notes: IncidentNote[];
  auditHistory: IncidentAuditEntry[];
  appliedPlaybooks: string[];
  tags: string[];
  summary: string;
  remediationChecklist: RemediationItem[];
}

export interface PlaybookStep {
  id: string;
  name: string;
  actionType: 'AWS_IAM' | 'AWS_WAF' | 'AWS_S3' | 'AWS_EC2' | 'NOTIFICATION' | 'FORENSICS';
  description: string;
  commandPreview: string;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  output?: string;
  rollbackCommand?: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: 'IDENTITY' | 'NETWORK' | 'CLOUD_STORAGE' | 'ENDPOINT' | 'DATA_PROTECTION';
  targetThreat: string;
  riskReductionEstimate: number; // e.g. 45%
  requiresApproval: boolean;
  steps: PlaybookStep[];
  status: 'READY' | 'AWAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  lastRun?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'EC2' | 'S3' | 'IAM_ROLE' | 'KUBERNETES' | 'RDS' | 'API_GATEWAY';
  arnOrId: string;
  region: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'HEALTHY' | 'COMPROMISED_SUSPECT' | 'ISOLATED' | 'INVESTIGATING';
  associatedIncidents: string[];
  owner: string;
  ipAddress?: string;
  tags: Record<string, string>;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  mitreId: string;
  severity: SeverityLevel;
  category: string;
  enabled: boolean;
  triggerCount: number;
  logicSummary: string;
  author: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'INCIDENT' | 'PLAYBOOK' | 'ANALYSIS' | 'RULE' | 'SYSTEM';
  target: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'WARNING';
  details: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referencedEventIds?: string[];
  referencedIncidentIds?: string[];
  confidence?: number;
  isFallback?: boolean;
}

export interface SecurityPostureReport {
  timestamp: string;
  postureScore: number; // 0 - 100
  rating: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  activeIncidentsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  meanTimeToDetectMinutes: number;
  meanTimeToContainMinutes: number;
  topThreatVectors: { vector: string; count: number; percentage: number }[];
  highRiskAssets: Asset[];
  mitreCoveragePercent: number;
  executiveSummary: string;
  keyRecommendations: string[];
}
