/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
  History,
  Shield,
  Layers,
  Sparkles,
  PlaySquare,
  ChevronRight,
  ExternalLink,
  Plus,
  Scale,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Incident, IncidentStatus, SeverityLevel } from '../../types';
import { api } from '../../lib/api';
import { ActiveTab } from '../Sidebar';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectTab: (tab: ActiveTab) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  onRefreshIncidents: () => Promise<void>;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectTab,
  selectedIncidentId,
  setSelectedIncidentId,
  onRefreshIncidents
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [activeIncidentTab, setActiveIncidentTab] = useState<'details' | 'timeline' | 'notes' | 'audit'>('details');

  // Comparison State
  const [isComparing, setIsComparing] = useState(false);
  const [compareIncidentAId, setCompareIncidentAId] = useState<string>(incidents[0]?.id || '');
  const [compareIncidentBId, setCompareIncidentBId] = useState<string>(incidents[1]?.id || '');

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.threatCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleStatusTransition = async (newStatus: IncidentStatus) => {
    if (!activeIncident) return;
    try {
      await api.transitionIncident(activeIncident.id, newStatus, `Analyst triggered status change to ${newStatus}`);
      await onRefreshIncidents();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleAssigneeChange = async (newAssignee: string) => {
    if (!activeIncident) return;
    try {
      await api.assignIncident(activeIncident.id, newAssignee);
      await onRefreshIncidents();
    } catch (err: any) {
      alert('Failed to reassign: ' + err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncident || !noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      await api.addIncidentNote(activeIncident.id, noteContent.trim(), 'Lead Analyst');
      setNoteContent('');
      await onRefreshIncidents();
    } catch (err: any) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const incA = incidents.find(i => i.id === compareIncidentAId);
  const incB = incidents.find(i => i.id === compareIncidentBId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Heading & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>
            <span>INCIDENT RESPONSE CENTER</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Prioritized case management, evidence containment, audit trail, and multi-incident comparison.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              isComparing
                ? 'bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Close Comparison' : 'Compare Incidents'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Section */}
      {isComparing && (
        <div className="cyber-panel p-5 rounded-2xl border-cyan-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">CROSS-INCIDENT CORRELATION & ATTACK GRAPH</h3>
            </div>
            <span className="text-xs text-cyan-300 font-mono font-bold">Side-by-Side Campaign Linkage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Case Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-mono font-semibold">Incident A:</label>
              <select
                value={compareIncidentAId}
                onChange={e => setCompareIncidentAId(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-800/60 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
              >
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                ))}
              </select>

              {incA && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-rose-900/40 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{incA.title}</span>
                    <span className="font-mono text-rose-400 font-extrabold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800">
                      {incA.severity} ({incA.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{incA.threatCategory}</p>
                  <div className="text-xs font-mono text-cyan-300">
                    <strong>Assets:</strong> {incA.affectedAssets.join(', ') || 'General Cloud'}
                  </div>
                  <div className="text-xs font-mono text-purple-300">
                    <strong>MITRE Techniques:</strong> {incA.mitreTactics.map(m => m.techniqueId).join(', ') || 'T1078'}
                  </div>
                </div>
              )}
            </div>

            {/* Right Case Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-mono font-semibold">Incident B:</label>
              <select
                value={compareIncidentBId}
                onChange={e => setCompareIncidentBId(e.target.value)}
                className="w-full bg-slate-950 border border-purple-800/60 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
              >
                {incidents.map(i => (
                  <option key={i.id} value={i.id}>{i.id} - {i.title}</option>
                ))}
              </select>

              {incB && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-purple-900/40 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{incB.title}</span>
                    <span className="font-mono text-purple-400 font-extrabold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800">
                      {incB.severity} ({incB.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">{incB.threatCategory}</p>
                  <div className="text-xs font-mono text-cyan-300">
                    <strong>Assets:</strong> {incB.affectedAssets.join(', ') || 'General Cloud'}
                  </div>
                  <div className="text-xs font-mono text-purple-300">
                    <strong>MITRE Techniques:</strong> {incB.mitreTactics.map(m => m.techniqueId).join(', ') || 'T1078'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar with Colorful Controls */}
      <div className="cyber-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 border-cyan-500/20">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by title, ID, assignee, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="CONTAINING">CONTAINING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-rose-300 font-mono font-bold focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: Master List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incidents List with Severity Left Borders */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl overflow-hidden flex flex-col border-slate-800">
          <div className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider">Incident Queue ({filteredIncidents.length})</span>
            <span className="text-cyan-400 font-bold">Prioritized Feed</span>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[620px] p-2 space-y-1.5">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No incidents match your filter criteria.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = activeIncident?.id === inc.id;
                const isCritical = inc.severity === 'CRITICAL';
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : isCritical
                        ? 'border-l-4 border-l-rose-500 border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/80'
                        : 'border-l-4 border-l-amber-500 border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{inc.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-500'
                            : 'bg-amber-950 text-amber-300 border border-amber-500'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mt-1.5 line-clamp-1">{inc.title}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inc.description}</p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                        {inc.status}
                      </span>
                      <span className="text-slate-400">Assigned: {inc.assignedTo.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Incident Detailed Workspace */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl overflow-hidden flex flex-col border-cyan-500/30">
          {activeIncident ? (
            <div className="p-6 space-y-5">
              {/* Header Bar */}
              <div className="space-y-2.5 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-extrabold text-cyan-400">{activeIncident.id}</span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-mono font-extrabold rounded-full ${
                        activeIncident.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                      }`}
                    >
                      {activeIncident.severity}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                      Risk: {activeIncident.riskScore}/100
                    </span>
                  </div>

                  {/* Status Dropdown Transition Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Status:</span>
                    <select
                      value={activeIncident.status}
                      onChange={e => handleStatusTransition(e.target.value as IncidentStatus)}
                      className="bg-slate-900 border border-cyan-400 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 font-extrabold focus:outline-none shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                      <option value="CONTAINING">CONTAINING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REOPENED">REOPENED</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-white">{activeIncident.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{activeIncident.description}</p>

                {/* Assignee & Dates */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
                  <div className="flex items-center gap-2">
                    <span>Assignee:</span>
                    <select
                      value={activeIncident.assignedTo}
                      onChange={e => handleAssigneeChange(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                    >
                      <option value="Alex Vance (Lead SecOps)">Alex Vance (Lead SecOps)</option>
                      <option value="Maria Chen (Identity Analyst)">Maria Chen (Identity Analyst)</option>
                      <option value="DevOps On-Call">DevOps On-Call</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>
                  <span>Created: {activeIncident.createdAt.replace('T', ' ').substring(0, 16)}</span>
                </div>
              </div>

              {/* Workspace Navigation Tabs with Colorful Active Bar */}
              <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-mono">
                {[
                  { id: 'details', label: 'Overview & Assets', color: 'border-cyan-400 text-cyan-300' },
                  { id: 'timeline', label: `Attack Timeline (${activeIncident.events.length})`, color: 'border-purple-400 text-purple-300' },
                  { id: 'notes', label: `Investigation Notes (${activeIncident.notes.length})`, color: 'border-amber-400 text-amber-300' },
                  { id: 'audit', label: `Audit Trail (${activeIncident.auditHistory.length})`, color: 'border-emerald-400 text-emerald-300' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveIncidentTab(tab.id as any)}
                    className={`px-3 py-2 font-bold border-b-2 transition-all ${
                      activeIncidentTab === tab.id
                        ? tab.color
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Details & Assets */}
              {activeIncidentTab === 'details' && (
                <div className="space-y-4">
                  {/* Affected Assets with Colorful Tags */}
                  <div>
                    <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider">Impacted Cloud Assets</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeIncident.affectedAssets.map((asset, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-slate-950 border border-cyan-800/60 text-xs font-mono text-cyan-300 shadow-sm">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* MITRE Mapping */}
                  <div>
                    <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">MITRE ATT&CK Techniques</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {activeIncident.mitreTactics.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-purple-900/50 text-xs">
                          <span className="text-purple-400 font-mono font-extrabold">{m.techniqueId}</span> · {m.techniqueName}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Playbook Launch with Neon Button */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/40 flex items-center justify-between shadow-lg">
                    <div>
                      <div className="text-xs font-extrabold text-white">Recommended Containment Playbook</div>
                      <div className="text-[11px] text-cyan-300">Execute safe automated containment with human approval.</div>
                    </div>
                    <button
                      onClick={() => onSelectTab('playbooks')}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      Open Playbooks
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Attack Timeline with Glowing Neon Nodes */}
              {activeIncidentTab === 'timeline' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-mono">
                    Chronological sequence of observable actions extracted from logs:
                  </div>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-400 before:via-purple-500 before:to-rose-500">
                    {activeIncident.events.map((ev, idx) => (
                      <div key={ev.id} className="relative group">
                        <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] ring-4 ring-slate-950" />
                        <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 space-y-1 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="text-cyan-300 font-bold">{ev.id} · {ev.action}</span>
                            <span>{ev.timestamp.replace('T', ' ').substring(0, 19)}</span>
                          </div>
                          <p className="text-xs text-slate-200">
                            Actor <strong className="text-white">{ev.user}</strong> from IP <code className="text-cyan-400 font-mono">{ev.sourceIp}</code> invoked{' '}
                            {ev.action} against {ev.resource || ev.service}.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Notes */}
              {activeIncidentTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <label className="text-xs font-mono font-bold text-amber-300 block">Add Investigation Note:</label>
                    <textarea
                      rows={3}
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      placeholder="Record analyst findings, out-of-band communication, or forensic notes..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingNote || !noteContent.trim()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] disabled:opacity-40"
                      >
                        {isSubmittingNote ? 'Saving...' : 'Add Note'}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2.5 pt-2">
                    {activeIncident.notes.length === 0 ? (
                      <div className="text-xs text-slate-500 p-4 text-center font-mono">No analyst notes recorded yet.</div>
                    ) : (
                      activeIncident.notes.map(n => (
                        <div key={n.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="text-amber-300 font-bold">{n.author}</span>
                            <span>{n.timestamp.replace('T', ' ').substring(0, 16)}</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Audit */}
              {activeIncidentTab === 'audit' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-mono">In-memory case audit events:</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activeIncident.auditHistory.map(a => (
                      <div key={a.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="text-emerald-400 font-bold">{a.action} by {a.user}</span>
                          <span>{a.timestamp.replace('T', ' ').substring(0, 19)}</span>
                        </div>
                        <div className="text-slate-300 mt-1">{a.details}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs font-mono">
              Select an incident from the queue to view details and response workflow.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
