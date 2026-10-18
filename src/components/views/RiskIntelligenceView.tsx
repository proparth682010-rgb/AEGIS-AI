/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Plus,
  Trash2,
  Gauge
} from 'lucide-react';
import { RiskConfig, DEFAULT_RISK_CONFIG } from '../../lib/riskEngine';

interface WhitelistRule {
  id: string;
  type: 'IP' | 'USER' | 'SERVICE';
  value: string;
  reason: string;
  addedAt: string;
}

export const RiskIntelligenceView: React.FC = () => {
  const [riskConfig, setRiskConfig] = useState<RiskConfig>(DEFAULT_RISK_CONFIG);
  const [whitelist, setWhitelist] = useState<WhitelistRule[]>([
    {
      id: 'WL-01',
      type: 'USER',
      value: 'github-actions-bot',
      reason: 'Automated CI/CD Nightly Microservice Deploy pipeline',
      addedAt: '2026-10-15'
    },
    {
      id: 'WL-02',
      type: 'IP',
      value: '198.51.100.24',
      reason: 'Corporate HQ ZTNA Egress Gateway (New York)',
      addedAt: '2026-10-14'
    }
  ]);

  const [newRuleType, setNewRuleType] = useState<WhitelistRule['type']>('IP');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [newRuleReason, setNewRuleReason] = useState('');

  // Sample simulation event: S3 PutBucketPolicy with AdministratorAccess
  const simSeverity = 95;
  const simVelocity = 90;
  const simAsset = 90;
  const simPrivilege = 96;

  let simSensitivityBonus = 0;
  if (riskConfig.threatSensitivity === 'AGGRESSIVE') simSensitivityBonus = 10;
  if (riskConfig.threatSensitivity === 'LOW') simSensitivityBonus = -10;

  const adjSeverity = Math.min(100, Math.max(10, simSeverity + simSensitivityBonus));
  const simScore = Math.min(
    100,
    Math.round(
      adjSeverity * riskConfig.severityWeight +
        simVelocity * riskConfig.velocityWeight +
        simAsset * riskConfig.assetWeight +
        simPrivilege * riskConfig.privilegeWeight
    )
  );

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleValue.trim()) return;
    setWhitelist([
      ...whitelist,
      {
        id: 'WL-' + Math.floor(10 + Math.random() * 90),
        type: newRuleType,
        value: newRuleValue.trim(),
        reason: newRuleReason.trim() || 'Analyst exception',
        addedAt: new Date().toISOString().substring(0, 10)
      }
    ]);
    setNewRuleValue('');
    setNewRuleReason('');
  };

  const handleDeleteWhitelist = (id: string) => {
    setWhitelist(whitelist.filter(w => w.id !== id));
  };

  const sevPts = Math.round(adjSeverity * riskConfig.severityWeight * 10) / 10;
  const velPts = Math.round(simVelocity * riskConfig.velocityWeight * 10) / 10;
  const astPts = Math.round(simAsset * riskConfig.assetWeight * 10) / 10;
  const prvPts = Math.round(simPrivilege * riskConfig.privilegeWeight * 10) / 10;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5 font-mono">
          <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <span>RISK INTELLIGENCE & EXPLAINABILITY</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Configurable multi-factor risk scoring mathematical engine, simulation sandbox, and false-positive exception tuning.
        </p>
      </div>

      {/* Main Grid: Interactive Sandbox & False Positive Exceptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Weight Simulator */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 space-y-5 border-amber-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                RISK WEIGHT TUNING SANDBOX
              </h3>
            </div>
            <button
              onClick={() => setRiskConfig(DEFAULT_RISK_CONFIG)}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Tune weighting factors to reflect enterprise risk appetite. Changes dynamically recalculate correlation scores across all active cases.
          </p>

          <div className="space-y-4">
            {/* Weight 1: Severity (Cyan Accent) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-cyan-300">1. Signature & Rule Severity Weight</span>
                <span className="text-cyan-400 text-sm font-extrabold">{Math.round(riskConfig.severityWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={riskConfig.severityWeight}
                onChange={e => setRiskConfig({ ...riskConfig, severityWeight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block font-sans">Baseline match on critical threat signatures.</span>
            </div>

            {/* Weight 2: Velocity (Rose Accent) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-rose-300">2. Anomaly Velocity & Attack Momentum Weight</span>
                <span className="text-rose-400 text-sm font-extrabold">{Math.round(riskConfig.velocityWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={riskConfig.velocityWeight}
                onChange={e => setRiskConfig({ ...riskConfig, velocityWeight: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block font-sans">Frequency of failed invocations and rapid sequential actions.</span>
            </div>

            {/* Weight 3: Asset Criticality (Amber Accent) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-amber-300">3. Asset Criticality & Blast Radius Weight</span>
                <span className="text-amber-400 text-sm font-extrabold">{Math.round(riskConfig.assetWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={riskConfig.assetWeight}
                onChange={e => setRiskConfig({ ...riskConfig, assetWeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block font-sans">Weight multiplier for production customer data vaults vs staging.</span>
            </div>

            {/* Weight 4: Privilege Sensitivity (Purple Accent) */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-purple-300">4. Identity & Privilege Sensitivity Weight</span>
                <span className="text-purple-400 text-sm font-extrabold">{Math.round(riskConfig.privilegeWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={riskConfig.privilegeWeight}
                onChange={e => setRiskConfig({ ...riskConfig, privilegeWeight: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 h-2 bg-slate-900 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block font-sans">Root, IAM Administrator, or multi-cloud federation roles.</span>
            </div>

            {/* Sensitivity Selection */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold text-slate-300 block mb-2">SOC Threat Sensitivity Threshold:</span>
              <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                {(['LOW', 'STANDARD', 'AGGRESSIVE'] as const).map(sens => (
                  <button
                    key={sens}
                    onClick={() => setRiskConfig({ ...riskConfig, threatSensitivity: sens })}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      riskConfig.threatSensitivity === sens
                        ? 'bg-gradient-to-r from-cyan-950 to-purple-950 border-cyan-400 text-cyan-200 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sens}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Stacked Bar Formula Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-600/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">Live Simulation Benchmark:</span>
              <span className="text-xs font-mono font-extrabold text-rose-400 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800">
                Score: {simScore}/100 [CRITICAL]
              </span>
            </div>

            {/* Multi-color Stacked Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              <div style={{ width: `${sevPts}%` }} className="h-full bg-cyan-400" title={`Severity: ${sevPts} pts`} />
              <div style={{ width: `${velPts}%` }} className="h-full bg-rose-500" title={`Velocity: ${velPts} pts`} />
              <div style={{ width: `${astPts}%` }} className="h-full bg-amber-400" title={`Asset: ${astPts} pts`} />
              <div style={{ width: `${prvPts}%` }} className="h-full bg-purple-500" title={`Privilege: ${prvPts} pts`} />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">■ Sev ({sevPts})</span>
              <span className="text-rose-400 font-bold">■ Vel ({velPts})</span>
              <span className="text-amber-400 font-bold">■ Asset ({astPts})</span>
              <span className="text-purple-400 font-bold">■ Priv ({prvPts})</span>
            </div>
          </div>
        </div>

        {/* Right: False-Positive Exceptions & Allowlist */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl p-6 space-y-5 border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                FALSE POSITIVE TUNING & EXCEPTIONS
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Exclude legitimate DevOps service accounts or corporate VPN ranges from triggering high-velocity false alarms.
          </p>

          {/* Add Exception Form */}
          <form onSubmit={handleAddWhitelist} className="space-y-3 p-4 rounded-xl bg-slate-950/90 border border-emerald-900/40 shadow-sm">
            <span className="text-xs font-mono font-bold text-emerald-300 block">Add Allowlist Exception</span>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={newRuleType}
                onChange={e => setNewRuleType(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono font-bold focus:outline-none"
              >
                <option value="IP">IP / CIDR</option>
                <option value="USER">User / Bot</option>
                <option value="SERVICE">Service</option>
              </select>
              <input
                type="text"
                placeholder="Value (e.g. 10.0.0.0/8)"
                value={newRuleValue}
                onChange={e => setNewRuleValue(e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <input
              type="text"
              placeholder="Operational justification (e.g. Approved CI/CD Pipeline)"
              value={newRuleReason}
              onChange={e => setNewRuleReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!newRuleValue.trim()}
              className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Exception Rule</span>
            </button>
          </form>

          {/* Active Exceptions List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {whitelist.map(rule => (
              <div key={rule.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold bg-slate-900 border border-slate-700 text-cyan-300">
                      {rule.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{rule.value}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteWhitelist(rule.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Remove exception"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">{rule.reason}</p>
                <div className="text-[10px] text-slate-500 font-mono">Added: {rule.addedAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
