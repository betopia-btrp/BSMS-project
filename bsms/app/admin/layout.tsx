'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/flats': 'Flat Management',
  '/admin/tenants': 'Tenant Management',
  '/admin/payments': 'Payment Management',
  '/admin/maintenance': 'Maintenance Tickets',
  '/admin/visitors': 'Visitor Log',
  '/admin/announcements': 'Announcements',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) { router.replace('/login'); return; }
    if (user.role !== 'admin') { router.replace('/' + user.role + '/dashboard'); }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated) return null;
  if (!isAuthenticated || !user || user.role !== 'admin') return null;

  const title = pageTitles[pathname] || 'Admin Panel';
  return <DashboardLayout title={title}>{children}</DashboardLayout>;
}
