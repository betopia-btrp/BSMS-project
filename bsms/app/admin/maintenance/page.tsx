'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useToast } from '@/components/ToastProvider';
import { Card, Badge, Table, Th, Td, EmptyState, Button, Input, Modal } from '@/components/ui';
import { Wrench, Search, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { getStatusColor, getPriorityColor, formatDateTime } from '@/lib/utils';
import { MaintenanceTicket } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminMaintenance() {
  const { tickets, updateTicket, addTicketNote } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewTicket, setViewTicket] = useState<MaintenanceTicket | null>(null);
  const [note, setNote] = useState('');

  const filtered = tickets.filter(t =>
    (statusFilter === 'all' || t.status === statusFilter) &&
    (t.ticketId.toLowerCase().includes(search.toLowerCase()) || t.tenantName.toLowerCase().includes(search.toLowerCase()) || t.flatNumber.includes(search))
  );

  const handleStatusUpdate = (id: string, status: MaintenanceTicket['status']) => {
    updateTicket(id, { status });
    if (viewTicket?.id === id) setViewTicket(prev => prev ? { ...prev, status } : null);
    toast(`Ticket marked as ${status.replace('_', ' ')}`);
  };

  const handleAddNote = () => {
    if (!note.trim() || !viewTicket) return;
    addTicketNote(viewTicket.id, note);
    setViewTicket(prev => prev ? { ...prev, notes: [...prev.notes, note] } : null);
    setNote('');
    toast('Note added');
  };

  const statuses: MaintenanceTicket['status'][] = ['open', 'in_progress', 'resolved'];
  const statusIcons = { open: <AlertCircle className="w-4 h-4" />, in_progress: <Clock className="w-4 h-4" />, resolved: <CheckCircle className="w-4 h-4" /> };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance Tickets</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tickets.filter(t => t.status !== 'resolved').length} active tickets</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'All', tickets.length], ['open', 'Open', tickets.filter(t => t.status === 'open').length], ['in_progress', 'In Progress', tickets.filter(t => t.status === 'in_progress').length], ['resolved', 'Resolved', tickets.filter(t => t.status === 'resolved').length]].map(([val, label, count]) => (
          <button key={val} onClick={() => setStatusFilter(val as string)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${statusFilter === val ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
            {label} <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusFilter === val ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>{count}</span>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ticket ID, tenant or flat..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="p-6"><EmptyState icon={<Wrench className="w-8 h-8" />} title="No tickets found" /></Card>
        ) : filtered.map(ticket => (
          <Card key={ticket.id} className="p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer" onClick={() => setViewTicket(ticket)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{ticket.ticketId}</span>
                  <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 capitalize">{ticket.category}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-2">{ticket.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>{ticket.tenantName}</span>
                  <span>Flat {ticket.flatNumber}</span>
                  <span>{formatDateTime(ticket.createdAt)}</span>
                  {ticket.notes.length > 0 && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.notes.length} notes</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {ticket.status !== 'in_progress' && ticket.status !== 'resolved' && (
                  <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}>Start</Button>
                )}
                {ticket.status !== 'resolved' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(ticket.id, 'resolved')}>Resolve</Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Ticket Modal */}
      <Modal open={!!viewTicket} onClose={() => setViewTicket(null)} title={viewTicket?.ticketId} size="lg">
        {viewTicket && (
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(viewTicket.status)}>{viewTicket.status.replace('_', ' ')}</Badge>
              <Badge className={getPriorityColor(viewTicket.priority)}>{viewTicket.priority} priority</Badge>
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 capitalize">{viewTicket.category}</Badge>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
              <p className="text-sm text-slate-700 dark:text-slate-300">{viewTicket.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-500">Tenant</p><p className="font-medium text-slate-900 dark:text-white mt-0.5">{viewTicket.tenantName}</p></div>
              <div><p className="text-slate-500">Flat</p><p className="font-medium text-slate-900 dark:text-white mt-0.5">{viewTicket.flatNumber}</p></div>
              <div><p className="text-slate-500">Created</p><p className="font-medium text-slate-900 dark:text-white mt-0.5">{formatDateTime(viewTicket.createdAt)}</p></div>
              <div><p className="text-slate-500">Updated</p><p className="font-medium text-slate-900 dark:text-white mt-0.5">{formatDateTime(viewTicket.updatedAt)}</p></div>
            </div>

            {/* Timeline / Notes */}
            {viewTicket.notes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes Timeline</p>
                <div className="space-y-2">
                  {viewTicket.notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2 flex-1">{n}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Add Note</p>
              <div className="flex gap-2">
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note about this ticket..."
                  className="flex-1 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <Button onClick={handleAddNote} size="sm">Add</Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2 flex-wrap">
              {statuses.filter(s => s !== viewTicket.status).map(s => (
                <Button key={s} variant={s === 'resolved' ? 'primary' : 'secondary'} size="sm" icon={statusIcons[s]}
                  onClick={() => handleStatusUpdate(viewTicket.id, s)}>
                  Mark as {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
