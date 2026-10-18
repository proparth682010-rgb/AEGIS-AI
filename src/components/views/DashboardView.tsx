/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Server,
  PlaySquare,
  Activity,
  ChevronRight,
  Radio,
  Zap,
  Crosshair
} from 'lucide-react';
import { Incident, Asset, SecurityPostureReport } from '../../types';
import { ActiveTab } from '../Sidebar';

interface DashboardViewProps {
  incidents: Incident[];
  assets: Asset[];
  report: SecurityPostureReport | null;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectIncident: (id: string) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  incidents,
  assets,
  report,
  onSelectTab,
  onSelectIncident,
  onLoadScenario
}) => {
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = activeIncidents.filter(i => i.severity === 'HIGH').length;
  const postureScore = report?.postureScore ?? 82;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner: Colorful Live Cyber Defense Header */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-purple-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold text-white tracking-wider font-mono">
                  COMMAND CENTER <span className="text-cyan-400">·</span> DEFENSIVE OPERATIONS
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-mono font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Unified heuristic correlation across AWS CloudTrail, VPC Flow Logs, EKS clusters, and Okta Identity Center.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLoadScenario('SCENARIO-AWS-EXFIL');
                onSelectTab('analyzer');
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-300 hover:from-cyan-300 hover:to-sky-300 text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Launch Demo Attack Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row with Vibrant Gradients & Glowing Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents (Crimson Glow) */}
        <div
          onClick={() => onSelectTab('incidents')}
          className="cyber-panel cyber-panel-hover p-4 rounded-2xl cursor-pointer group relative overflow-hidden border-rose-500/30 hover:border-rose-400/60"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-rose-300 uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{activeIncidents.length}</span>
            <span className="text-xs text-rose-400 font-mono font-bold">
              ({criticalCount} Critical, {highCount} High)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
            <span>Human-assigned triage</span>
            <span className="text-rose-400 group-hover:translate-x-1 transition-transform flex items-center font-bold">
              Inspect <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Enterprise Posture Score (Emerald Glow) */}
        <div
          onClick={() => onSelectTab('report')}
          className="cyber-panel cyber-panel-hover p-4 rounded-2xl cursor-pointer group relative overflow-hidden border-emerald-500/30 hover:border-emerald-400/60"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-300 uppercase tracking-wider">Security Posture</span>
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{postureScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100 ({report?.rating || 'GOOD'})</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
            <span>Coverage: 84% MITRE</span>
            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center font-bold">
              Report <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Mean Time to Contain (Cyan Glow) */}
        <div className="cyber-panel p-4 rounded-2xl relative overflow-hidden border-cyan-500/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">MTTC (Containment)</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">11.2</span>
            <span className="text-xs text-slate-400 font-mono">min</span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center ml-auto">
              ↓ 18% vs avg
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
            <span>Playbook dry-runs active</span>
            <span className="text-cyan-400 font-bold">Optimal</span>
          </div>
        </div>

        {/* Card 4: Monitored Cloud Assets (Purple Glow) */}
        <div
          onClick={() => onSelectTab('assets')}
          className="cyber-panel cyber-panel-hover p-4 rounded-2xl cursor-pointer group relative overflow-hidden border-purple-500/30 hover:border-purple-400/60"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider">Monitored Assets</span>
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Server className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">{assets.length}</span>
            <span className="text-xs text-rose-400 font-mono font-bold">
              ({assets.filter(a => a.status !== 'HEALTHY').length} Isolated)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
            <span>S3, EKS, RDS, IAM</span>
            <span className="text-purple-400 group-hover:translate-x-1 transition-transform flex items-center font-bold">
              Inventory <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Incident Feed + Animated Threat Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Active Incidents Queue */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl overflow-hidden flex flex-col border border-slate-800/80">
          <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white tracking-wider uppercase font-mono">ACTIVE INCIDENT QUEUE</h3>
              <span className="text-xs font-mono text-cyan-400 font-bold">({activeIncidents.length} active)</span>
            </div>
            <button
              onClick={() => onSelectTab('incidents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 font-mono"
            >
              All Cases <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 p-2 overflow-y-auto max-h-[460px] space-y-1">
            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No active unresolved incidents. All enterprise assets healthy.
              </div>
            ) : (
              activeIncidents.map(inc => {
                const isCritical = inc.severity === 'CRITICAL';
                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isCritical
                        ? 'border-rose-900/40 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-slate-950 hover:border-rose-500/60'
                        : 'border-slate-800/60 bg-slate-950/40 hover:border-amber-500/50 hover:bg-slate-900/60'
                    } group`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                              isCritical
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                            }`}
                          >
                            {inc.severity}
                          </span>
                          <span className="text-xs font-mono text-cyan-400 font-bold">{inc.id}</span>
                          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {inc.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">{inc.description}</p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 font-mono">
                        <span className="text-xs font-bold text-slate-200">
                          Risk: <span className={isCritical ? 'text-rose-400 font-extrabold' : 'text-amber-400 font-bold'}>{inc.riskScore}/100</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {inc.assignedTo.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300 text-[10px] border border-cyan-900/50">
                          {inc.status}
                        </span>
                        {inc.mitreTactics.slice(0, 2).map((m, idx) => (
                          <span
                            key={idx}
                            className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-purple-300"
                          >
                            {m.techniqueId}
                          </span>
                        ))}
                      </div>

                      <span className="text-cyan-400 text-xs font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Investigate <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 5 Cols: Animated Cyber Threat Radar & Attack Vectors */}
        <div className="lg:col-span-5 space-y-6">
          {/* Animated Threat Radar Widget */}
          <div className="cyber-panel p-5 rounded-2xl relative overflow-hidden border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  THREAT RADAR · 360° SWEEP
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SCANNING
              </span>
            </div>

            {/* Circular Radar Graphic */}
            <div className="py-3 flex items-center justify-center">
              <div className="relative w-48 h-48 rounded-full border border-cyan-500/30 bg-slate-950/80 flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.15)] overflow-hidden">
                {/* Concentric Range Rings */}
                <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20" />
                <div className="absolute w-24 h-24 rounded-full border border-cyan-500/25" />
                <div className="absolute w-12 h-12 rounded-full border border-cyan-500/30" />

                {/* Crosshairs */}
                <div className="absolute w-full h-px bg-cyan-500/20" />
                <div className="absolute h-full w-px bg-cyan-500/20" />

                {/* Rotating Sweep Beam */}
                <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/40 via-cyan-500/10 to-transparent rounded-tl-full origin-bottom-right" />
                </div>

                {/* Threat Blips */}
                <div className="absolute top-10 right-14 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-ping" title="S3 Exfiltration Detected" />
                <div className="absolute bottom-12 left-10 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" title="Impossible Travel Session" />
                <div className="absolute top-16 left-16 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse" title="K8s Pod Shell" />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />

                <div className="absolute bottom-2 text-[9px] font-mono text-cyan-400/80">RANGE: 50KM CLOUD</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
              <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Identities</span>
                <span className="text-xs font-bold text-cyan-300">4 Monitored</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Buckets</span>
                <span className="text-xs font-bold text-emerald-300">12 Protected</span>
              </div>
              <div className="p-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pods</span>
                <span className="text-xs font-bold text-purple-300">28 Active</span>
              </div>
            </div>
          </div>

          {/* Top Threat Vectors with Vibrant Gradients */}
          <div className="cyber-panel p-5 rounded-2xl space-y-3.5 border-purple-500/30">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  TOP THREAT VECTORS (7D)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-400">Aggregated</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Cloud Storage & Public S3 Exfil', percentage: 38, count: 9, gradient: 'from-rose-500 via-pink-500 to-rose-400' },
                { label: 'IAM Credential Leak & Escalation', percentage: 29, count: 7, gradient: 'from-amber-500 via-orange-500 to-amber-400' },
                { label: 'Container Ingress RCE & Shell', percentage: 21, count: 5, gradient: 'from-purple-500 via-fuchsia-500 to-purple-400' },
                { label: 'Identity Impossible Travel', percentage: 12, count: 3, gradient: 'from-cyan-400 via-sky-400 to-blue-400' }
              ].map((vec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{vec.label}</span>
                    <span className="text-slate-300 font-mono font-bold">{vec.count} events ({vec.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                    <div className={`h-full rounded-full bg-gradient-to-r ${vec.gradient} shadow-sm`} style={{ width: `${vec.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
