'use client';
import { useState } from 'react';
import { Bell, Sun, Moon, Menu, Search } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/lib/store/authStore';
import { useAppStore } from '@/lib/store/appStore';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface NavbarProps {
  onMenuToggle: () => void;
  title: string;
}

export default function Navbar({ onMenuToggle, title }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const { user } = useAuthStore();
  const { notifications, markNotificationRead } = useAppStore();
  const [showNotif, setShowNotif] = useState(false);

  const userNotifs = notifications.filter(n => n.userId === user?.id);
  const unread = userNotifs.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread}</span>}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-xs text-slate-500">{unread} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userNotifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications</div>
                ) : userNotifs.map(n => (
                  <button key={n.id} onClick={() => { markNotificationRead(n.id); setShowNotif(false); }}
                    className={cn('w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors', !n.read && 'bg-indigo-50 dark:bg-indigo-900/20')}>
                    <div className="flex gap-2">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                      <div className={!n.read ? '' : 'pl-4'}>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
