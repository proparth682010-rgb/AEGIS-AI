/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  AlertOctagon,
  TrendingUp,
  PlaySquare,
  Bot,
  Server,
  FileCode,
  History,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Flame,
  Zap
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'analyzer'
  | 'incidents'
  | 'risk'
  | 'playbooks'
  | 'copilot'
  | 'assets'
  | 'rules'
  | 'audit'
  | 'report'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeIncidentsCount,
  criticalIncidentsCount
}) => {
  const navSections = [
    {
      title: 'DEFENSE OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, color: 'text-cyan-400' },
        { id: 'analyzer', label: 'AI Threat Analyzer', icon: Cpu, badge: 'Core', color: 'text-purple-400' },
        {
          id: 'incidents',
          label: 'Incident Response',
          icon: AlertOctagon,
          count: activeIncidentsCount,
          isCritical: criticalIncidentsCount > 0,
          color: 'text-rose-400'
        },
        { id: 'risk', label: 'Risk Intelligence', icon: TrendingUp, color: 'text-amber-400' },
        { id: 'playbooks', label: 'Safe Playbooks', icon: PlaySquare, badge: 'HITL', color: 'text-emerald-400' },
        { id: 'copilot', label: 'AI Security Copilot', icon: Bot, badge: 'Gemini', color: 'text-fuchsia-400' }
      ]
    },
    {
      title: 'SURFACE & DETECTION',
      items: [
        { id: 'assets', label: 'Asset Inventory', icon: Server, color: 'text-sky-400' },
        { id: 'rules', label: 'Detection Rules', icon: FileCode, color: 'text-teal-400' }
      ]
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { id: 'audit', label: 'Security Audit Log', icon: History, color: 'text-indigo-400' },
        { id: 'report', label: 'Executive Report', icon: FileSpreadsheet, color: 'text-emerald-300' },
        { id: 'settings', label: 'Settings & AWS Ready', icon: Settings, color: 'text-slate-400' }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
      <div className="py-4 px-3 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 text-white border-l-4 border-cyan-400 shadow-md shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1 rounded-lg ${isActive ? 'bg-cyan-950/90 text-cyan-400' : 'text-slate-400 group-hover:' + item.color}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.color}`} />
                      </div>
                      <span className={isActive ? 'font-bold text-white' : ''}>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm ${
                            item.isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/60 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.isCritical && <Flame className="w-2.5 h-2.5 text-rose-400" />}
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] rounded-md uppercase font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status Banner with Colorful Glow */}
      <div className="p-3.5 border-t border-slate-800/80 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-slate-950 m-2 rounded-xl text-xs font-mono border border-emerald-900/30 shadow-inner">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1.5 text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_6px_#34d399]" />
            Guardrails Active
          </span>
          <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
            STRICT HITL
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">Playbooks are simulations; live cloud actions are unavailable.</p>
      </div>
    </aside>
  );
};
