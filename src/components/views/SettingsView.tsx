/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Server,
  Cloud,
  Terminal,
  RefreshCw,
  Lock
} from 'lucide-react';
import { api } from '../../lib/api';

interface SettingsViewProps {
  aiStatus: {
    activeProvider: string;
    model: string;
    configured: boolean;
  };
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onRefreshHealth: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  aiStatus,
  audioEnabled,
  onToggleAudio,
  onRefreshHealth
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestDiagnostics = async () => {
    setTestingHealth(true);
    try {
      const data = await api.getHealth();
      setHealthStatus(`OK: Server healthy. Provider: ${data.aiProvider.activeProvider} (${data.aiProvider.model}). Latency: ~${data.aiProvider.latencyEstimateMs}ms.`);
      await onRefreshHealth();
    } catch (err: any) {
      setHealthStatus('Warning: ' + err.message);
    } finally {
      setTestingHealth(false);
    }
  };

  const iamPolicyExample = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AegisCloudTrailReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudtrail:LookupEvents",
        "cloudtrail:GetEventSelectors"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AegisDefensiveContainment",
      "Effect": "Allow",
      "Action": [
        "iam:UpdateAccessKey",
        "iam:PutUserPolicy",
        "iam:DetachUserPolicy",
        "wafv2:UpdateIPSet",
        "wafv2:GetIPSet",
        "s3:PutPublicAccessBlock",
        "s3:DeleteBucketPolicy",
        "ec2:CreateSnapshot",
        "ec2:ModifyInstanceAttribute"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "us-west-2"]
        }
      }
    }
  ]
}`;

  const dockerfileExample = `FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src
RUN npm ci --only=production
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          SYSTEM DIAGNOSTICS & AWS READINESS
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AI engine health checks, enterprise SOC preferences, and AWS least-privilege deployment configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI Provider Diagnostics & SOC Settings */}
        <div className="space-y-6">
          {/* Card 1: AI Provider Status */}
          <div className="cyber-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">AI ENGINE DIAGNOSTICS</h3>
              </div>
              <button
                onClick={handleTestDiagnostics}
                disabled={testingHealth}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Active AI Model:</span>
                <span className="text-white font-bold">{aiStatus.model}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Provider Backend:</span>
                <span className="text-cyan-300">{aiStatus.activeProvider}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Server GEMINI_API_KEY:</span>
                <span className={aiStatus.configured ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                  {aiStatus.configured ? 'ATTACHED (Gemini 3.8 Flash)' : 'STANDBY (Deterministic Engine Active)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Prompt Injection Guard:</span>
                <span className="text-emerald-400 font-bold">STRICT FENCING ON</span>
              </div>
            </div>

            {healthStatus && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                {healthStatus}
              </div>
            )}
          </div>

          {/* Card 2: SOC Preferences */}
          <div className="cyber-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-3">
              SOC CONSOLE PREFERENCES
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Critical Alert Audio Tone</span>
                  <span className="text-[11px] text-slate-400">Synthesizes Web Audio alert beep for critical severity</span>
                </div>
                <button
                  onClick={onToggleAudio}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    audioEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {audioEnabled ? 'ENABLED' : 'MUTED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Default Incident Assignee</span>
                  <span className="text-[11px] text-slate-400">Automated case routing target</span>
                </div>
                <span className="text-xs font-mono text-cyan-300">Alex Vance (Lead SecOps)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AWS Deployment Readiness & IAM Least Privilege */}
        <div className="space-y-6">
          {/* Card 3: AWS Deployment Readiness */}
          <div className="cyber-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">FUTURE DEPLOYMENT NOTES</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                PORTABLE CONTAINER
              </span>
            </div>

            <p className="text-xs text-slate-300">
              These snippets are reference examples only. This demo has no production deployment configuration or AWS integration; review and narrow all permissions before adapting them.
            </p>

            {/* Dockerfile snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Example Dockerfile (not included in project):</span>
                <button
                  onClick={() => handleCopy(dockerfileExample, 'docker')}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                {dockerfileExample}
              </pre>
            </div>

            {/* IAM Policy snippet */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Example AWS Policy (review and narrow before use):</span>
                <button
                  onClick={() => handleCopy(iamPolicyExample, 'iam')}
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'iam' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300 overflow-x-auto max-h-48">
                {iamPolicyExample}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
