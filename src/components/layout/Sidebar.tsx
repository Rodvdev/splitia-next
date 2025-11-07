'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Wallet,
  MessageSquare,
  Settings,
  User,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Gastos', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Grupos', href: '/dashboard/groups', icon: Users },
  { name: 'Presupuesto', href: '/dashboard/budgets', icon: Wallet },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Perfil', href: '/dashboard/profile', icon: User },
  { name: 'Suscripción', href: '/dashboard/subscriptions', icon: CreditCard },
  { name: 'Soporte', href: '/dashboard/support', icon: HelpCircle },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const navItems = isAdmin ? adminNavigation : navigation;

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Splitia</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

