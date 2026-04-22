'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/components/ToastProvider';
import { Card, CardHeader, Button, Badge, Modal, Input } from '@/components/ui';
import { UserCheck, LogIn, LogOut, Plus, Clock, CalendarDays, Search } from 'lucide-react';
import { getStatusColor, formatDate } from '@/lib/utils';
import { Visitor } from '@/types';

export default function GuardDashboard() {
  const { visitors, flats, markVisitorArrived, markVisitorExited, addVisitor } = useAppStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({ name: '', phone: '', nid: '', flatNumber: '' });

  const expectedToday = visitors.filter(v => v.type === 'expected' && v.status !== 'exited');
  const recentWalkins = visitors.filter(v => v.type === 'walkin').slice(0, 5);

  const filteredExpected = expectedToday.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.flatNumber.includes(search) ||
    (v.tenantName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkArrived = (v: Visitor) => {
    markVisitorArrived(v.id);
    toast(`${v.name} marked as arrived at Flat ${v.flatNumber}`);
  };

  const handleMarkExited = (v: Visitor) => {
    markVisitorExited(v.id);
    toast(`${v.name} has exited`);
  };

  const handleAddWalkin = () => {
    if (!walkinForm.name || !walkinForm.phone || !walkinForm.flatNumber) { toast('Fill required fields', 'error'); return; }
    addVisitor({ ...walkinForm, flatId: flats.find(f => f.number === walkinForm.flatNumber)?.id || '', type: 'walkin', status: 'arrived', entryTime: new Date().toLocaleTimeString(), loggedBy: user?.id });
    toast(`Walk-in visitor ${walkinForm.name} logged`);
    setShowWalkinModal(false);
    setWalkinForm({ name: '', phone: '', nid: '', flatNumber: '' });
  };

  const statusBadge = (v: Visitor) => {
    if (v.status === 'pending') return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Expected</Badge>;
    if (v.status === 'arrived') return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Inside</Badge>;
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Exited</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guard Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowWalkinModal(true)}>Add Walk-in</Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Expected Today', value: expectedToday.filter(v => v.status === 'pending').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Currently Inside', value: visitors.filter(v => v.status === 'arrived').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: "Today's Walk-ins", value: recentWalkins.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        ].map(s => (
          <Card key={s.label} className={`p-4 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Expected Visitors Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Expected Visitors</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pre-registered by tenants</p>
            </div>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredExpected.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No expected visitors</p>
            </div>
          ) : filteredExpected.map(v => (
            <div key={v.id} className="px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{v.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{v.name}</p>
                    {statusBadge(v)}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">Flat {v.flatNumber}</span>
                    {v.tenantName && <span>{v.tenantName}</span>}
                    {v.expectedTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{v.expectedTime}</span>}
                    {v.visitDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(v.visitDate)}</span>}
                    {v.purpose && <span>· {v.purpose}</span>}
                  </div>
                  {v.entryTime && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Entry: {v.entryTime}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {v.status === 'pending' && (
                  <Button size="sm" icon={<LogIn className="w-3.5 h-3.5" />} onClick={() => handleMarkArrived(v)}>Entry</Button>
                )}
                {v.status === 'arrived' && (
                  <Button size="sm" variant="secondary" icon={<LogOut className="w-3.5 h-3.5" />} onClick={() => handleMarkExited(v)}>Exit</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Walk-ins */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent Walk-in Visitors</h3>
        </CardHeader>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentWalkins.length === 0 ? (
            <div className="px-6 py-6 text-center text-sm text-slate-500">No walk-in visitors logged</div>
          ) : recentWalkins.map(v => (
            <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{v.name.charAt(0)}</div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{v.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Flat {v.flatNumber}</span>
                    {v.entryTime && <span>In: {v.entryTime}</span>}
                    {v.exitTime && <span>Out: {v.exitTime}</span>}
                    {v.duration && <span>({v.duration})</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(v)}
                {v.status === 'arrived' && (
                  <Button size="sm" variant="secondary" icon={<LogOut className="w-3.5 h-3.5" />} onClick={() => handleMarkExited(v)}>Exit</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Walk-in Modal */}
      <Modal open={showWalkinModal} onClose={() => setShowWalkinModal(false)} title="Log Walk-in Visitor">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Visitor Name *" value={walkinForm.name} onChange={e => setWalkinForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" />
            <Input label="Phone *" value={walkinForm.phone} onChange={e => setWalkinForm(p => ({ ...p, phone: e.target.value }))} placeholder="01700000000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="NID (Optional)" value={walkinForm.nid} onChange={e => setWalkinForm(p => ({ ...p, nid: e.target.value }))} placeholder="National ID" />
            <Input label="Flat Number *" value={walkinForm.flatNumber} onChange={e => setWalkinForm(p => ({ ...p, flatNumber: e.target.value }))} placeholder="A-101" />
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              Entry time will be recorded as: <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowWalkinModal(false)} className="flex-1">Cancel</Button>
            <Button icon={<LogIn className="w-4 h-4" />} onClick={handleAddWalkin} className="flex-1">Log Entry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
