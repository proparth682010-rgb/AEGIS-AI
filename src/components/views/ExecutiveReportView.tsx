/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SecurityPostureReport } from '../../types';

interface ExecutiveReportViewProps {
  report: SecurityPostureReport | null;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading executive security posture report...
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const md = `# AEGIS AI — Executive Security Posture Briefing
Generated: ${report.timestamp}
Enterprise Posture Score: ${report.postureScore}/100 (${report.rating})

## Executive Summary
${report.executiveSummary}

## Key Metrics
- Active Incidents: ${report.activeIncidentsCount.total} (${report.activeIncidentsCount.critical} Critical, ${report.activeIncidentsCount.high} High)
- Mean Time to Detect (MTTD): ${report.meanTimeToDetectMinutes} min
- Mean Time to Contain (MTTC): ${report.meanTimeToContainMinutes} min
- MITRE ATT&CK Framework Coverage: ${report.mitreCoveragePercent}%

## Top Threat Vectors
${report.topThreatVectors.map(v => `- ${v.vector}: ${v.count} events (${v.percentage}%)`).join('\n')}

## Strategic Recommendations
${report.keyRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AEGIS-Executive-Report-${new Date().toISOString().substring(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            CISO EXECUTIVE POSTURE REPORT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Executive security briefing, risk ratings, threat vector distributions, and board-level remediation priorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="cyber-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-700/80 bg-slate-950/90 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
              CONFIDENTIAL · EXECUTIVE DEFENSE BRIEFING
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">Enterprise Cloud Security Posture</h3>
            <p className="text-xs text-slate-400 font-mono">Cycle Timestamp: {report.timestamp.replace('T', ' ').substring(0, 19)} UTC</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Posture Score</span>
              <span className="text-3xl font-bold font-mono text-emerald-400">{report.postureScore}</span>
              <span className="text-[10px] font-mono text-slate-500 block">/100 [{report.rating}]</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
            1. Executive Synthesis & Threat Landscape
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            {report.executiveSummary}
          </p>
        </div>

        {/* Operational Metrics Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
            2. Core Defense Metrics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Cases</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {report.activeIncidentsCount.total}
              </span>
              <span className="text-[10px] font-mono text-rose-400">
                {report.activeIncidentsCount.critical} Critical Priority
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Mean Time to Detect</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                {report.meanTimeToDetectMinutes} min
              </span>
              <span className="text-[10px] font-mono text-slate-400">Automated triage</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Mean Time to Contain</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {report.meanTimeToContainMinutes} min
              </span>
              <span className="text-[10px] font-mono text-slate-400">Dry-run proposals</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">MITRE ATT&CK Coverage</span>
              <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">
                {report.mitreCoveragePercent}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">Tactics monitored</span>
            </div>
          </div>
        </div>

        {/* Top Threat Vectors */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
            3. Identified Threat Vectors & Volume
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.topThreatVectors.map((vec, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{vec.vector}</span>
                  <span className="font-mono text-cyan-400">{vec.count} events ({vec.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${vec.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
            4. Strategic Priorities for Security Leadership
          </h4>
          <div className="space-y-2">
            {report.keyRecommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-200">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
