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
  Tag,
  Share2,
  FileText,
  Mail,
  UserCheck,
  UserPlus,
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
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Grupos', href: '/admin/groups', icon: Users },
  { name: 'Gastos', href: '/admin/expenses', icon: Receipt },
  { name: 'Participaciones', href: '/admin/expense-shares', icon: Share2 },
  { name: 'Presupuestos', href: '/admin/budgets', icon: Wallet },
  { name: 'Categorías', href: '/admin/categories', icon: Tag },
  { name: 'Conversaciones', href: '/admin/conversations', icon: MessageSquare },
  { name: 'Mensajes', href: '/admin/messages', icon: Mail },
  { name: 'Liquidaciones', href: '/admin/settlements', icon: FileText },
  { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Tickets', href: '/admin/support-tickets', icon: HelpCircle },
  { name: 'Invitaciones', href: '/admin/group-invitations', icon: UserPlus },
  { name: 'Miembros', href: '/admin/group-users', icon: UserCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  const navItems = isAdmin ? adminNavigation : navigation;

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen fixed left-0 top-0 overflow-y-auto">
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

