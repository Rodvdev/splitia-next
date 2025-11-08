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
  CheckSquare,
  Shield,
  BarChart3,
  FileBarChart,
  Workflow,
  FolderOpen,
  Plug,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Gastos', href: '/dashboard/expenses', icon: Receipt },
  { name: 'Grupos', href: '/dashboard/groups', icon: Users },
  { name: 'Presupuesto', href: '/dashboard/budgets', icon: Wallet },
  { name: 'Kanban', href: '/dashboard/kanban', icon: CheckSquare },
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
  { name: 'Participaciones', href: '/admin/expense-shares', icon: Share2 },
  { name: 'Liquidaciones', href: '/admin/settlements', icon: FileText },
  { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Planes', href: '/admin/plans', icon: CreditCard },
  { name: 'Tickets', href: '/admin/support-tickets', icon: HelpCircle },
  { name: 'Contactos', href: '/admin/crm/contacts', icon: User },
  { name: 'Facturas', href: '/admin/finance/invoices', icon: FileText },
  { name: 'Auditoría', href: '/admin/audit/logs', icon: Shield },
  { name: 'Marketing', href: '/admin/marketing/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/admin/analytics/customers', icon: BarChart3 },
  { name: 'Reportes', href: '/admin/reports', icon: FileBarChart },
  { name: 'Workflows', href: '/admin/automation/workflows', icon: Workflow },
  { name: 'Documentos', href: '/admin/documents', icon: FolderOpen },
  { name: 'Integraciones', href: '/admin/integrations', icon: Plug },
];

function SidebarContent() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const navItems = isAdmin ? adminNavigation : navigation;

  return (
    <>
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
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen fixed left-0 top-0 overflow-y-auto">
      <SidebarContent />
    </aside>
  );
}

export function SidebarTrigger() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
        <div className="h-full overflow-y-auto">
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}

