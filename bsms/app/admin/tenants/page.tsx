'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useToast } from '@/components/ToastProvider';
import { Card, Button, Input, Select, Modal, Badge, Table, Th, Td, EmptyState } from '@/components/ui';
import { Plus, Edit2, Trash2, Users, Search, Eye, Phone, Home } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';
import { Tenant } from '@/types';

const emptyTenant: Omit<Tenant, 'id'> = { userId: '', name: '', email: '', phone: '', nid: '', flatId: '', flatNumber: '', emergencyContact: '', moveInDate: '', status: 'active' };

export default function AdminTenants() {
  const { tenants, flats, addTenant, updateTenant, deleteTenant } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState(emptyTenant);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search) ||
    (t.flatNumber || '').includes(search)
  );

  const openAdd = () => { setEditTenant(null); setForm(emptyTenant); setShowModal(true); };
  const openEdit = (t: Tenant) => { setEditTenant(t); setForm({ ...t }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.nid) { toast('Please fill required fields', 'error'); return; }
    if (editTenant) {
      updateTenant(editTenant.id, form);
      toast('Tenant updated');
    } else {
      addTenant({ ...form, userId: `u${Date.now()}` });
      toast('Tenant added successfully');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this tenant?')) { deleteTenant(id); toast('Tenant deleted', 'warning'); }
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const vacantFlats = flats.filter(f => f.status === 'vacant' || f.id === form.flatId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tenant Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{tenants.length} registered tenants</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Tenant</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone or flat..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </Card>

      <Card>
        <Table>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <Th>Tenant</Th>
              <Th>Phone</Th>
              <Th>NID</Th>
              <Th>Flat</Th>
              <Th>Move-in</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={<Users className="w-8 h-8" />} title="No tenants found" /></td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{t.phone}</div></Td>
                <Td className="font-mono text-xs">{t.nid}</Td>
                <Td>{t.flatNumber ? <div className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-slate-400" /><span className="font-medium text-indigo-600 dark:text-indigo-400">{t.flatNumber}</span></div> : <span className="text-slate-400">Not assigned</span>}</Td>
                <Td>{t.moveInDate || '—'}</Td>
                <Td><Badge className={getStatusColor(t.status)}>{t.status}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewTenant(t)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTenant ? 'Edit Tenant' : 'Add New Tenant'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *" value={form.name} onChange={f('name')} placeholder="John Doe" />
            <Input label="Email" type="email" value={form.email} onChange={f('email')} placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone *" value={form.phone} onChange={f('phone')} placeholder="01700000000" />
            <Input label="NID *" value={form.nid} onChange={f('nid')} placeholder="1234567890" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Emergency Contact" value={form.emergencyContact} onChange={f('emergencyContact')} placeholder="01800000000" />
            <Input label="Move-in Date" type="date" value={form.moveInDate} onChange={f('moveInDate')} />
          </div>
          <Select label="Assign Flat" value={form.flatId || ''} onChange={f('flatId')}
            options={[{ value: '', label: 'Select flat...' }, ...vacantFlats.map(fl => ({ value: fl.id, label: `${fl.number} (Floor ${fl.floor})` }))]} />
          <Select label="Status" value={form.status} onChange={f('status')} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">{editTenant ? 'Update' : 'Add Tenant'}</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal open={!!viewTenant} onClose={() => setViewTenant(null)} title="Tenant Profile">
        {viewTenant && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">{viewTenant.name.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{viewTenant.name}</h3>
                <p className="text-slate-500 text-sm">{viewTenant.email}</p>
                <Badge className={`mt-1 ${getStatusColor(viewTenant.status)}`}>{viewTenant.status}</Badge>
              </div>
            </div>
            {[
              { label: 'Phone', value: viewTenant.phone },
              { label: 'NID', value: viewTenant.nid },
              { label: 'Flat', value: viewTenant.flatNumber || 'Not assigned' },
              { label: 'Move-in Date', value: viewTenant.moveInDate || '—' },
              { label: 'Emergency Contact', value: viewTenant.emergencyContact || '—' },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">{r.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
