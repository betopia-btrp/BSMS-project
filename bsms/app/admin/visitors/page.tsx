'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { Card, Badge, Table, Th, Td, EmptyState, Button } from '@/components/ui';
import { UserCheck, Search, Clock } from 'lucide-react';
import { getStatusColor, formatDate } from '@/lib/utils';

export default function AdminVisitors() {
  const { visitors } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = visitors.filter(v =>
    (typeFilter === 'all' || v.type === typeFilter) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.flatNumber.includes(search) || (v.tenantName || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visitor Log</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">All visitor records — walk-ins and pre-registered</p>
      </div>

      <div className="flex gap-2">
        {[['all', 'All'], ['expected', 'Pre-registered'], ['walkin', 'Walk-ins']].map(([val, label]) => (
          <button key={val} onClick={() => setTypeFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${typeFilter === val ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitors..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </Card>

      <Card>
        <Table>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <Th>Visitor</Th>
              <Th>Flat</Th>
              <Th>Tenant</Th>
              <Th>Type</Th>
              <Th>Purpose</Th>
              <Th>Entry</Th>
              <Th>Exit</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon={<UserCheck className="w-8 h-8" />} title="No visitors found" /></td></tr>
            ) : filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Td>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{v.name}</p>
                  <p className="text-xs text-slate-500">{v.phone}</p>
                </Td>
                <Td className="font-medium text-indigo-600 dark:text-indigo-400">{v.flatNumber}</Td>
                <Td>{v.tenantName || '—'}</Td>
                <Td><Badge className={v.type === 'expected' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}>{v.type === 'expected' ? 'Pre-reg.' : 'Walk-in'}</Badge></Td>
                <Td>{v.purpose || '—'}</Td>
                <Td>{v.entryTime ? <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{v.entryTime}</div> : '—'}</Td>
                <Td>{v.exitTime || '—'}</Td>
                <Td><Badge className={getStatusColor(v.status)}>{v.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
