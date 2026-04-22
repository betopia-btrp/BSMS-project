'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

const pageTitles: Record<string, string> = {
  '/owner/dashboard': 'Dashboard',
  '/owner/flats': 'My Flats',
  '/owner/payments': 'Payment History',
  '/owner/maintenance': 'Maintenance',
  '/owner/announcements': 'Announcements',
  '/owner/settings': 'Settings',
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !user) { router.replace('/login'); return; }
    if (user.role !== 'owner') { router.replace('/' + user.role + '/dashboard'); }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated) return null;
  if (!isAuthenticated || !user || user.role !== 'owner') return null;

  return <DashboardLayout title={pageTitles[pathname] || 'Owner Portal'}>{children}</DashboardLayout>;
}
