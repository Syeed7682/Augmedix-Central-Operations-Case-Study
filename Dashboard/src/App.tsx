import React, { useState } from 'react';
import { Activity, TrendingUp, ShieldAlert, Users, BarChart2, Sun, Moon } from 'lucide-react';
import OverviewPage     from './components/OverviewPage';
import ProvidersPage    from './components/ProvidersPage';
import CptPage          from './components/CptPage';
import GapAnalysisPage  from './components/GapAnalysisPage';
import RcmDashboardPage from './components/RcmDashboardPage';

type Tab = 'overview' | 'providers' | 'cpt' | 'gaps' | 'rcm';

const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'overview',   label: 'Executive Overview',   icon: <TrendingUp  className="h-4 w-4" />, desc: 'High-Level Reconciliation Status' },
  { id: 'providers',  label: 'Provider Performance', icon: <Users       className="h-4 w-4" />, desc: 'Match Rates & Discrepancies by Provider' },
  { id: 'cpt',        label: 'CPT Code Analysis',    icon: <BarChart2   className="h-4 w-4" />, desc: 'DB vs EHR Volume & Match %' },
  { id: 'gaps',       label: 'Gap & Operations',     icon: <ShieldAlert className="h-4 w-4" />, desc: 'Revenue Leakage & Action Plan' },
  { id: 'rcm',        label: 'RCM Sandbox',          icon: <Activity    className="h-4 w-4" />, desc: 'Generic Claim Trends & Denials' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isDark, setIsDark]       = useState<boolean>(true);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-all duration-300 font-sans ${
      isDark ? 'dark bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-[#1E293B]'
    }`}>
      
      {/* High Density Left Sidebar */}
      <aside className={`w-full md:w-64 flex flex-col border-r flex-shrink-0 transition-colors ${
        isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-[#E2E8F0]'
      }`}>
        
        {/* Sidebar Header with Logo */}
        <div className={`p-5 border-b flex items-center gap-2.5 transition-colors ${
          isDark ? 'border-slate-800/60' : 'border-slate-200'
        }`}>
          <div className="p-1.5 bg-[#3B82F6] rounded-lg text-white shadow-md shadow-blue-500/15">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold tracking-tight text-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>AUGMEDIX OPS</span>
              <span className="text-[8px] uppercase tracking-wider bg-blue-500/20 text-blue-500 px-1 py-0.5 rounded font-bold">
                Q3 2024
              </span>
            </div>
            <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              PT Doc Reconciliation
            </p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow py-4 px-2 space-y-0.5">
          <span className={`px-3 text-[9px] font-bold uppercase tracking-widest block mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Navigation
          </span>

          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-btn-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-md transition duration-150 flex items-center gap-2.5 ${
                activeTab === t.id
                  ? (isDark 
                      ? 'bg-slate-800/85 text-[#3B82F6] border-l-3 border-[#3B82F6] font-bold' 
                      : 'bg-blue-50 text-blue-700 border-l-3 border-blue-600 font-bold')
                  : (isDark 
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-3 border-transparent' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-l-3 border-transparent')
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* High Density Integrated Dataset Info (Replacing Filters) */}
        <div className={`p-4 border-t space-y-3 transition-colors ${
          isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-bold uppercase tracking-widest block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Dataset Scope
            </span>
            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1 py-0.5 rounded font-mono">
              Live
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Period</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Jul – Sep 2024</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Sessions</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>6,482</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>CPT Lines</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>26,716</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Providers</span>
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>8</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Right Area Container */}
      <div className="flex-grow flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Professional Header */}
        <header className={`px-6 py-3.5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-10 transition-colors ${
          isDark ? 'bg-[#131A2E]/95 border-slate-800/80 backdrop-blur-md' : 'bg-white/95 border-[#E2E8F0] backdrop-blur-md shadow-sm'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-sm font-bold tracking-tight uppercase font-sans ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
              <span className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold border ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/15' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                Reconciliation
              </span>
            </div>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Physical Therapy • {TABS.find(t => t.id === activeTab)?.desc}
            </p>
          </div>

          {/* Global Indicators & Controls */}
          <div className="flex items-center flex-wrap gap-2.5 text-xs">
            
            {/* Match Rate Banner */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
              <span>94.16% MATCH RATE</span>
            </div>

            {/* Scope Claims */}
            <div className={`px-2 py-0.5 rounded border flex items-center gap-1 text-[10px] font-mono ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-[#E2E8F0] text-slate-600'
            }`}>
              <span className="h-1 w-1 rounded-full bg-blue-500" />
              <span>Volume: 26,716 Lines</span>
            </div>

            {/* Theme switcher */}
            <button
              id="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded transition duration-200 border ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                  : 'bg-white border-[#E2E8F0] text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Accessibility Theme"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </header>

        {/* Main Content Pane */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview'  && <OverviewPage    isDark={isDark} />}
          {activeTab === 'providers' && <ProvidersPage   isDark={isDark} />}
          {activeTab === 'cpt'       && <CptPage         isDark={isDark} />}
          {activeTab === 'gaps'      && <GapAnalysisPage isDark={isDark} />}
          {activeTab === 'rcm'       && <RcmDashboardPage isDark={isDark} />}
        </main>

        {/* Global Status Footer */}
        <footer className={`px-6 py-2.5 text-[10px] border-t transition-colors ${
          isDark ? 'bg-[#090C14] border-slate-900 text-slate-500' : 'bg-white border-[#E2E8F0] text-slate-400 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 max-w-7xl mx-auto w-full">
            <span>
              Augmedix Data Operations Assessment • PT Documentation Reconciliation • Built with React 19 + Tailwind v4 + Recharts
            </span>
            <span className="font-mono">
              System Status: Nominal • Last Refreshed: {new Date().toISOString().slice(0, 16).replace('T', ' ')}
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
