/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { AuditEntry } from '../../types';

interface AuditLogViewProps {
  auditLogs: AuditEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = auditLogs.filter(a => {
    const matchesSearch =
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.details.toLowerCase().includes(search.toLowerCase()) ||
      a.target.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Category', 'Action', 'Target', 'Result', 'Details'];
    const rows = filtered.map(a => [
      a.id,
      a.timestamp,
      a.user,
      a.category,
      a.action,
      a.target,
      a.result,
      a.details
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AEGIS-Audit-Logs-${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            SECURITY AUDIT TRAIL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            In-memory demo audit log of analyst actions, playbook dry-runs, and incident state transitions. Entries reset when the server restarts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="INCIDENT">INCIDENT</option>
            <option value="PLAYBOOK">PLAYBOOK</option>
            <option value="ANALYSIS">ANALYSIS</option>
            <option value="RULE">RULE</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="cyber-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor / User</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
                <th className="p-3">Result</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-cyan-400">{entry.id}</td>
                  <td className="p-3 text-slate-400">{entry.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="p-3 text-slate-200">{entry.user}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                      {entry.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{entry.action}</td>
                  <td className="p-3 text-slate-300">{entry.target}</td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        entry.result === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300'
                          : entry.result === 'DENIED'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {entry.result}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 max-w-md truncate" title={entry.details}>
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
