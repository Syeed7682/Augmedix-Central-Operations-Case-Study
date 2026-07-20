import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MONTHLY, DUPLICATE_SESSIONS } from '../data';

interface Props { isDark: boolean }

export default function GapAnalysisPage({ isDark }: Props) {
  const COLORS = {
    matched: isDark ? '#34d399' : '#10b981', // emerald
    dbOnly:  isDark ? '#fb7185' : '#e11d48', // rose
    ehrOnly: isDark ? '#fbbf24' : '#d97706', // amber
    blue:    isDark ? '#60a5fa' : '#3b82f6', // blue
  };

  const RECOMMENDATIONS = [
    {
      icon: '🚨',
      bg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
      title: 'Immediate (0–7 days): Audit 202 DB-Only CPT Lines',
      desc: 'These codes were billed but have no EHR documentation — compliance and audit exposure before the next billing cycle.',
      badge: '202 lines',
      badgeColor: isDark ? 'text-rose-400' : 'text-rose-700',
    },
    {
      icon: '💰',
      bg: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
      title: 'Immediate (0–7 days): Review 1,357 EHR-Only Lines for Revenue Recovery',
      desc: 'Clinically documented but not billed. Each line = unbilled PT service — direct revenue leakage requiring charge capture review.',
      badge: '1,357 lines',
      badgeColor: isDark ? 'text-amber-400' : 'text-amber-700',
    },
    {
      icon: '🔁',
      bg: isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
      title: 'Immediate: Correct 15 Duplicate CPT Sessions in DB',
      desc: 'Sessions where same CPT code was entered more than once — inflated billing risk. Needs validation rules in the practice management system.',
      badge: '15 sessions',
      badgeColor: isDark ? 'text-rose-400' : 'text-rose-700',
    },
    {
      icon: '📊',
      bg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200',
      title: 'Short-Term (30 days): Coach Liam Young — 89.9% Match Rate',
      desc: 'Only provider below the 90% SLA threshold. 87 DB-only lines indicates a documentation workflow gap. Targeted training recommended.',
      badge: 'YELLOW ⚠️',
      badgeColor: isDark ? 'text-blue-400' : 'text-blue-700',
    },
    {
      icon: '📉',
      bg: isDark ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200',
      title: 'Short-Term (30 days): Halt Match Rate Decline (95.8% → 93.1%)',
      desc: 'Documentation accuracy has fallen 2.7 points in 3 months. Set up real-time reconciliation alerts within 24h of each session.',
      badge: '−2.7 pts',
      badgeColor: isDark ? 'text-orange-400' : 'text-orange-700',
    },
    {
      icon: '🤖',
      bg: isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200',
      title: 'Long-Term (90 days): Deploy Augmedix Ambient AI Documentation',
      desc: 'Auto-capture CPT codes from session notes — eliminate manual entry errors and close the DB↔EHR gap at source. Target: ≥99% match rate.',
      badge: 'AI Solution',
      badgeColor: isDark ? 'text-purple-400' : 'text-purple-700',
    },
  ];

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

  const gapTrendData = MONTHLY.map(m => ({
    name: m.label,
    'DB-Only': m.dbOnly,
    'EHR-Only': m.ehrOnly,
    Total: m.dbOnly + m.ehrOnly,
  }));

  const gapPie = [
    { name: 'EHR-Only (Underbilled)', value: 1357, color: COLORS.ehrOnly },
    { name: 'DB-Only (Undocumented)', value: 202,  color: COLORS.dbOnly  },
  ];

  return (
    <div className="space-y-6">

      {/* Alert banner */}
      <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-rose-500/5 border-rose-500/20' : 'bg-rose-50 border-rose-200 shadow-sm'} text-sm`}>
        <span className="text-xl flex-shrink-0">🚨</span>
        <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>
          <strong className={isDark ? 'text-rose-300' : 'text-rose-700'}>3 anomaly types detected:</strong>{' '}
          <span>
            202 DB-only lines (compliance risk), 1,357 EHR-only lines (revenue leakage),
            and 15 sessions with duplicate CPT codes (billing errors).
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Gap trend line */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm font-bold ${textMain}`}>Monthly Gap Volume</div>
              <div className={`text-[11px] ${textSub}`}>DB-Only & EHR-Only count per month</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>Sep is worst</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={gapTrendData}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="name" {...ax} />
              <YAxis {...ax} />
              <Tooltip {...tip} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: isDark ? '#94a3b8' : '#475569' }} />
              <Line type="monotone" dataKey="DB-Only"  stroke={COLORS.dbOnly}  strokeWidth={2.5} dot={{ r:5, fill: COLORS.dbOnly }} />
              <Line type="monotone" dataKey="EHR-Only" stroke={COLORS.ehrOnly} strokeWidth={2.5} dot={{ r:5, fill: COLORS.ehrOnly }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gap distribution donut */}
        <div className={cardClass}>
          <div className={`text-sm font-bold mb-1 ${textMain}`}>Gap Type Distribution</div>
          <div className={`text-[11px] mb-4 ${textSub}`}>1,559 total gap lines classified</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={gapPie} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value" stroke="none">
                {gapPie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                {...tip}
                formatter={(v: number, name: string) => [
                  `${v.toLocaleString()} lines (${(v/1559*100).toFixed(1)}%)`, name
                ]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: isDark ? '#94a3b8' : '#475569' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Duplicate sessions table */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className={`text-sm font-bold ${textMain}`}>Sessions with Duplicate CPT Codes</div>
            <div className={`text-[11px] ${textSub}`}>15 sessions where the same CPT code appeared more than once</div>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>15 Billing Errors</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${tableHeader}`}>
                {['Patient','Provider','Date','Raw CPT Array','Unique','Raw','Dups Removed'].map((h, idx) => (
                  <th key={h} className={`text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider ${idx === 0 && !isDark ? 'rounded-tl-lg' : ''} ${idx === 6 && !isDark ? 'rounded-tr-lg' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DUPLICATE_SESSIONS.map((d, i) => (
                <tr key={i} className={`border-b transition-colors ${tableRow}`}>
                  <td className={`py-2.5 px-3 font-semibold ${textMain}`}>{d.patient}</td>
                  <td className={`py-2.5 px-3 ${tableValue}`}>{d.provider}</td>
                  <td className={`py-2.5 px-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{d.date}</td>
                  <td className="py-2.5 px-3 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    <code className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title={d.rawCpt}>{d.rawCpt}</code>
                  </td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: COLORS.matched }}>{d.uniqueCount}</td>
                  <td className={`py-2.5 px-3 ${tableValue}`}>{d.rawCount}</td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: COLORS.dbOnly }}>−{d.dupsRemoved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Recommended Actions</h2>
        <div className="space-y-3">
          {RECOMMENDATIONS.map((r, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${r.bg} ${isDark ? 'hover:brightness-110' : 'hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]'} transition-all duration-200`}>
              <div className={`text-xl flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${textMain}`}>{r.title}</div>
                <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{r.desc}</div>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${r.badgeColor}`}>{r.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
