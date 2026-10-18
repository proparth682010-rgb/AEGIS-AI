/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Shield,
  Search,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Activity,
  Volume2,
  VolumeX,
  AlertTriangle,
  Flame,
  Zap
} from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenTour: () => void;
  onResetDemo: () => void;
  aiProviderStatus: {
    activeProvider: string;
    model: string;
    configured: boolean;
  };
  audioEnabled: boolean;
  onToggleAudio: () => void;
  activeCriticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenTour,
  onResetDemo,
  aiProviderStatus,
  audioEnabled,
  onToggleAudio,
  activeCriticalCount
}) => {
  return (
    <header className="relative h-16 border-b border-cyan-900/30 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between shadow-lg shadow-black/50">
      {/* Subtle Aurora Glow Behind Header */}
      <div className="absolute top-0 left-1/4 w-96 h-12 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-12 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Top Edge Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-purple-500 to-transparent opacity-80" />

      {/* Left: Branding & Synthetic Telemetry Tag */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Logo with Gradient Ring & Glow */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-purple-950 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 text-cyan-300">
            <Shield className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white font-mono flex items-center gap-1">
                AEGIS <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/30 text-cyan-300 font-mono font-bold shadow-inner">
                SOC v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">Autonomous Enterprise Guard & Intelligence System</p>
          </div>
        </div>

        {/* Colorful Synthetic Telemetry Notice */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-orange-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-sm shadow-amber-950/50">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide">SYNTHETIC DEMO TELEMETRY</span>
          <span className="text-[10px] text-amber-400/70 hidden xl:inline">· Non-Production Environment</span>
        </div>
      </div>

      {/* Center: Search & Command Palette Quick Button */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block relative z-10">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-cyan-500/40 hover:text-slate-200 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Search incidents, telemetry, playbooks, assets...</span>
          </div>
          <kbd className="px-2 py-0.5 text-[10px] bg-slate-800/80 text-cyan-300 rounded-md border border-cyan-900/50 font-mono font-bold shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: AI Diagnostics, Audio, Guided Tour, Reset Demo */}
      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        {/* Critical Alerts Badge if count > 0 */}
        {activeCriticalCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-950 via-rose-900/60 to-red-950 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>{activeCriticalCount} CRITICAL</span>
          </div>
        )}

        {/* AI Provider Status Pill with Neon Glow */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs border font-mono bg-slate-900/80 border-slate-800 shadow-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${aiProviderStatus.configured ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`} />
          <span className="text-slate-200 font-semibold hidden sm:inline">
            {aiProviderStatus.configured ? 'Gemini 3.8 Flash' : 'Deterministic Engine'}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            {aiProviderStatus.configured ? 'AI ACTIVE' : 'LOCAL'}
          </span>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={onToggleAudio}
          title={audioEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
          className={`p-2 rounded-xl border transition-all ${
            audioEnabled
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Guided Tour Walkthrough Button with Gradient */}
        <button
          onClick={onOpenTour}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 text-cyan-200 hover:border-cyan-400 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Guided Tour</span>
        </button>

        {/* Demo Reset Button */}
        <button
          onClick={onResetDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          title="Reset platform demo state back to default synthetic sample data"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Reset State</span>
        </button>
      </div>
    </header>
  );
};
