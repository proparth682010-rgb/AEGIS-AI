/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Cpu,
  Upload,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ChevronDown,
  Terminal,
  ExternalLink,
  Zap,
  Flame,
  Shield
} from 'lucide-react';
import { ThreatAnalysisResult, NormalizedEvent } from '../../types';
import { DEMO_SCENARIOS, DemoScenario } from '../../lib/demoData';
import { api } from '../../lib/api';
import { ActiveTab } from '../Sidebar';

interface ThreatAnalyzerViewProps {
  onEscalateIncident: (analysis: ThreatAnalysisResult) => void;
  onSendToCopilot: (analysis: ThreatAnalysisResult) => void;
  onSelectTab: (tab: ActiveTab) => void;
  activeAnalysis: ThreatAnalysisResult | null;
  setActiveAnalysis: (analysis: ThreatAnalysisResult | null) => void;
}

export const ThreatAnalyzerView: React.FC<ThreatAnalyzerViewProps> = ({
  onEscalateIncident,
  onSendToCopilot,
  onSelectTab,
  activeAnalysis,
  setActiveAnalysis
}) => {
  const [logInput, setLogInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'evidence' | 'risk' | 'mitre' | 'events' | 'remediation' | 'falsepositives'>('evidence');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectScenario = (sc: DemoScenario) => {
    setLogInput(sc.rawLogs);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`File exceeds 5MB maximum safe upload limit (${(file.size / 1024 / 1024).toFixed(2)} MB). Please provide a smaller sample.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setLogInput(content);
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file contents.');
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!logInput || logInput.trim().length === 0) {
      setErrorMessage('Please paste or upload security telemetry before running analysis.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await api.analyzeThreat(logInput);
      setActiveAnalysis(result);
      if (result.eventsAnalyzed.length > 0) {
        setSelectedEvent(result.eventsAnalyzed[0]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Threat analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = () => {
    if (!activeAnalysis) return;
    const blob = new Blob([JSON.stringify(activeAnalysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEGIS-Threat-Analysis-${activeAnalysis.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!activeAnalysis || !activeAnalysis.eventsAnalyzed) return;
    const headers = ['ID', 'Timestamp', 'Source IP', 'User', 'Action', 'Status', 'Resource', 'Severity', 'Risk Score'];
    const rows = activeAnalysis.eventsAnalyzed.map(e => [
      e.id,
      e.timestamp,
      e.sourceIp,
      e.user,
      e.action,
      e.status,
      e.resource || '',
      e.severity,
      e.riskScore
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEGIS-Events-${activeAnalysis.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header with Colorful Accents */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Cpu className="w-5 h-5 text-purple-300" />
            </div>
            <span>AI THREAT ANALYZER</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Multi-source log normalizer, explainable risk scoring, and contextual Gemini 3.8 Flash attack correlation.
          </p>
        </div>

        {activeAnalysis && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEscalateIncident(activeAnalysis)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:scale-[1.02]"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Escalate to Incident</span>
            </button>
            <button
              onClick={() => onSendToCopilot(activeAnalysis)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border border-cyan-400/60 text-cyan-300 hover:border-cyan-300 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask Copilot</span>
            </button>
          </div>
        )}
      </div>

      {/* Ingestion Panel with Colorful Preset Cards */}
      <div className="cyber-panel rounded-2xl p-5 space-y-5 border-cyan-500/30">
        {/* Preset Demo Scenarios Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Quick Load Synthetic Scenarios (1-Click Evaluation):
            </span>
            <span className="text-[10px] font-mono text-slate-400">Select pre-built telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_SCENARIOS.map((sc, sIdx) => {
              const borderStyles = [
                'border-t-4 border-t-rose-500 hover:border-rose-400 shadow-rose-950/30',
                'border-t-4 border-t-cyan-400 hover:border-cyan-300 shadow-cyan-950/30',
                'border-t-4 border-t-fuchsia-500 hover:border-fuchsia-400 shadow-fuchsia-950/30',
                'border-t-4 border-t-emerald-400 hover:border-emerald-300 shadow-emerald-950/30'
              ];
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc)}
                  className={`p-3 rounded-xl text-left border border-slate-800 bg-slate-950/80 hover:bg-slate-900/90 transition-all group shadow-md hover:scale-[1.02] ${borderStyles[sIdx % 4]}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold ${
                        sc.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/60'
                          : sc.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/60'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-600/60'
                      }`}
                    >
                      {sc.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sc.logFormat}</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-2 line-clamp-1 group-hover:text-cyan-300">
                    {sc.title}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Textarea & Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-mono font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Raw Security Telemetry (JSON, CloudTrail, CSV, Syslog):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,.log,.txt,.csv"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-500/50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload File (Max 5MB)</span>
              </button>
              {logInput && (
                <button
                  onClick={() => setLogInput('')}
                  className="text-xs text-rose-400 hover:underline font-mono"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={6}
            value={logInput}
            onChange={e => setLogInput(e.target.value)}
            placeholder="Paste raw log lines, AWS CloudTrail records, Okta authentication logs, or CSV data here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 shadow-inner"
          />
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500 text-xs text-rose-200 flex items-center gap-2.5 font-mono shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Input is sanitized: secrets are redacted and fenced from model instructions.
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !logInput.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isAnalyzing || !logInput.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Correlating Telemetry & Risk...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Run AI Defensive Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Output with Vibrant Visual Cards */}
      {activeAnalysis && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Result Card with Gradient Left Border */}
          <div className={`cyber-panel rounded-2xl p-6 space-y-5 border-l-4 ${
            activeAnalysis.severity === 'CRITICAL'
              ? 'border-l-rose-500 border-rose-500/30 shadow-rose-950/40'
              : activeAnalysis.severity === 'HIGH'
              ? 'border-l-amber-500 border-amber-500/30'
              : 'border-l-emerald-400 border-emerald-500/30'
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 text-xs font-mono font-extrabold rounded-full ${
                      activeAnalysis.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : activeAnalysis.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    }`}
                  >
                    {activeAnalysis.severity}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">ID: {activeAnalysis.id}</span>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-slate-900 border border-cyan-800 text-cyan-300">
                    Engine: {activeAnalysis.providerLabel}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{activeAnalysis.threatCategory}</h3>
              </div>

              {/* Colorful Score Gauges */}
              <div className="flex items-center gap-4 bg-slate-950/90 p-4 rounded-xl border border-slate-800 shadow-lg">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Risk Score</span>
                  <span
                    className={`text-3xl font-extrabold font-mono ${
                      activeAnalysis.riskScore >= 75
                        ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : activeAnalysis.riskScore >= 50
                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activeAnalysis.riskScore}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </span>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Confidence</span>
                  <span className="text-3xl font-extrabold font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                    {activeAnalysis.confidence}%
                  </span>
                </div>

                <div className="h-10 w-px bg-slate-800" />

                <div className="text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Events</span>
                  <span className="text-3xl font-extrabold font-mono text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                    {activeAnalysis.eventsAnalyzed.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Summary in Styled Box */}
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-medium">
              {activeAnalysis.summary}
            </p>

            {/* Potential Impact */}
            <div className="flex items-start gap-2.5 text-xs text-amber-200 bg-gradient-to-r from-amber-950/40 via-slate-950/60 to-amber-950/20 p-3.5 rounded-xl border border-amber-600/40 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>Potential Business Impact:</strong> {activeAnalysis.potentialImpact}
              </span>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-800/60 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Detailed Tabs Header with Colorful Active Pills */}
          <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto text-xs font-mono pb-1">
            {[
              { id: 'evidence', label: 'Observed Facts vs AI Inferences', color: 'border-cyan-400 text-cyan-300' },
              { id: 'risk', label: 'Risk Factor Breakdown', color: 'border-amber-400 text-amber-300' },
              { id: 'mitre', label: `MITRE ATT&CK (${activeAnalysis.mitreTactics.length})`, color: 'border-purple-400 text-purple-300' },
              { id: 'remediation', label: `Remediation (${activeAnalysis.remediationChecklist.length})`, color: 'border-emerald-400 text-emerald-300' },
              { id: 'events', label: `Normalized Events (${activeAnalysis.eventsAnalyzed.length})`, color: 'border-sky-400 text-sky-300' },
              { id: 'falsepositives', label: 'False Positive Analysis', color: 'border-orange-400 text-orange-300' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-bold rounded-xl border transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.color} bg-slate-900 shadow-sm shadow-cyan-950`
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Evidence vs Inferences (Mandatory Separation!) */}
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left: Hard Technical Evidence (Observed facts in Electric Cyan) */}
              <div className="cyber-panel p-5 rounded-2xl space-y-3.5 border-cyan-500/40">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                  <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">
                    Observed Technical Evidence (Hard Facts)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Verified parameters extracted directly from telemetry without conjecture.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {activeAnalysis.technicalEvidence.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-cyan-900/40 font-mono shadow-sm">
                      <span className="text-cyan-400 font-bold shrink-0">#{idx + 1}</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: AI Inferences (Probabilistic Deductions in Radiant Purple) */}
              <div className="cyber-panel p-5 rounded-2xl space-y-3.5 border-purple-500/40">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                    AI Inferences (Probabilistic Hypotheses)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Contextual deductions from Gemini 3.8 Flash. Subject to analyst verification.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  {activeAnalysis.aiInferences.map((inf, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-purple-900/40 shadow-sm">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{inf}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-[11px] text-slate-400 font-mono p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <strong className="text-purple-300">Uncertainty Bound:</strong> {activeAnalysis.uncertaintyRationale}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Explainable Risk Breakdown */}
          {activeTab === 'risk' && (
            <div className="cyber-panel p-6 rounded-2xl space-y-5 border-amber-500/30">
              <div>
                <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  EXPLAINABLE MULTI-FACTOR RISK SCORE FORMULA
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Transparent mathematical formula calculating total risk from four configurable enterprise factors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAnalysis.riskFactors.map((rf, idx) => {
                  const barGradients = [
                    'from-cyan-400 to-sky-400',
                    'from-rose-500 to-pink-500',
                    'from-amber-400 to-orange-400',
                    'from-purple-400 to-fuchsia-400'
                  ];
                  return (
                    <div key={idx} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{rf.name}</span>
                        <span className="text-xs font-mono font-extrabold text-cyan-300">
                          {rf.score}/100 <span className="text-slate-400 font-normal">({rf.weightedScore} pts)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div className={`h-full rounded-full bg-gradient-to-r ${barGradients[idx % 4]}`} style={{ width: `${rf.score}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{rf.rationale}</p>
                      <div className="text-[10px] text-slate-400 font-mono">Weight Allocation: {Math.round(rf.weight * 100)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: MITRE ATT&CK */}
          {activeTab === 'mitre' && (
            <div className="cyber-panel p-6 rounded-2xl space-y-5 border-purple-500/30">
              <div>
                <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  MAPPED MITRE ATT&CK TECHNIQUES
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Correlated adversary tactics, techniques, and procedures (TTPs) detected in the telemetry stream.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {activeAnalysis.mitreTactics.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-900/40 space-y-2 shadow-sm hover:border-purple-400/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        {m.tactic}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">{m.techniqueId}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{m.techniqueName}</div>
                    <a
                      href={`https://attack.mitre.org/techniques/${m.techniqueId.replace('.', '/')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 pt-1"
                    >
                      <span>MITRE ATT&CK Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Remediation Checklist */}
          {activeTab === 'remediation' && (
            <div className="cyber-panel p-6 rounded-2xl space-y-5 border-emerald-500/30">
              <div>
                <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  RECOMMENDED DEFENSIVE REMEDIATION CHECKLIST
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Prioritized defensive suggestions. Playbooks can be simulated in dry-run mode; live cloud execution is unavailable.
                </p>
              </div>

              <div className="space-y-3">
                {activeAnalysis.remediationChecklist.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                            item.priority === 'IMMEDIATE'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                              : 'bg-amber-950 text-amber-300 border border-amber-500'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">Step {idx + 1}</span>
                      </div>
                      {item.playbookId && (
                        <button
                          onClick={() => onSelectTab('playbooks')}
                          className="text-xs text-cyan-400 hover:underline font-mono font-bold flex items-center gap-1"
                        >
                          Launch Playbook ({item.playbookId}) <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{item.step}</p>

                    {item.commandSnippet && (
                      <div className="relative mt-2">
                        <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
                          {item.commandSnippet}
                        </pre>
                        <button
                          onClick={() => handleCopySnippet(item.commandSnippet!, item.id)}
                          className="absolute top-2.5 right-2.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Copy command"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Normalized Events */}
          {activeTab === 'events' && (
            <div className="cyber-panel p-6 rounded-2xl space-y-5 border-sky-500/30">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                NORMALIZED SECURITY EVENTS ({activeAnalysis.eventsAnalyzed.length})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Event ID</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Source IP</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {activeAnalysis.eventsAnalyzed.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-900/50">
                        <td className="p-3 font-bold text-cyan-400">{ev.id}</td>
                        <td className="p-3 text-slate-400">{ev.timestamp.replace('T', ' ').substring(0, 19)}</td>
                        <td className="p-3 text-slate-300">{ev.sourceIp}</td>
                        <td className="p-3 text-slate-200">{ev.user}</td>
                        <td className="p-3 font-bold text-white">{ev.action}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ev.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60'
                                : 'bg-rose-950 text-rose-300 border border-rose-600/60'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedEvent(ev)}
                            className="text-cyan-400 hover:underline text-xs font-bold"
                          >
                            Raw Telemetry
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedEvent && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-300 font-bold">Raw Telemetry: {selectedEvent.id}</span>
                    <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white">Close</button>
                  </div>
                  <pre className="p-3 rounded-lg bg-black font-mono text-[11px] text-cyan-200 overflow-x-auto max-h-48">
                    {selectedEvent.rawLog}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: False Positives */}
          {activeTab === 'falsepositives' && (
            <div className="cyber-panel p-6 rounded-2xl space-y-5 border-orange-500/30">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_#fb923c]" />
                FALSE POSITIVE & BENIGN CONSIDERATIONS
              </h4>
              <div className="space-y-3">
                {activeAnalysis.falsePositiveConsiderations.map((fp, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{fp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
