/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Cpu,
  AlertOctagon,
  TrendingUp,
  PlaySquare,
  Bot,
  RotateCcw,
  Server,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  X
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onLoadScenario: (scenarioId: string) => void;
  onResetDemo: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onLoadScenario,
  onResetDemo
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allItems = [
    {
      group: 'NAVIGATION',
      items: [
        { label: 'Go to Command Center', tab: 'dashboard' as ActiveTab, icon: LayoutDashboard },
        { label: 'Go to AI Threat Analyzer', tab: 'analyzer' as ActiveTab, icon: Cpu },
        { label: 'Go to Incident Response', tab: 'incidents' as ActiveTab, icon: AlertOctagon },
        { label: 'Go to Risk Intelligence', tab: 'risk' as ActiveTab, icon: TrendingUp },
        { label: 'Go to Safe Response Playbooks', tab: 'playbooks' as ActiveTab, icon: PlaySquare },
        { label: 'Go to AI Security Copilot', tab: 'copilot' as ActiveTab, icon: Bot },
        { label: 'Go to Asset Inventory', tab: 'assets' as ActiveTab, icon: Server },
        { label: 'Go to Executive Posture Report', tab: 'report' as ActiveTab, icon: FileSpreadsheet }
      ]
    },
    {
      group: 'QUICK SCENARIOS',
      items: [
        { label: 'Load: AWS CloudTrail Exfiltration (Critical)', action: () => onLoadScenario('SCENARIO-AWS-EXFIL'), icon: Sparkles },
        { label: 'Load: Okta Impossible Travel Anomaly (High)', action: () => onLoadScenario('SCENARIO-OKTA-TRAVEL'), icon: Sparkles },
        { label: 'Load: Kubernetes Pod Injection & Reverse Shell (Critical)', action: () => onLoadScenario('SCENARIO-K8S-RCE'), icon: Sparkles },
        { label: 'Load: Benign DevOps CI/CD Activity (Low Risk)', action: () => onLoadScenario('SCENARIO-BENIGN-CICD'), icon: Sparkles }
      ]
    },
    {
      group: 'SYSTEM ACTIONS',
      items: [
        { label: 'Reset Platform Demo State', action: onResetDemo, icon: RotateCcw }
      ]
    }
  ];

  const filteredGroups = allItems
    .map(g => ({
      ...g,
      items: g.items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    }))
    .filter(g => g.items.length > 0);

  const flatList = filteredGroups.flatMap(g => g.items);

  const executeItem = (item: any) => {
    if (item.tab) {
      onSelectTab(item.tab);
    } else if (item.action) {
      item.action();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, screen, or scenario..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (flatList.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + flatList.length) % (flatList.length || 1));
              } else if (e.key === 'Enter' && flatList[selectedIndex]) {
                e.preventDefault();
                executeItem(flatList[selectedIndex]);
              }
            }}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {group.group}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item, iIdx) => {
                    const itemGlobalIndex = flatList.indexOf(item);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const Icon = item.icon;
                    return (
                      <button
                        key={iIdx}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/50'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>AEGIS Command Palette</span>
        </div>
      </div>
    </div>
  );
};
