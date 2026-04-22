'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/authStore';
import {
  LayoutDashboard, Building2, Users, CreditCard, Wrench, UserCheck,
  Megaphone, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Shield
} from 'lucide-react';
import { Role } from '@/types';

const menuItems: Record<Role, { href: string; icon: React.ReactNode; label: string }[]> = {
  admin: [
    { href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/admin/flats', icon: <Building2 className="w-5 h-5" />, label: 'Flats' },
    { href: '/admin/tenants', icon: <Users className="w-5 h-5" />, label: 'Tenants' },
    { href: '/admin/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
    { href: '/admin/maintenance', icon: <Wrench className="w-5 h-5" />, label: 'Maintenance' },
    { href: '/admin/visitors', icon: <UserCheck className="w-5 h-5" />, label: 'Visitors' },
    { href: '/admin/announcements', icon: <Megaphone className="w-5 h-5" />, label: 'Announcements' },
    { href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
    { href: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ],
  owner: [
    { href: '/owner/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/owner/flats', icon: <Building2 className="w-5 h-5" />, label: 'My Flats' },
    { href: '/owner/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
    { href: '/owner/maintenance', icon: <Wrench className="w-5 h-5" />, label: 'Maintenance' },
    { href: '/owner/announcements', icon: <Megaphone className="w-5 h-5" />, label: 'Announcements' },
    { href: '/owner/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ],
  tenant: [
    { href: '/tenant/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/tenant/payments', icon: <CreditCard className="w-5 h-5" />, label: 'Payments' },
    { href: '/tenant/maintenance', icon: <Wrench className="w-5 h-5" />, label: 'Maintenance' },
    { href: '/tenant/visitors', icon: <UserCheck className="w-5 h-5" />, label: 'Visitors' },
    { href: '/tenant/announcements', icon: <Megaphone className="w-5 h-5" />, label: 'Announcements' },
    { href: '/tenant/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ],
  guard: [
    { href: '/guard/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { href: '/guard/visitors', icon: <UserCheck className="w-5 h-5" />, label: 'Visitors' },
    { href: '/guard/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ],
};

const roleColors: Record<Role, string> = {
  admin: 'from-indigo-600 to-violet-600',
  owner: 'from-emerald-600 to-teal-600',
  tenant: 'from-blue-600 to-cyan-600',
  guard: 'from-amber-600 to-orange-600',
};

const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  owner: 'Flat Owner',
  tenant: 'Tenant',
  guard: 'Security Guard',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  if (!user) return null;

  const items = menuItems[user.role];
  const gradient = roleColors[user.role];

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-30 transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 border-b border-slate-200 dark:border-slate-700 px-4', collapsed ? 'justify-center' : 'gap-3')}>
        <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', gradient)}>
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">BSMS</p>
          <p className="text-xs text-slate-400">Building Society</p>
        </div>}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r', gradient)}>
            {roleLabels[user.role]}
          </div>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150 group',
                active ? cn('bg-gradient-to-r text-white shadow-sm', gradient) : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-2'
              )}>
              <span className={cn('flex-shrink-0', active ? 'text-white' : '')}>{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold flex-shrink-0', gradient)}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className={cn('flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors', collapsed && 'justify-center')}>
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
