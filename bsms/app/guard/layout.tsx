'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

const pageTitles: Record<string, string> = {
  '/guard/dashboard': 'Dashboard',
  '/guard/visitors': 'Visitor Management',
  '/guard/settings': 'Settings',
};

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) { router.replace('/login'); return; }
    if (user.role !== 'guard') { router.replace('/' + user.role + '/dashboard'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== 'guard') return null;
  return <DashboardLayout title={pageTitles[pathname] || 'Guard Portal'}>{children}</DashboardLayout>;
}
