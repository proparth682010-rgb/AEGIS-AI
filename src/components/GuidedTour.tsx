/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle2,
  Cpu,
  PlaySquare,
  Bot,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Terminal
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onLoadScenario
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to AEGIS AI SOC',
      subtitle: 'Autonomous Enterprise Guard & Intelligence System',
      description: 'AEGIS AI is a local cybersecurity demo. It correlates sample telemetry, calculates explainable risk, and simulates response playbooks without making cloud changes.',
      badge: 'Hackathon Overview',
      icon: Shield,
      highlights: [
        'Synthetic Demo: Built-in telemetry and incident data are examples, not live security signals.',
        'Hybrid AI Engine: Powered by Google Gemini 3.8 Flash with a high-grade deterministic fallback.',
        'Dry-Run Only: Live AWS actions are unavailable because no cloud execution integration is configured.'
      ],
      actionText: 'Explore Command Center',
      onAction: () => onSelectTab('dashboard')
    },
    {
      title: 'AI Threat Analyzer',
      subtitle: 'Safe Ingestion & Contextual Triage',
      description: 'Ingest raw AWS CloudTrail records, Kubernetes logs, Okta authentication events, or CSVs. AEGIS normalizes records, redacts secrets, defends against prompt injection, and maps attack techniques to MITRE ATT&CK.',
      badge: 'Core Feature',
      icon: Cpu,
      highlights: [
        'Strict evidence separation: Observed facts are kept distinct from probabilistic AI inferences.',
        'Explainable Risk Scoring: Transparent multi-factor formula based on severity, velocity, asset criticality, and privileges.',
        'One-Click Demo Scenarios: Pre-loaded synthetic attacks covering S3 exfiltration, impossible travel, and reverse shells.'
      ],
      actionText: 'Load Demo Attack & Analyze',
      onAction: () => {
        onSelectTab('analyzer');
        onLoadScenario('SCENARIO-AWS-EXFIL');
      }
    },
    {
      title: 'Incident Response Lifecycle',
      subtitle: 'End-to-End SOC Operations',
      description: 'Manage demo incidents across their lifecycle (OPEN → ACKNOWLEDGED → CONTAINING → RESOLVED). Add analyst notes, assign owners, inspect timelines, and compare incidents side-by-side. Changes are kept in memory and reset on restart.',
      badge: 'SOC Operations',
      icon: CheckCircle2,
      highlights: [
        'Audit Timeline: Transitions and notes create entries in the in-memory audit log.',
        'Side-by-Side Incident Comparison: Compare attack vectors across incidents to uncover multi-account campaigns.',
        'Asset Blast Radius: Understand affected customer databases, IAM roles, and clusters.'
      ],
      actionText: 'View Active Incidents',
      onAction: () => onSelectTab('incidents')
    },
    {
      title: 'Safe Response Playbooks',
      subtitle: 'Human-in-the-Loop Automation',
      description: 'Review simulated containment steps for credential revocation, WAF quarantine, or S3 lockdown. This demo cannot perform live AWS actions.',
      badge: 'Human-in-the-Loop',
      icon: PlaySquare,
      highlights: [
        'Dry-Run Simulation: Test command execution syntax and API payloads with zero live disruption.',
        'Dry-Run Only: Live execution is unavailable until a cloud integration is implemented.',
        'Rollback Procedures: Every playbook step includes automated rollback instructions.'
      ],
      actionText: 'Inspect Playbook Catalog',
      onAction: () => onSelectTab('playbooks')
    },
    {
      title: 'AI Security Copilot',
      subtitle: 'Defensive SOC Assistant with Prompt Injection Guardrails',
      description: 'Interact with an AI assistant grounded in your uploaded telemetry events. Ask for AWS CLI containment commands, investigate attack timelines, or generate CISO executive briefings.',
      badge: 'Defensive Copilot',
      icon: Bot,
      highlights: [
        'Event Grounding: Cites specific event IDs (#EV-XXXX) to prevent hallucinated claims.',
        'Prompt Injection Defense: Sanitizes adversarial jailbreaks in untrusted log streams.',
        'Secret Redaction: Automatically strips passwords, JWT tokens, and AWS access keys.'
      ],
      actionText: 'Open Copilot Chat',
      onAction: () => onSelectTab('copilot')
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {current.badge}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
              <Icon className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">{current.title}</h3>
              <p className="text-sm text-cyan-400 font-mono mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{current.description}</p>

          <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">Key Highlights</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {current.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer & Navigation Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {current.actionText && (
              <button
                onClick={() => {
                  current.onAction();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 hover:bg-cyan-900 transition-colors"
              >
                <span>{current.actionText}</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
