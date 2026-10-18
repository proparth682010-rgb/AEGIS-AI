/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  User,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Lock,
  Zap
} from 'lucide-react';
import { CopilotMessage, ThreatAnalysisResult, NormalizedEvent } from '../../types';
import { api } from '../../lib/api';

interface CopilotViewProps {
  activeAnalysis: ThreatAnalysisResult | null;
  copilotMessages: CopilotMessage[];
  setCopilotMessages: React.Dispatch<React.SetStateAction<CopilotMessage[]>>;
}

export const CopilotView: React.FC<CopilotViewProps> = ({
  activeAnalysis,
  copilotMessages,
  setCopilotMessages
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Explain how this attacker attempted to bypass access controls',
    'What AWS CLI commands should I run immediately to contain this?',
    'Are there indicators of lateral movement across VPC subnets?',
    'Draft an executive summary briefing for the CISO'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [copilotMessages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: 'USER-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setCopilotMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.sendCopilotChat(
        text.trim(),
        activeAnalysis?.eventsAnalyzed || [],
        activeAnalysis || undefined
      );
      setCopilotMessages(prev => [...prev, response]);
    } catch (err: any) {
      setCopilotMessages(prev => [
        ...prev,
        {
          id: 'ERR-' + Math.random().toString(36).substring(2, 8),
          role: 'assistant',
          content: '⚠️ Failed to connect to AI Security Copilot service: ' + (err?.message || 'Network error'),
          timestamp: new Date().toISOString(),
          confidence: 0
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setCopilotMessages([
      {
        id: 'INIT',
        role: 'assistant',
        content: `### 🛡️ AEGIS AI Security Copilot Active\n\nI am your defensive SOC engineering assistant, powered by Google Gemini 3.8 Flash with local deterministic correlation fallbacks.\n\n${
          activeAnalysis
            ? `**Active Telemetry Context**: Analyzing threat *"${activeAnalysis.threatCategory}"* (Risk: ${activeAnalysis.riskScore}/100, ${activeAnalysis.eventsAnalyzed.length} events loaded).`
            : 'No threat analysis currently loaded. You can ask general AWS defensive security questions or load an attack scenario in the Threat Analyzer.'
        }\n\n*Guardrails Active*: Secrets (API keys, passwords, bearer tokens) are redacted before processing. Untrusted logs are fenced from model instruction context.`,
        timestamp: new Date().toISOString(),
        confidence: 99
      }
    ]);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2.5 font-mono">
            <div className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)]">
              <Bot className="w-5 h-5 text-fuchsia-300" />
            </div>
            <span>AI SECURITY COPILOT</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Grounded SOC assistant with prompt injection defenses, secret redaction, and event referencing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-cyan-800/60 text-xs font-mono text-cyan-300 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Untrusted Data Fencing Active</span>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 font-mono"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Workspace with Neon Borders */}
      <div className="cyber-panel rounded-2xl overflow-hidden flex flex-col h-[620px] border-fuchsia-500/30 shadow-2xl">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {copilotMessages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar with Glow */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-gradient-to-br from-fuchsia-950 to-purple-950 border border-fuchsia-500/60 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble with Gradient Background */}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group shadow-md ${
                    isUser
                      ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border border-cyan-500/40 text-cyan-50'
                      : 'bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-purple-950/40 border border-purple-900/40 text-slate-100'
                  }`}
                >
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 pb-1.5 border-b border-slate-800/80">
                    <span className={isUser ? 'text-cyan-300 font-bold' : 'text-fuchsia-300 font-bold'}>
                      {isUser ? 'You (Security Analyst)' : 'AEGIS Copilot · Gemini 3.8 Flash'}
                    </span>
                    <span>{msg.timestamp.substring(11, 19)}</span>
                  </div>

                  {/* Body Content with formatted paragraphs and code blocks */}
                  <div className="whitespace-pre-wrap font-sans space-y-2 leading-relaxed">
                    {msg.content}
                  </div>

                  {/* Referenced Event IDs if assistant */}
                  {msg.referencedEventIds && msg.referencedEventIds.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span>Referenced Events:</span>
                      {msg.referencedEventIds.map(eid => (
                        <span key={eid} className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                          #{eid}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Copy Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center shrink-0 animate-pulse shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 text-xs text-purple-300 font-mono flex items-center gap-2.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Correlating telemetry & generating defensive guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Queries with Colorful Pills */}
        <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Quick Inquiries:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-slate-900 hover:bg-gradient-to-r hover:from-cyan-950 hover:to-purple-950 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white whitespace-nowrap transition-all shrink-0 font-medium shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/95">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask Copilot about active incidents, AWS CLI containment, or attack techniques..."
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-1">
            <span>Redaction Active: Credentials and tokens masked automatically</span>
            <span>Context: Demo event references may be incomplete; review generated guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
