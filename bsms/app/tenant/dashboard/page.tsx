'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, CardHeader, KPICard, Badge } from '@/components/ui';
import { CreditCard, Wrench, UserCheck, Megaphone, AlertCircle } from 'lucide-react';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function TenantDashboard() {
  const { payments, tickets, visitors, announcements, flats } = useAppStore();
  const { user } = useAuthStore();

  const myPayments = payments.filter(p => p.tenantId && user && (p.tenantName === user.name));
  const myTickets = tickets.filter(t => t.tenantId && user && t.tenantName === user.name);
  const myVisitors = visitors.filter(v => v.tenantId === 'u3' || v.tenantName === user?.name);
  const myFlat = flats.find(f => f.tenantId === user?.id);

  const unpaidRent = myPayments.find(p => p.type === 'rent' && p.status !== 'paid');
  const unpaidService = myPayments.find(p => p.type === 'service_charge' && p.status !== 'paid');
  const unreadAnns = announcements.filter(a => (a.targetRole === 'all' || a.targetRole === 'tenant') && !a.readBy.includes(user?.id || '')).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hello, {user?.name?.split(' ')[0]} 👋</h2>
        {myFlat && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Flat {myFlat.number} · Floor {myFlat.floor}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Pending Payments" value={myPayments.filter(p => p.status !== 'paid').length} icon={<CreditCard className="w-5 h-5" />} color={unpaidRent ? 'red' : 'emerald'} />
        <KPICard title="Open Tickets" value={myTickets.filter(t => t.status !== 'resolved').length} icon={<Wrench className="w-5 h-5" />} color="amber" />
        <KPICard title="Expected Visitors" value={myVisitors.filter(v => v.status === 'pending').length} icon={<UserCheck className="w-5 h-5" />} color="blue" />
        <KPICard title="Unread Announcements" value={unreadAnns} icon={<Megaphone className="w-5 h-5" />} color={unreadAnns > 0 ? 'indigo' : 'emerald'} />
      </div>

      {/* Quick Pay Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rent Payment */}
        <Card className="p-5 border-2 border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Rent Payment</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">💸 This payment goes to Owner</p>
            </div>
            <Badge className={getStatusColor(unpaidRent ? unpaidRent.status : 'paid')}>{unpaidRent ? unpaidRent.status : 'up to date'}</Badge>
          </div>
          {myFlat && <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(myFlat.monthlyRent)}</p>}
          <p className="text-xs text-slate-500 mb-4">To: {myFlat?.ownerName || 'Owner'}</p>
          <Link href="/tenant/payments" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <CreditCard className="w-4 h-4" /> Pay Rent
          </Link>
        </Card>

        {/* Service Charge */}
        <Card className="p-5 border-2 border-dashed border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Service Charges</h3>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5 font-medium">🏢 This payment goes to Admin</p>
            </div>
            <Badge className={getStatusColor(unpaidService ? unpaidService.status : 'paid')}>{unpaidService ? unpaidService.status : 'up to date'}</Badge>
          </div>
          {unpaidService && <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(unpaidService.amount)}</p>}
          <p className="text-xs text-slate-500 mb-4">To: Building Administration</p>
          <Link href="/tenant/payments" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            <CreditCard className="w-4 h-4" /> Pay Service Charges
          </Link>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">My Maintenance Tickets</h3>
            <Link href="/tenant/maintenance" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {myTickets.length === 0 ? (
            <div className="px-6 py-6 text-center text-sm text-slate-500">No maintenance tickets. All good! 🎉</div>
          ) : myTickets.slice(0, 3).map(t => (
            <div key={t.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{t.ticketId}</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{t.description.slice(0, 50)}...</p>
              </div>
              <Badge className={getStatusColor(t.status)}>{t.status.replace('_', ' ')}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
