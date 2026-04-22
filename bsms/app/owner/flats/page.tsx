'use client';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Card, Badge } from '@/components/ui';
import { Building2, User, Home } from 'lucide-react';
import { formatCurrency, getStatusColor } from '@/lib/utils';

export default function OwnerFlats() {
  const { flats, tenants } = useAppStore();
  const { user } = useAuthStore();
  const myFlats = flats.filter(f => f.ownerId === user?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Flats</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{myFlats.length} properties under your ownership</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myFlats.map(flat => {
          const tenant = tenants.find(t => t.userId === flat.tenantId);
          return (
            <Card key={flat.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <Badge className={getStatusColor(flat.status)}>{flat.status}</Badge>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{flat.number}</h3>
              <p className="text-sm text-slate-500 mt-1">Floor {flat.floor} · {flat.size}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(flat.monthlyRent)}</span>
                </div>
                {tenant ? (
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{tenant.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No tenant assigned</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
