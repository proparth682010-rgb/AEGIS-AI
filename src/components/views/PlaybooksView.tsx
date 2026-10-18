/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlaySquare,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Check,
  Copy,
  Terminal,
  Clock,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Playbook, PlaybookStep } from '../../types';
import { api } from '../../lib/api';

interface PlaybooksViewProps {
  playbooks: Playbook[];
  onRefreshPlaybooks: () => Promise<void>;
  onRefreshAudit: () => Promise<void>;
}

export const PlaybooksView: React.FC<PlaybooksViewProps> = ({
  playbooks,
  onRefreshPlaybooks,
  onRefreshAudit
}) => {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(playbooks[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const activePlaybook = playbooks.find(p => p.id === selectedPlaybookId) || playbooks[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(id);
    setTimeout(() => setCopiedStepId(null), 2000);
  };

  const handleTriggerClick = () => {
    executePlaybookAction();
  };

  const executePlaybookAction = async () => {
    if (!activePlaybook) return;
    setIsExecuting(true);
    setExecutionOutput(null);

    try {
      const res = await api.executePlaybook(activePlaybook.id, true, false);
      setExecutionOutput(res.message);
      await onRefreshPlaybooks();
      await onRefreshAudit();
    } catch (err: any) {
      alert('Execution failed: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <PlaySquare className="w-5 h-5 text-emerald-400" />
            </div>
            <span>SAFE RESPONSE PLAYBOOKS</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Human-reviewed defensive workflows. This build supports dry-run simulation only; it has no cloud execution integration.
          </p>
        </div>

        {/* Dry-run vs Live Execution Toggle with Radiant Badges */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-md">
          <button
            type="button"
            aria-pressed="true"
            className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            Dry-Run Mode (Safe)
          </button>
          <button
            type="button"
            disabled
            title="Live cloud execution is not configured in this demo."
            className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 text-slate-600 cursor-not-allowed"
          >
            <Lock className="w-3 h-3" />
            <span>Live Action (Unavailable)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Catalog List & Execution Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Playbook Catalog with Category Highlights */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl overflow-hidden flex flex-col border-slate-800">
          <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider">Playbook Catalog ({playbooks.length})</span>
            <span className="text-amber-400 font-bold">SIMULATION ONLY</span>
          </div>

          <div className="divide-y divide-slate-800/80 p-2 space-y-1.5">
            {playbooks.map(pb => {
              const isSelected = activePlaybook?.id === pb.id;
              return (
                <div
                  key={pb.id}
                  onClick={() => {
                    setSelectedPlaybookId(pb.id);
                    setExecutionOutput(null);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : 'border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">{pb.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold">
                      {pb.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-white mt-1.5">{pb.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{pb.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">
                      Risk Reduction: ~{pb.riskReductionEstimate}%
                    </span>
                    <span className="text-slate-400 font-semibold">{pb.steps.length} Steps</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Playbook Steps & Execution Runner */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 space-y-5 border-emerald-500/30 shadow-xl">
          {activePlaybook ? (
            <>
              {/* Header */}
              <div className="space-y-2.5 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-cyan-400">{activePlaybook.id}</span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-800 text-cyan-300">
                      Target: {activePlaybook.targetThreat}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                    Blast Radius Containment: ~{activePlaybook.riskReductionEstimate}%
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">{activePlaybook.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{activePlaybook.description}</p>
              </div>

              {/* Execution Execution Banner */}
              {executionOutput && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-xs text-emerald-200 flex items-start gap-2.5 font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-emerald-300">Simulation complete:</strong>
                    <span>{executionOutput}</span>
                  </div>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
                  <span>EXECUTION STEP SEQUENCE:</span>
                  <span>{activePlaybook.steps.length} atomic operations</span>
                </div>

                {activePlaybook.steps.map((step, idx) => (
                  <div key={step.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 text-cyan-300 text-[10px] font-mono font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{step.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-700">
                        {step.actionType}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{step.description}</p>

                    {/* Command Preview with Colorful Highlighting */}
                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
                        {step.commandPreview}
                      </pre>
                      <button
                        onClick={() => handleCopy(step.commandPreview, step.id)}
                        className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy command"
                      >
                        {copiedStepId === step.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Step output if executed */}
                    {step.output && (
                      <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/60">
                        {step.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Run Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-400">
                  Mode: <strong className="text-cyan-400 font-bold">Dry-Run Simulation</strong>
                </div>

                <button
                  onClick={handleTriggerClick}
                  disabled={isExecuting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isExecuting
                      ? 'Executing Playbook Steps...'
                    : 'Run Dry-Run Simulation'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Select a playbook to review steps and execute containment.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
