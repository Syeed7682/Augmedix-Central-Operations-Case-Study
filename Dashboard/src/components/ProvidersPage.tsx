import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { PROVIDERS } from '../data';

interface Props { isDark: boolean }

function Rag({ status, isDark }: { status: 'GREEN'|'YELLOW'|'RED'; isDark: boolean }) {
  const cfg = {
    GREEN:  { bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50 border border-emerald-200', text: isDark ? 'text-emerald-400' : 'text-emerald-700', dot: isDark ? 'bg-emerald-400' : 'bg-emerald-500', label:'GREEN'  },
    YELLOW: { bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50 border border-amber-200',  text: isDark ? 'text-amber-400' : 'text-amber-700',  dot: isDark ? 'bg-amber-400' : 'bg-amber-500',  label:'YELLOW' },
    RED:    { bg: isDark ? 'bg-rose-500/10' : 'bg-rose-50 border border-rose-200',     text: isDark ? 'text-rose-400' : 'text-rose-700',     dot: isDark ? 'bg-rose-400' : 'bg-rose-500',     label:'RED'    },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ pct, color, isDark }: { pct: number; color: string; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold min-w-[40px] text-right" style={{ color: color }}>{pct}%</span>
    </div>
  );
}

export default function ProvidersPage({ isDark }: Props) {
  const COLORS = {
    matched: isDark ? '#34d399' : '#10b981', // emerald
    dbOnly:  isDark ? '#fb7185' : '#e11d48', // rose
    ehrOnly: isDark ? '#fbbf24' : '#d97706', // amber
    blue:    isDark ? '#60a5fa' : '#3b82f6', // blue
  };

  const tip = {
    contentStyle: { background: isDark ? '#1e293b' : '#fff', border: isDark ? '1px solid #334155' : '1px solid #f1f5f9', borderRadius:8, fontSize:12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    labelStyle:   { color: isDark ? '#cbd5e1' : '#334155', fontWeight:600 },
    itemStyle:    { color: isDark ? '#94a3b8' : '#64748b' },
  };
  const ax = { stroke: isDark ? '#475569' : '#cbd5e1', fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' };
  const grid = { stroke: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' };

  const cardClass = `rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'} p-5`;
  const textMain = isDark ? 'text-slate-200' : 'text-slate-700';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';
  const tableHeader = isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500 bg-slate-50/50';
  const tableRow = isDark ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50';
  const tableValue = isDark ? 'text-slate-300' : 'text-slate-600';

  const barData = PROVIDERS.map(p => ({
    name:     p.name.split(' ')[0],
    fullName: p.name,
    matchPct: p.matchPct,
    dbOnly:   p.dbOnly,
    ehrOnly:  p.ehrOnly,
    color:    p.rag === 'GREEN' ? COLORS.matched : p.rag === 'YELLOW' ? COLORS.ehrOnly : COLORS.dbOnly,
  }));

  return (
    <div className="space-y-6">

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Match Rate bar */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm font-bold ${textMain}`}>Match Rate by Provider</div>
              <div className={`text-[11px] ${textSub}`}>GREEN ≥90% · YELLOW ≥75% · RED &lt;75%</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>1 Flagged</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" {...ax} domain={[85, 100]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" {...ax} width={72} />
              <Tooltip {...tip} formatter={(v: number) => [`${v}%`, 'Match Rate']} />
              <Bar dataKey="matchPct" radius={[0,5,5,0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DB-Only bar */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm font-bold ${textMain}`}>DB-Only Lines by Provider</div>
              <div className={`text-[11px] ${textSub}`}>Billed but missing from EHR</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>Audit Risk</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" {...ax} />
              <YAxis type="category" dataKey="name" {...ax} width={72} />
              <Tooltip {...tip} formatter={(v: number) => [v, 'DB-Only Lines']} />
              <Bar dataKey="dbOnly" fill={COLORS.dbOnly} radius={[0,5,5,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider scorecard table */}
      <div className={cardClass}>
        <div className={`text-sm font-bold mb-4 ${textMain}`}>Provider Documentation Scorecard</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${tableHeader}`}>
                {['Provider','Total CPT Lines','Match Rate','Matched','DB-Only','EHR-Only','Status'].map((h, idx) => (
                  <th key={h} className={`text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider ${idx === 0 && !isDark ? 'rounded-tl-lg' : ''} ${idx === 6 && !isDark ? 'rounded-tr-lg' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((p, i) => (
                <tr key={i} className={`border-b transition-colors ${tableRow}`}>
                  <td className={`py-3 px-3 font-semibold ${textMain}`}>{p.name}</td>
                  <td className={`py-3 px-3 ${tableValue}`}>{p.total.toLocaleString()}</td>
                  <td className="py-3 px-3 min-w-[160px]">
                    <ProgressBar
                      isDark={isDark}
                      pct={p.matchPct}
                      color={p.rag === 'GREEN' ? COLORS.matched : p.rag === 'YELLOW' ? COLORS.ehrOnly : COLORS.dbOnly}
                    />
                  </td>
                  <td className="py-3 px-3 font-medium" style={{ color: COLORS.matched }}>{p.matched.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold"    style={{ color: COLORS.dbOnly }}>{p.dbOnly}</td>
                  <td className="py-3 px-3 font-bold"    style={{ color: COLORS.ehrOnly }}>{p.ehrOnly}</td>
                  <td className="py-3 px-3"><Rag isDark={isDark} status={p.rag} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EHR-Only stacked bar */}
      <div className={cardClass}>
        <div className={`text-sm font-bold mb-1 ${textMain}`}>EHR-Only Lines by Provider</div>
        <div className={`text-[11px] mb-4 ${textSub}`}>Documented in EHR but NOT captured in billing DB — potential revenue leakage</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PROVIDERS.map(p => ({ name: p.name.split(' ')[0], 'EHR-Only': p.ehrOnly }))}>
            <CartesianGrid strokeDasharray="3 3" {...grid} />
            <XAxis dataKey="name" {...ax} />
            <YAxis {...ax} />
            <Tooltip {...tip} formatter={(v: number) => [v, 'EHR-Only Lines']} />
            <Bar dataKey="EHR-Only" fill={COLORS.ehrOnly} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
