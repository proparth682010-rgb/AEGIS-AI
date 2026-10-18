/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { GuidedTour } from './components/GuidedTour';
import { DashboardView } from './components/views/DashboardView';
import { ThreatAnalyzerView } from './components/views/ThreatAnalyzerView';
import { IncidentsView } from './components/views/IncidentsView';
import { RiskIntelligenceView } from './components/views/RiskIntelligenceView';
import { PlaybooksView } from './components/views/PlaybooksView';
import { CopilotView } from './components/views/CopilotView';
import { AssetInventoryView } from './components/views/AssetInventoryView';
import { DetectionRulesView } from './components/views/DetectionRulesView';
import { AuditLogView } from './components/views/AuditLogView';
import { ExecutiveReportView } from './components/views/ExecutiveReportView';
import { SettingsView } from './components/views/SettingsView';
import {
  Incident,
  Playbook,
  Asset,
  DetectionRule,
  AuditEntry,
  ThreatAnalysisResult,
  SecurityPostureReport,
  CopilotMessage
} from './types';
import { api } from './lib/api';
import { DEMO_SCENARIOS } from './lib/demoData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [report, setReport] = useState<SecurityPostureReport | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ThreatAnalysisResult | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Modal States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Diagnostics State
  const [aiProviderStatus, setAiProviderStatus] = useState({
    activeProvider: 'Google Gemini 3.8 Flash',
    model: 'gemini-3.8-flash',
    configured: true
  });

  // Copilot Initial Chat
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: 'INIT-1',
      role: 'assistant',
      content: `### 🛡️ AEGIS AI Defensive Security Copilot Online\n\nI am grounded in your enterprise security telemetry, AWS CloudTrail audits, and active incident response cases.\n\n- **Defensive Guardrails**: Secrets (IAM keys, passwords, bearer tokens) are redacted before analysis. Machine log streams are strictly segregated from model instructions to prevent prompt injection.\n- **Quick Actions**: Ask me for AWS CLI containment commands, incident timeline reconstruction, or board-level executive summaries.`,
      timestamp: new Date().toISOString(),
      confidence: 99
    }
  ]);

  // Audio tone synthesizer for critical alerts
  const playAlertTone = () => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Data Loading & Refresh
  const loadAllData = async () => {
    try {
      const [incData, pbData, astData, ruleData, audData, repData, hlthData] = await Promise.all([
        api.getIncidents(),
        api.getPlaybooks(),
        api.getAssets(),
        api.getRules(),
        api.getAuditLogs(),
        api.getExecutiveReport(),
        api.getHealth()
      ]);

      setIncidents(incData);
      setPlaybooks(pbData);
      setAssets(astData);
      setRules(ruleData);
      setAuditLogs(audData);
      setReport(repData);
      if (hlthData?.aiProvider) {
        setAiProviderStatus(hlthData.aiProvider);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Keyboard shortcut listener for ? (help tour)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsTourOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Handlers
  const handleResetDemo = async () => {
    if (confirm('Reset platform state back to factory synthetic demo data?')) {
      await api.resetDemo();
      await loadAllData();
      setActiveAnalysis(null);
      setSelectedIncidentId(null);
      alert('Platform demo state has been reset to default synthetic data.');
    }
  };

  const handleLoadScenarioFromPalette = (scenarioId: string) => {
    const sc = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;
    setActiveTab('analyzer');
  };

  const handleEscalateIncident = async (analysis: ThreatAnalysisResult) => {
    try {
      const newInc = await api.createIncident({
        title: `${analysis.threatCategory} (${analysis.severity})`,
        severity: analysis.severity,
        threatCategory: analysis.threatCategory,
        riskScore: analysis.riskScore,
        summary: analysis.summary,
        events: analysis.eventsAnalyzed,
        affectedAssets: analysis.affectedAssets
      });

      playAlertTone();
      await loadAllData();
      setSelectedIncidentId(newInc.id);
      setActiveTab('incidents');
    } catch (err: any) {
      alert('Failed to escalate incident: ' + err.message);
    }
  };

  const handleSendToCopilot = (analysis: ThreatAnalysisResult) => {
    setCopilotMessages(prev => [
      ...prev,
      {
        id: 'CTX-' + Math.random().toString(36).substring(2, 8),
        role: 'user',
        content: `I am investigating analysis #${analysis.id} for threat "${analysis.threatCategory}". The explainable risk score is ${analysis.riskScore}/100. What immediate containment steps do you recommend for this incident?`,
        timestamp: new Date().toISOString()
      }
    ]);
    setActiveTab('copilot');
  };

  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const criticalCount = activeIncidents.filter(i => i.severity === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onResetDemo={handleResetDemo}
        aiProviderStatus={aiProviderStatus}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        activeCriticalCount={criticalCount}
      />

      {/* Main View Area with Sidebar */}
      <div className="flex-1 flex max-w-[1920px] mx-auto w-full">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeIncidentsCount={activeIncidents.length}
          criticalIncidentsCount={criticalCount}
        />

        {/* View Workspace */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] cyber-grid-bg relative">
          {/* Ambient Colorful Aurora Lights */}
          <div className="aurora-glow top-0 left-1/4 w-[500px] h-[350px] bg-cyan-500/10" />
          <div className="aurora-glow top-60 right-10 w-[450px] h-[400px] bg-purple-500/10" />
          <div className="aurora-glow bottom-10 left-1/3 w-[600px] h-[300px] bg-rose-500/10" />

          {activeTab === 'dashboard' && (
            <DashboardView
              incidents={incidents}
              assets={assets}
              report={report}
              onSelectTab={setActiveTab}
              onSelectIncident={id => {
                setSelectedIncidentId(id);
                setActiveTab('incidents');
              }}
              onLoadScenario={scId => {
                handleLoadScenarioFromPalette(scId);
              }}
            />
          )}

          {activeTab === 'analyzer' && (
            <ThreatAnalyzerView
              onEscalateIncident={handleEscalateIncident}
              onSendToCopilot={handleSendToCopilot}
              onSelectTab={setActiveTab}
              activeAnalysis={activeAnalysis}
              setActiveAnalysis={setActiveAnalysis}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectTab={setActiveTab}
              selectedIncidentId={selectedIncidentId}
              setSelectedIncidentId={setSelectedIncidentId}
              onRefreshIncidents={async () => {
                const updated = await api.getIncidents();
                setIncidents(updated);
              }}
            />
          )}

          {activeTab === 'risk' && <RiskIntelligenceView />}

          {activeTab === 'playbooks' && (
            <PlaybooksView
              playbooks={playbooks}
              onRefreshPlaybooks={async () => {
                const updated = await api.getPlaybooks();
                setPlaybooks(updated);
              }}
              onRefreshAudit={async () => {
                const aud = await api.getAuditLogs();
                setAuditLogs(aud);
              }}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotView
              activeAnalysis={activeAnalysis}
              copilotMessages={copilotMessages}
              setCopilotMessages={setCopilotMessages}
            />
          )}

          {activeTab === 'assets' && (
            <AssetInventoryView
              assets={assets}
              onSelectIncident={id => {
                setSelectedIncidentId(id);
                setActiveTab('incidents');
              }}
            />
          )}

          {activeTab === 'rules' && (
            <DetectionRulesView
              rules={rules}
              onRefreshRules={async () => {
                const updated = await api.getRules();
                setRules(updated);
              }}
              onRefreshAudit={async () => {
                const aud = await api.getAuditLogs();
                setAuditLogs(aud);
              }}
            />
          )}

          {activeTab === 'audit' && <AuditLogView auditLogs={auditLogs} />}

          {activeTab === 'report' && <ExecutiveReportView report={report} />}

          {activeTab === 'settings' && (
            <SettingsView
              aiStatus={aiProviderStatus}
              audioEnabled={audioEnabled}
              onToggleAudio={() => setAudioEnabled(!audioEnabled)}
              onRefreshHealth={async () => {
                const hlth = await api.getHealth();
                if (hlth?.aiProvider) setAiProviderStatus(hlth.aiProvider);
              }}
            />
          )}
        </main>
      </div>

      {/* Interactive Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onLoadScenario={handleLoadScenarioFromPalette}
        onResetDemo={handleResetDemo}
      />

      {/* Guided Tour Walkthrough */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={setActiveTab}
        onLoadScenario={handleLoadScenarioFromPalette}
      />
    </div>
  );
}
