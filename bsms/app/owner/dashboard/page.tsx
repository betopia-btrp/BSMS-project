'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardHeader, CardBody, KPICard, Badge } from '@/components/ui';
import { Building2, DollarSign, Wrench, TrendingUp } from 'lucide-react';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OwnerDashboard() {
  const { flats, payments, tickets } = useAppStore();
  const { user } = useAuthStore();

  const myFlats = flats.filter(f => f.ownerId === user?.id);
  const myPayments = payments.filter(p => p.ownerId === user?.id && p.status === 'paid');
  const totalIncome = myPayments.reduce((a, p) => a + p.amount, 0);
  const myTickets = tickets.filter(t => myFlats.some(f => f.id === t.flatId));

  const monthlyData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
    month,
    income: myPayments.filter(p => p.month.includes('-0') || p.month.includes('-1')).reduce((a, p) => a + p.amount / 6, 0),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your property portfolio overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="My Flats" value={myFlats.length} icon={<Building2 className="w-5 h-5" />} color="emerald" />
        <KPICard title="Occupied" value={myFlats.filter(f => f.status === 'occupied').length} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <KPICard title="Total Rent Received" value={formatCurrency(totalIncome)} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <KPICard title="Maintenance Issues" value={myTickets.filter(t => t.status !== 'resolved').length} icon={<Wrench className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Flats */}
        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900 dark:text-white">My Properties</h3></CardHeader>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {myFlats.map(flat => (
              <div key={flat.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{flat.number}</span>
                    <Badge className={getStatusColor(flat.status)}>{flat.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{flat.size} · Floor {flat.floor}</p>
                  {flat.tenantName && <p className="text-xs text-slate-500 mt-0.5">Tenant: {flat.tenantName}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(flat.monthlyRent)}</p>
                  <p className="text-xs text-slate-500">/ month</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Income Chart */}
        <Card>
          <CardHeader><h3 className="font-semibold text-slate-900 dark:text-white">Monthly Income</h3></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `৳${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Math.round(v))} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="income" name="Rent" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader><h3 className="font-semibold text-slate-900 dark:text-white">Recent Rent Received</h3></CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {myPayments.slice(0, 5).map(p => (
            <div key={p.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{p.tenantName}</p>
                <p className="text-xs text-slate-500">Flat {p.flatNumber} · {p.month}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</p>
                <p className="text-xs text-slate-500">{p.paidDate ? formatDate(p.paidDate) : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
