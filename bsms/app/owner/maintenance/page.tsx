'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, Badge } from '@/components/ui';
import { Wrench, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { getStatusColor, getPriorityColor, formatDateTime } from '@/lib/utils';

export default function OwnerMaintenance() {
  const { tickets, flats } = useAppStore();
  const { user } = useAuthStore();
  const myFlats = flats.filter(f => f.ownerId === user?.id);
  const myTickets = tickets.filter(t => myFlats.some(f => f.id === t.flatId));

  const icons = { open: <AlertCircle className="w-4 h-4 text-red-500" />, in_progress: <Clock className="w-4 h-4 text-amber-500" />, resolved: <CheckCircle className="w-4 h-4 text-emerald-500" /> };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance Status</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Maintenance tickets for your properties</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[['open', 'Open', 'red'], ['in_progress', 'In Progress', 'amber'], ['resolved', 'Resolved', 'emerald']].map(([s, l, c]) => (
          <Card key={s} className="p-4 text-center">
            <p className={`text-2xl font-bold text-${c}-600 dark:text-${c}-400`}>{myTickets.filter(t => t.status === s).length}</p>
            <p className="text-xs text-slate-500 mt-1">{l}</p>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {myTickets.length === 0 ? (
          <Card className="p-8 text-center">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No maintenance tickets for your properties</p>
          </Card>
        ) : myTickets.map(ticket => (
          <Card key={ticket.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icons[ticket.status]}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{ticket.ticketId}</span>
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{ticket.description}</p>
                  <p className="text-xs text-slate-500 mt-1">Flat {ticket.flatNumber} · {ticket.tenantName} · {formatDateTime(ticket.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
