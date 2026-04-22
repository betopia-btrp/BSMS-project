'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/components/ToastProvider';
import { Card, Badge, Button, Modal, Table, Th, Td } from '@/components/ui';
import { CreditCard, Download, CheckCircle, AlertCircle, Building2, User } from 'lucide-react';
import { formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { Payment } from '@/types';

type PayMethod = 'bkash' | 'nagad' | 'card';

export default function TenantPayments() {
  const { payments, flats, updatePaymentStatus } = useAppStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [method, setMethod] = useState<PayMethod>('bkash');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const myPayments = payments.filter(p => p.tenantName === user?.name);
  const myFlat = flats.find(f => f.tenantId === user?.id);
  const payingPayment = payments.find(p => p.id === payingId);

  const handlePay = async () => {
    if (!payingId) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    updatePaymentStatus(payingId, 'paid', method);
    setProcessing(false);
    setSuccess(true);
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(false);
    setPayingId(null);
    toast('Payment successful! 🎉');
  };

  const paymentMethods = [
    { id: 'bkash', label: 'bKash', color: 'bg-pink-500', icon: '💳', desc: 'Mobile banking' },
    { id: 'nagad', label: 'Nagad', color: 'bg-orange-500', icon: '📱', desc: 'Digital wallet' },
    { id: 'card', label: 'Card', color: 'bg-blue-600', icon: '💳', desc: 'Credit / Debit' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Payments</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your rent and service charge payments</p>
      </div>

      {/* Payment flow explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Rent Payment</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">Goes directly to your flat owner ({myFlat?.ownerName || 'Owner'}). Admin has no access to these funds.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl">
          <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">Service Charges</p>
            <p className="text-xs text-violet-700 dark:text-violet-400 mt-0.5">Maintenance fees, utility bills & society charges go to Admin (Building Management).</p>
          </div>
        </div>
      </div>

      {/* Pending payments */}
      {myPayments.filter(p => p.status !== 'paid').length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">⚠️ Pending Payments</h3>
          <div className="space-y-3">
            {myPayments.filter(p => p.status !== 'paid').map(p => (
              <Card key={p.id} className="p-4 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.recipient === 'owner' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'}`}>
                        {p.type === 'rent' ? 'Rent' : 'Service Charge'}
                      </span>
                      <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Due: {formatDate(p.dueDate)} · To: {p.recipient === 'owner' ? (p.ownerName || 'Owner') : 'Admin'}
                    </p>
                  </div>
                  <Button icon={<CreditCard className="w-4 h-4" />} onClick={() => { setPayingId(p.id); setMethod('bkash'); }}>
                    Pay Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Payment History</h3>
        </div>
        <Table>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr><Th>Invoice</Th><Th>Type</Th><Th>To</Th><Th>Amount</Th><Th>Month</Th><Th>Method</Th><Th>Status</Th><Th></Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {myPayments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Td><span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{p.invoiceNumber}</span></Td>
                <Td>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.type === 'rent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'}`}>
                    {p.type === 'rent' ? 'Rent' : 'Service'}
                  </span>
                </Td>
                <Td className="text-xs text-slate-500">{p.recipient === 'owner' ? (p.ownerName || 'Owner') : 'Admin'}</Td>
                <Td><span className="font-semibold">{formatCurrency(p.amount)}</span></Td>
                <Td>{p.month}</Td>
                <Td className="capitalize">{p.method || '—'}</Td>
                <Td><Badge className={getStatusColor(p.status)}>{p.status}</Badge></Td>
                <Td>{p.status === 'paid' && <button className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500"><Download className="w-4 h-4" /></button>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Payment Modal */}
      <Modal open={!!payingId} onClose={() => !processing && setPayingId(null)} title="Make Payment" size="sm">
        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Payment Successful!</h3>
            <p className="text-sm text-slate-500 mt-1">{formatCurrency(payingPayment?.amount || 0)} sent</p>
          </div>
        ) : (
          <div className="space-y-5">
            {payingPayment && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-900 dark:text-white text-lg">{formatCurrency(payingPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>To: {payingPayment.recipient === 'owner' ? (payingPayment.ownerName || 'Owner') : 'Admin (BSMS)'}</span>
                  <span className={`font-medium ${payingPayment.recipient === 'owner' ? 'text-blue-600' : 'text-violet-600'}`}>
                    {payingPayment.recipient === 'owner' ? '→ Owner' : '→ Admin'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id as PayMethod)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${method === m.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <div className={`w-8 h-8 rounded-lg ${m.color} text-white text-sm flex items-center justify-center mx-auto mb-1`}>{m.icon}</div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {method === 'card' && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                <input value={cardForm.name} onChange={e => setCardForm(p => ({ ...p, name: e.target.value }))} placeholder="Cardholder Name"
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
                <input value={cardForm.number} onChange={e => setCardForm(p => ({ ...p, number: e.target.value }))} placeholder="Card Number (1234 5678 9012 3456)"
                  className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={cardForm.expiry} onChange={e => setCardForm(p => ({ ...p, expiry: e.target.value }))} placeholder="MM/YY"
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
                  <input value={cardForm.cvv} onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value }))} placeholder="CVV"
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
                </div>
              </div>
            )}

            {(method === 'bkash' || method === 'nagad') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">You will be redirected to</p>
                <p className={`text-lg font-bold mt-1 ${method === 'bkash' ? 'text-pink-600' : 'text-orange-600'}`}>{method === 'bkash' ? '🩷 bKash' : '🧡 Nagad'}</p>
                <p className="text-xs text-slate-500 mt-1">Secure mobile payment gateway</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setPayingId(null)} className="flex-1" disabled={processing}>Cancel</Button>
              <Button onClick={handlePay} className="flex-1" loading={processing}>
                {processing ? 'Processing...' : `Pay ${formatCurrency(payingPayment?.amount || 0)}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
