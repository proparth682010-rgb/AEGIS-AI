/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Shield,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import { DetectionRule, SeverityLevel } from '../../types';
import { api } from '../../lib/api';

interface DetectionRulesViewProps {
  rules: DetectionRule[];
  onRefreshRules: () => Promise<void>;
  onRefreshAudit: () => Promise<void>;
}

export const DetectionRulesView: React.FC<DetectionRulesViewProps> = ({
  rules,
  onRefreshRules,
  onRefreshAudit
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleMitre, setNewRuleMitre] = useState('T1078');
  const [newRuleSeverity, setNewRuleSeverity] = useState<SeverityLevel>('HIGH');
  const [newRuleCategory, setNewRuleCategory] = useState('Cloud Infrastructure');
  const [newRuleLogic, setNewRuleLogic] = useState('');

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.mitreId.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (id: string) => {
    try {
      await api.toggleRule(id);
      await onRefreshRules();
      await onRefreshAudit();
    } catch (err: any) {
      alert('Failed to toggle rule: ' + err.message);
    }
  };

  const handleAddCustomRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleLogic.trim()) return;

    const customRule: DetectionRule = {
      id: 'R-' + Math.floor(200 + Math.random() * 800),
      name: newRuleName.trim(),
      description: newRuleLogic.trim(),
      mitreId: newRuleMitre.trim(),
      severity: newRuleSeverity,
      category: newRuleCategory,
      enabled: true,
      triggerCount: 0,
      logicSummary: newRuleLogic.trim(),
      author: 'Custom Analyst Rule',
      updatedAt: new Date().toISOString()
    };

    rules.push(customRule);
    setShowAddModal(false);
    setNewRuleName('');
    setNewRuleLogic('');
    await onRefreshRules();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            DETECTION RULES MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sigma-style cloud detection signatures mapped to MITRE ATT&CK tactics with real-time toggle controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rules, MITRE IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="cyber-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Rule ID</th>
                <th className="p-3">Rule Name & Logic</th>
                <th className="p-3">MITRE ID</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Triggers</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredRules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-900/40">
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rule.enabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rule.enabled ? 'ACTIVE' : 'MUTED'}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-cyan-400">{rule.id}</td>
                  <td className="p-3 max-w-sm">
                    <div className="font-semibold text-white text-xs">{rule.name}</div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-1">{rule.logicSummary}</p>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-300">{rule.mitreId}</td>
                  <td className="p-3 text-slate-300 text-xs">{rule.category}</td>
                  <td className="p-3 font-mono">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        rule.severity === 'CRITICAL'
                          ? 'text-rose-400'
                          : rule.severity === 'HIGH'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-cyan-300 font-bold">{rule.triggerCount}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`text-xs font-mono font-bold flex items-center gap-1 ${
                        rule.enabled ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {rule.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono">CREATE CUSTOM DETECTION RULE</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRule} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Rule Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Unauthorized KMS Key Deletion Request"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">MITRE Technique ID:</label>
                  <input
                    type="text"
                    placeholder="e.g. T1485"
                    value={newRuleMitre}
                    onChange={e => setNewRuleMitre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Severity:</label>
                  <select
                    value={newRuleSeverity}
                    onChange={e => setNewRuleSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Detection Logic Summary:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Event in [ScheduleKeyDeletion, DeleteAlias] without active change ticket"
                  value={newRuleLogic}
                  onChange={e => setNewRuleLogic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRuleName.trim() || !newRuleLogic.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40"
                >
                  Save & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
