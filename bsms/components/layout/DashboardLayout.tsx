'use client';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/appStore';
import { useAuthStore } from '@/lib/store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { loadAppData, initialized, isLoading } = useAppStore();
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadAppData();
    }
  }, [isAuthenticated, loadAppData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={cn('transition-all duration-300', collapsed ? 'lg:ml-16' : 'lg:ml-64')}>
        <Navbar onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} title={title} />
        <main className="p-4 lg:p-6">
          {!initialized && isLoading ? (
            <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Loading dashboard data...
            </div>
          ) : children}
        </main>
      </div>
    </div>
  );
}
