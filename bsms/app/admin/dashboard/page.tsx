'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { KPICard, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { Building2, Users, TrendingUp, DollarSign, Wrench, UserCheck, Bell } from 'lucide-react';
import { formatCurrency, getStatusColor, formatDateTime } from '@/lib/utils';
import { paymentTrends } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const { flats, tenants, payments, tickets, announcements } = useAppStore();
  const { user } = useAuthStore();

  const totalFlats = flats.length;
  const occupied = flats.filter(f => f.status === 'occupied').length;
  const vacant = flats.filter(f => f.status === 'vacant').length;
  const maintenance = flats.filter(f => f.status === 'maintenance').length;

  const serviceRevenue = payments.filter(p => p.recipient === 'admin' && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const openTickets = tickets.filter(t => t.status === 'open').length;

  const occupancyData = [
    { name: 'Occupied', value: occupied, color: '#10b981' },
    { name: 'Vacant', value: vacant, color: '#3b82f6' },
    { name: 'Maintenance', value: maintenance, color: '#f59e0b' },
  ];

  const recentActivity = [
    ...payments.slice(0, 2).map(p => ({ id: p.id, text: `${p.tenantName} paid ${formatCurrency(p.amount)} for ${p.type === 'rent' ? 'rent' : 'service charge'}`, time: p.paidDate || p.dueDate, type: 'payment' })),
    ...tickets.slice(0, 2).map(t => ({ id: t.id, text: `Maintenance ticket ${t.ticketId} from ${t.tenantName} — ${t.category}`, time: t.createdAt, type: 'maintenance' })),
    ...announcements.slice(0, 1).map(a => ({ id: a.id, text: `Announcement: ${a.title}`, time: a.createdAt, type: 'announcement' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Good morning, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here's what's happening in your building today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Flats" value={totalFlats} icon={<Building2 className="w-5 h-5" />} color="indigo" trend={{ value: '6 floors', positive: true }} />
        <KPICard title="Occupied" value={occupied} icon={<Users className="w-5 h-5" />} color="emerald" trend={{ value: `${Math.round(occupied/totalFlats*100)}% rate`, positive: true }} />
        <KPICard title="Service Revenue" value={formatCurrency(serviceRevenue)} icon={<DollarSign className="w-5 h-5" />} color="blue" trend={{ value: 'This month', positive: true }} />
        <KPICard title="Open Tickets" value={openTickets} icon={<Wrench className="w-5 h-5" />} color={openTickets > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-slate-900 dark:text-white">Payment Trends</h3>
            <p className="text-xs text-slate-500 mt-0.5">Last 6 months service charge collections</p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={paymentTrends} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="serviceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `৳${v/1000}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }} />
                <Area type="monotone" dataKey="rent" name="Rent" stroke="#6366f1" strokeWidth={2} fill="url(#rentGrad)" />
                <Area type="monotone" dataKey="service" name="Service" stroke="#10b981" strokeWidth={2} fill="url(#serviceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Occupancy Pie */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900 dark:text-white">Flat Status</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {occupancyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [v, 'Flats']} contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {occupancyData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentActivity.map((act, i) => {
            const icons: Record<string, React.ReactNode> = {
              payment: <DollarSign className="w-4 h-4 text-emerald-500" />,
              maintenance: <Wrench className="w-4 h-4 text-amber-500" />,
              announcement: <Bell className="w-4 h-4 text-indigo-500" />,
            };
            const colors: Record<string, string> = {
              payment: 'bg-emerald-50 dark:bg-emerald-900/20',
              maintenance: 'bg-amber-50 dark:bg-amber-900/20',
              announcement: 'bg-indigo-50 dark:bg-indigo-900/20',
            };
            return (
              <div key={i} className="flex items-start gap-4 px-6 py-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${colors[act.type]}`}>{icons[act.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{act.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(act.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
