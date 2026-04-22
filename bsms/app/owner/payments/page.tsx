'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, Badge, Table, Th, Td, KPICard } from '@/components/ui';
import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { downloadPaymentReceipt } from '@/lib/pdf';

export default function OwnerPayments() {
  const { payments } = useAppStore();
  const { user } = useAuthStore();
  const myPayments = payments.filter(p => p.ownerId === user?.id);
  const received = myPayments.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
  const pending = myPayments.filter(p => p.status !== 'paid').reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rent Payment History</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All rent payments received from your tenants</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <KPICard title="Total Received" value={formatCurrency(received)} icon={<DollarSign className="w-5 h-5" />} color="emerald" />
        <KPICard title="Pending / Overdue" value={formatCurrency(pending)} icon={<TrendingUp className="w-5 h-5" />} color={pending > 0 ? 'red' : 'emerald'} />
      </div>
      <Card>
        <Table>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <Th>Invoice</Th><Th>Tenant</Th><Th>Flat</Th><Th>Amount</Th><Th>Month</Th><Th>Paid Date</Th><Th>Status</Th><Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {myPayments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Td><span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{p.invoiceNumber}</span></Td>
                <Td className="font-medium">{p.tenantName}</Td>
                <Td>{p.flatNumber}</Td>
                <Td><span className="font-semibold">{formatCurrency(p.amount)}</span></Td>
                <Td>{p.month}</Td>
                <Td>{p.paidDate ? formatDate(p.paidDate) : '—'}</Td>
                <Td><Badge className={getStatusColor(p.status)}>{p.status}</Badge></Td>
                <Td>{p.status === 'paid' && <button onClick={() => downloadPaymentReceipt(p)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"><Download className="w-4 h-4" /></button>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
