'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useToast } from '@/components/ToastProvider';
import { Card, Button, Badge, Table, Th, Td } from '@/components/ui';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function GuardVisitors() {
  const { visitors, markVisitorArrived, markVisitorExited } = useAppStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<'all' | 'expected' | 'walkin'>('all');

  const filtered = visitors.filter(v => tab === 'all' || v.type === tab);

  const handleArrived = (id: string, name: string) => { markVisitorArrived(id); toast(`${name} marked as arrived`); };
  const handleExited = (id: string, name: string) => { markVisitorExited(id); toast(`${name} has exited`); };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visitor Log</h2>
      <div className="flex gap-2">
        {[['all', 'All'], ['expected', 'Pre-registered'], ['walkin', 'Walk-ins']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === v ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>
      <Card>
        <Table>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr><Th>Visitor</Th><Th>Flat</Th><Th>Type</Th><Th>Date/Time</Th><Th>Entry</Th><Th>Exit</Th><Th>Status</Th><Th>Actions</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <Td>
                  <p className="font-medium text-sm">{v.name}</p>
                  <p className="text-xs text-slate-500">{v.phone}</p>
                </Td>
                <Td className="font-medium text-indigo-600 dark:text-indigo-400">{v.flatNumber}</Td>
                <Td><Badge className={v.type === 'expected' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}>{v.type === 'expected' ? 'Pre-reg' : 'Walk-in'}</Badge></Td>
                <Td className="text-xs">{v.visitDate ? formatDate(v.visitDate) : '—'}{v.expectedTime && ` @ ${v.expectedTime}`}</Td>
                <Td className="text-xs">{v.entryTime ? <span className="flex items-center gap-1 text-emerald-600"><Clock className="w-3 h-3" />{v.entryTime}</span> : '—'}</Td>
                <Td className="text-xs">{v.exitTime || '—'}</Td>
                <Td>
                  <Badge className={v.status === 'pending' ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' : v.status === 'arrived' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}>
                    {v.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1.5">
                    {v.status === 'pending' && <Button size="sm" icon={<LogIn className="w-3.5 h-3.5" />} onClick={() => handleArrived(v.id, v.name)}>Entry</Button>}
                    {v.status === 'arrived' && <Button size="sm" variant="secondary" icon={<LogOut className="w-3.5 h-3.5" />} onClick={() => handleExited(v.id, v.name)}>Exit</Button>}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
