import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle,
  CheckCircle, Clock, ArrowUpRight, ShieldAlert, Percent, Download, Users, BarChart2
} from 'lucide-react';
import { MONTHLY, RECON_SUMMARY } from '../data';

interface Props { isDark: boolean }

export default function OverviewPage({ isDark }: Props) {
  const COLORS = {
    matched: isDark ? '#10B981' : '#10B981', // emerald
    dbOnly:  isDark ? '#EF4444' : '#EF4444', // red
    ehrOnly: isDark ? '#F59E0B' : '#F59E0B', // amber
    blue:    isDark ? '#3B82F6' : '#3B82F6', // blue
    cyan:    isDark ? '#06b6d4' : '#06b6d4', // cyan
  };

  const monthlyData = MONTHLY.map(m => ({
    name: m.label,
    Matched: m.matched,
    'EHR-Only': m.ehrOnly,
    'DB-Only': m.dbOnly,
    matchRate: m.matchRate,
    sessions: m.sessions,
  }));

  const reconPie = [
    { name: 'Matched',           value: 25157, color: COLORS.matched },
    { name: 'EHR-Only (Unbilled)', value: 1357,  color: COLORS.ehrOnly },
    { name: 'DB-Only (Undocumented)', value: 202, color: COLORS.dbOnly  },
  ];

  // Helper for metric formatting
  const formatNum = (val: number) => val.toLocaleString();

  // Export CSV helper for metrics
  const exportSummaryCsv = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Therapy Sessions', '6,482'],
      ['Total CPT Lines Compared', '26,716'],
      ['Matched Lines', '25,157'],
      ['DB-Only (Compliance Risk)', '202'],
      ['EHR-Only (Revenue Leakage)', '1,357'],
      ['Overall Match Rate (%)', '94.16'],
      ['Duplicate Sessions', '15']
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PT_Reconciliation_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section with print/export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Executive Reconciliation Insights</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time PT documentation accuracy, compliance risks, and revenue capture.
          </p>
        </div>
        <button
          id="btn-export-summary-csv"
          onClick={exportSummaryCsv}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isDark 
              ? 'bg-slate-850 border border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white' 
              : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          Export Executive Metrics
        </button>
      </div>

      {/* KPI Stats Grid (Top 4 Big Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Match Rate */}
        <div className={`p-4 rounded-xl border transition-all duration-200 shadow-sm ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Overall Match Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-500">94.16%</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-rose-500">
              <TrendingDown className="h-3 w-3" />
              <span>Declining monthly</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Matched Lines */}
        <div className={`p-4 rounded-xl border transition-all duration-200 shadow-sm ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Matched CPT Lines</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>25,157</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Present in both DB & EHR</span>
            </div>
          </div>
        </div>

        {/* KPI 3: DB-Only */}
        <div className={`p-4 rounded-xl border transition-all duration-200 shadow-sm ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>DB-Only (Compliance Risk)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-rose-500">202</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Billed without documentation</span>
            </div>
          </div>
        </div>

        {/* KPI 4: EHR-Only */}
        <div className={`p-4 rounded-xl border transition-all duration-200 shadow-sm ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>EHR-Only (Revenue Leak)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-amber-500">1,357</span>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
              <span>Documented but not billed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Strip (4 Small Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/50'
        }`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 shadow-sm'}`}>
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Therapy Sessions</p>
            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>6,482</p>
          </div>
        </div>

        {/* CPT Lines */}
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/50'
        }`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-500 shadow-sm'}`}>
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total CPT Lines</p>
            <p className="text-sm font-bold text-blue-500">26,716</p>
          </div>
        </div>

        {/* Duplicate Sessions */}
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/50'
        }`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-rose-400' : 'bg-white text-rose-500 shadow-sm'}`}>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Duplicate Errors</p>
            <p className="text-sm font-bold text-rose-500">15 Sessions</p>
          </div>
        </div>

        {/* Providers */}
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-50 border-slate-200/50'
        }`}>
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500 shadow-sm'}`}>
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Providers</p>
            <p className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>8 Total (1 Flagged)</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart: Match Rate Trend */}
        <div className={`lg:col-span-2 p-5 rounded-xl border shadow-sm flex flex-col ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Monthly Documentation Match Rate</h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Visualizing the declining accuracy trend over the last 3 months.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Match Rate</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.matched} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.matched} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} vertical={false} />
                <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
                <YAxis domain={[91, 97]} tickFormatter={v => `${v}%`} stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Match Rate']}
                />
                <Area type="monotone" dataKey="matchRate" stroke={COLORS.matched} strokeWidth={2.5} fillOpacity={1} fill="url(#colorMatch)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Split */}
        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${
          isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
        }`}>
          <div>
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Reconciliation Breakdown</h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Percentage distribution of 26,716 CPT lines.
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reconPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {reconPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    fontSize: '11px',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [formatNum(Number(value))]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Lines</span>
              <p className={`text-xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>26.7k</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {reconPie.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{d.name}</span>
                </div>
                <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatNum(d.value)} ({((d.value / 26716) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className={`p-5 rounded-xl border shadow-sm ${
        isDark ? 'bg-[#131A2E] border-[#1E293B]' : 'bg-white border-[#E2E8F0]'
      }`}>
        <div className="mb-4">
          <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Monthly Gap Distribution Benchmarking</h3>
          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Comparing Matched vs EHR-Only vs DB-Only CPT lines over time.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#F1F5F9'} vertical={false} />
              <XAxis dataKey="name" stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
              <YAxis stroke={isDark ? '#94A3B8' : '#64748B'} fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  fontSize: '11px',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="Matched"   stackId="a" fill={COLORS.matched} radius={[0,0,0,0]} />
              <Bar dataKey="EHR-Only"  stackId="a" fill={COLORS.ehrOnly}  radius={[0,0,0,0]} />
              <Bar dataKey="DB-Only"   stackId="a" fill={COLORS.dbOnly}   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
