'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useToast } from '@/components/ToastProvider';
import { Card, CardHeader, CardBody, Button, KPICard } from '@/components/ui';
import { BarChart3, Download, DollarSign, Users, Wrench, UserCheck, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { paymentTrends } from '@/lib/mockData';

export default function AdminReports() {
  const { payments, tickets, visitors, flats, tenants } = useAppStore();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');

  const handleExport = (type: string) => toast(`Exporting ${type} report as PDF...`);

  const serviceRevenue = payments.filter(p => p.recipient === 'admin' && p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const totalRent = payments.filter(p => p.recipient === 'owner' && p.status === 'paid').reduce((a, p) => a + p.amount, 0);

  const maintenanceByCategory = ['electrical', 'plumbing', 'carpentry', 'cleaning', 'other'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    total: tickets.filter(t => t.category === cat).length,
    resolved: tickets.filter(t => t.category === cat && t.status === 'resolved').length,
  }));

  const visitorStats = [
    { name: 'Pre-reg.', value: visitors.filter(v => v.type === 'expected').length },
    { name: 'Walk-in', value: visitors.filter(v => v.type === 'walkin').length },
    { name: 'Arrived', value: visitors.filter(v => v.status === 'arrived').length },
    { name: 'Exited', value: visitors.filter(v => v.status === 'exited').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Comprehensive building society reports</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <span className="text-slate-400">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Flats" value={flats.length} icon={<BarChart3 className="w-5 h-5" />} color="indigo" />
        <KPICard title="Active Tenants" value={tenants.filter(t => t.status === 'active').length} icon={<Users className="w-5 h-5" />} color="blue" />
        <KPICard title="Service Revenue" value={formatCurrency(serviceRevenue)} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <KPICard title="Tickets Resolved" value={tickets.filter(t => t.status === 'resolved').length} icon={<Wrench className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Payment Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly payment collection trends</p>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('payment')}>Export PDF</Button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `৳${v/1000}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="rent" name="Rent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="service" name="Service" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Maintenance Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Maintenance Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tickets by category</p>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('maintenance')}>Export PDF</Button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={maintenanceByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Visitor Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Visitor Report</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visitor statistics summary</p>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('visitor')}>Export PDF</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3">
              {visitorStats.map(s => (
                <div key={s.name} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.name}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Occupancy Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Occupancy Summary</h3>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => handleExport('occupancy')}>Export PDF</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {[
                { label: 'Total Flats', value: flats.length, color: 'bg-indigo-500' },
                { label: 'Occupied', value: flats.filter(f => f.status === 'occupied').length, color: 'bg-emerald-500' },
                { label: 'Vacant', value: flats.filter(f => f.status === 'vacant').length, color: 'bg-blue-500' },
                { label: 'Maintenance', value: flats.filter(f => f.status === 'maintenance').length, color: 'bg-amber-500' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${row.color}`} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{row.value}</span>
                  </div>
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${row.color}`} style={{ width: `${(row.value / flats.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
