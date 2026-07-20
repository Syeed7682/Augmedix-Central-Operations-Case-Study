import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, FileText, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const REVENUE_TREND = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 59000 }, { month: 'Jun', revenue: 65000 }
];

const CLAIM_STATUS = [
  { name: 'Paid', value: 850, color: '#10B981' },
  { name: 'Denied', value: 120, color: '#EF4444' },
  { name: 'Pending', value: 30, color: '#F59E0B' }
];

const DENIALS_BY_CPT = [
  { cpt: '97110', denials: 45 }, { cpt: '97140', denials: 32 },
  { cpt: '97112', denials: 28 }, { cpt: '97530', denials: 15 }
];

const DENIALS_BY_INSURANCE = [
  { insurance: 'Medicare', denials: 55 }, { insurance: 'Aetna', denials: 30 },
  { insurance: 'BlueCross', denials: 25 }, { insurance: 'Cigna', denials: 10 }
];

const TOP_PROVIDERS = [
  { name: 'Liam Young', revenue: 125000 }, { name: 'Sarah Chen', revenue: 118000 },
  { name: 'Michael Ross', revenue: 95000 }, { name: 'Emily Davis', revenue: 88000 }
];

const CLAIMS_TABLE = [
  { id: 'CLM-1001', date: '2024-06-15', patient: 'John Doe', provider: 'Liam Young', cpt: '97110', amount: 150, status: 'Paid' },
  { id: 'CLM-1002', date: '2024-06-16', patient: 'Jane Smith', provider: 'Sarah Chen', cpt: '97140', amount: 120, status: 'Denied' },
  { id: 'CLM-1003', date: '2024-06-16', patient: 'Bob Wilson', provider: 'Michael Ross', cpt: '97112', amount: 135, status: 'Pending' },
  { id: 'CLM-1004', date: '2024-06-17', patient: 'Alice Brown', provider: 'Emily Davis', cpt: '97110', amount: 150, status: 'Paid' },
];

export default function RcmDashboardPage({ isDark }: { isDark: boolean }) {
  const cardBg = isDark ? 'bg-[#131A2E]' : 'bg-white';
  const borderCol = isDark ? 'border-slate-800' : 'border-slate-200';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Claims', val: '1,000', icon: <FileText/>, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Paid', val: '850', icon: <CheckCircle/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Denied', val: '120', icon: <AlertCircle/>, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Total Revenue', val: '$330K', icon: <DollarSign/>, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Denial Rate', val: '12.0%', icon: <TrendingUp/>, color: 'text-amber-500', bg: 'bg-amber-500/10' }
        ].map((kpi, i) => (
          <div key={i} className={`p-4 rounded-xl border shadow-sm ${cardBg} ${borderCol}`}>
            <div className="flex justify-between items-center mb-1"><span className={`text-xs font-semibold ${textSub}`}>{kpi.label}</span><div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>{React.cloneElement(kpi.icon, { className: "h-4 w-4" })}</div></div>
            <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-xl border shadow-sm ${cardBg} ${borderCol}`}>
          <h3 className="text-sm font-bold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'}/>
                <XAxis dataKey="month" fontSize={12} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <YAxis fontSize={12} tickFormatter={(val) => `$${val/1000}k`} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}/>
                <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`p-5 rounded-xl border shadow-sm ${cardBg} ${borderCol}`}>
          <h3 className="text-sm font-bold mb-4">Claim Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CLAIM_STATUS} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {CLAIM_STATUS.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-5 rounded-xl border shadow-sm ${cardBg} ${borderCol}`}>
          <h3 className="text-sm font-bold mb-4">Denials by CPT Code</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DENIALS_BY_CPT} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'}/>
                <XAxis type="number" fontSize={12} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <YAxis dataKey="cpt" type="category" fontSize={12} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}/>
                <Bar dataKey="denials" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`p-5 rounded-xl border shadow-sm ${cardBg} ${borderCol}`}>
          <h3 className="text-sm font-bold mb-4">Denials by Insurance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DENIALS_BY_INSURANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'}/>
                <XAxis dataKey="insurance" fontSize={12} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <YAxis fontSize={12} stroke={isDark ? '#94a3b8' : '#64748b'}/>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }}/>
                <Bar dataKey="denials" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-xl border shadow-sm overflow-x-auto ${cardBg} ${borderCol}`}>
        <h3 className="text-sm font-bold mb-4">Claims Detail Table</h3>
        <table className="w-full text-sm text-left">
          <thead className={`border-b uppercase text-xs ${isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            <tr>
              <th className="py-3 px-4">Claim ID</th><th className="py-3 px-4">Date</th><th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Provider</th><th className="py-3 px-4">CPT</th><th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {CLAIMS_TABLE.map((c, i) => (
              <tr key={i} className={`border-b ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                <td className="py-3 px-4 font-mono text-blue-500">{c.id}</td><td className="py-3 px-4">{c.date}</td>
                <td className="py-3 px-4 font-medium">{c.patient}</td><td className="py-3 px-4">{c.provider}</td>
                <td className="py-3 px-4">{c.cpt}</td><td className="py-3 px-4">${c.amount}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    c.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' :
                    c.status === 'Denied' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
