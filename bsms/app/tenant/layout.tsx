'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

const pageTitles: Record<string, string> = {
  '/tenant/dashboard': 'Dashboard',
  '/tenant/payments': 'My Payments',
  '/tenant/maintenance': 'Maintenance',
  '/tenant/visitors': 'My Visitors',
  '/tenant/announcements': 'Announcements',
  '/tenant/settings': 'Settings',
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) { router.replace('/login'); return; }
    if (user.role !== 'tenant') { router.replace('/' + user.role + '/dashboard'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== 'tenant') return null;
  return <DashboardLayout title={pageTitles[pathname] || 'Tenant Portal'}>{children}</DashboardLayout>;
}
