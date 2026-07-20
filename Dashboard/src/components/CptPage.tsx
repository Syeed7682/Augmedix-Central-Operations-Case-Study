import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { CPT_CODES } from '../data';

interface Props { isDark: boolean }

export default function CptPage({ isDark }: Props) {
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

  // Volume comparison data
  const volumeData = CPT_CODES.map(c => ({
    code: c.code, desc: c.description,
    DB: c.dbCount, EHR: c.ehrCount,
  }));

  // Match rate data (sorted ascending = worst first)
  const matchData = [...CPT_CODES].sort((a, b) => a.matchPct - b.matchPct).map(c => ({
    code: c.code,
    matchPct: c.matchPct,
    color: c.matchPct >= 97 ? COLORS.matched : c.matchPct >= 92 ? COLORS.blue : COLORS.ehrOnly,
  }));

  // DB-Only data (sorted descending)
  const dbOnlyData = [...CPT_CODES].sort((a, b) => b.dbOnly - a.dbOnly).map(c => ({
    code: c.code, dbOnly: c.dbOnly,
  }));

  return (
    <div className="space-y-6">

      {/* Volume grouped bar - full width */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-sm font-bold ${textMain}`}>CPT Code: DB vs EHR Volume</div>
            <div className={`text-[11px] ${textSub}`}>Side-by-side count per code — standard PT CPT codes</div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>Top 5 = 93% of volume</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" {...grid} />
            <XAxis dataKey="code" {...ax} />
            <YAxis {...ax} />
            <Tooltip {...tip} />
            <Legend iconType="rect" iconSize={10} wrapperStyle={{ fontSize: 11, color: isDark ? '#94a3b8' : '#475569' }} />
            <Bar dataKey="DB"  fill={COLORS.blue} radius={[3,3,0,0]} />
            <Bar dataKey="EHR" fill={COLORS.matched} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col: Match rate + DB-Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Match rate horizontal */}
        <div className={cardClass}>
          <div className={`text-sm font-bold mb-1 ${textMain}`}>CPT Match Rate (Worst → Best)</div>
          <div className={`text-[11px] mb-4 ${textSub}`}>% of lines present in both systems</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={matchData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" {...ax} domain={[83, 100]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="code" {...ax} width={50} />
              <Tooltip {...tip} formatter={(v: number) => [`${v}%`, 'Match Rate']} />
              <Bar dataKey="matchPct" radius={[0,5,5,0]}>
                {matchData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* DB-Only horizontal */}
        <div className={cardClass}>
          <div className={`text-sm font-bold mb-1 ${textMain}`}>DB-Only Lines by CPT</div>
          <div className={`text-[11px] mb-4 ${textSub}`}>Most under-documented codes</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dbOnlyData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" {...ax} />
              <YAxis type="category" dataKey="code" {...ax} width={50} />
              <Tooltip {...tip} formatter={(v: number) => [v, 'DB-Only Lines']} />
              <Bar dataKey="dbOnly" fill={COLORS.dbOnly} radius={[0,5,5,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full CPT table */}
      <div className={cardClass}>
        <div className={`text-sm font-bold mb-4 ${textMain}`}>CPT Code Reference & Discrepancy Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${tableHeader}`}>
                {['CPT Code','Description','Total','Matched','DB-Only','EHR-Only','Match %','DB Count','EHR Count'].map((h, idx) => (
                  <th key={h} className={`text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider ${idx === 0 && !isDark ? 'rounded-tl-lg' : ''} ${idx === 8 && !isDark ? 'rounded-tr-lg' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CPT_CODES.map((c, i) => {
                const matchColor = c.matchPct >= 97 ? COLORS.matched : c.matchPct >= 92 ? COLORS.blue : COLORS.ehrOnly;
                return (
                  <tr key={i} className={`border-b transition-colors ${tableRow}`}>
                    <td className="py-2.5 px-3">
                      <code className={`text-xs px-2 py-0.5 rounded font-mono ${isDark ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-blue-700'}`}>{c.code}</code>
                    </td>
                    <td className={`py-2.5 px-3 ${tableValue}`}>{c.description}</td>
                    <td className={`py-2.5 px-3 font-medium ${textMain}`}>{c.total.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-medium" style={{ color: COLORS.matched }}>{c.matched.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: COLORS.dbOnly }}>{c.dbOnly}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: COLORS.ehrOnly }}>{c.ehrOnly}</td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: matchColor }}>{c.matchPct}%</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.dbCount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.ehrCount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
