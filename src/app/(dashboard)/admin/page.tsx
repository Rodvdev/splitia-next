'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HelpCircle, TrendingUp, ArrowRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data para admin
const mockAdminExpenseData = [
  { date: 'Sem 1', amount: 12500, previousAmount: 11000 },
  { date: 'Sem 2', amount: 15200, previousAmount: 13500 },
  { date: 'Sem 3', amount: 18200, previousAmount: 16000 },
  { date: 'Sem 4', amount: 21000, previousAmount: 19000 },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Vista general del sistema</p>
        </div>
      </div>

      {/* KPIs principales con comparaciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuarios"
          value="1,234"
          description="Usuarios registrados"
          icon={Users}
          trend={{ value: 12, label: 'vs mes anterior', isPositive: true }}
          variant="success"
          onClick={() => router.push('/admin/users')}
        />
        <MetricCard
          title="Grupos Activos"
          value="456"
          description="Grupos activos"
          icon={Users}
          trend={{ value: 8, label: 'vs mes anterior', isPositive: true }}
          variant="default"
        />
        <MetricCard
          title="Ingresos Mensuales"
          value="$12,450"
          description="MRR (Monthly Recurring Revenue)"
          icon={TrendingUp}
          trend={{ value: 15, label: 'vs mes anterior', isPositive: true }}
          variant="success"
        />
        <MetricCard
          title="Tickets Abiertos"
          value="23"
          description="Pendientes de resolver"
          icon={HelpCircle}
          trend={{ value: 5, label: 'vs mes anterior', isPositive: false }}
          variant="warning"
          onClick={() => router.push('/admin/support')}
        />
      </div>

      {/* Visualización de ingresos */}
      <ExpenseChart data={mockAdminExpenseData} period="month" />

      {/* Información contextual */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usuarios Recientes</CardTitle>
            <button
              onClick={() => router.push('/admin/users')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Juan Pérez', email: 'juan@example.com', date: 'Hace 2 horas', plan: 'Premium' },
                { name: 'María García', email: 'maria@example.com', date: 'Hace 5 horas', plan: 'Free' },
                { name: 'Carlos López', email: 'carlos@example.com', date: 'Ayer', plan: 'Pro' },
              ].map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/admin/users')}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{user.date}</p>
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                      {user.plan}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actividad del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Nuevo usuario registrado', time: 'Hace 2 min', type: 'user' },
                { action: 'Grupo creado: "Viaje a París"', time: 'Hace 15 min', type: 'group' },
                { action: 'Pago procesado: $29.99', time: 'Hace 1 hora', type: 'payment' },
                { action: 'Ticket resuelto #1234', time: 'Hace 2 horas', type: 'support' },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    activity.type === 'user' ? 'bg-success' :
                    activity.type === 'group' ? 'bg-primary' :
                    activity.type === 'payment' ? 'bg-warning' : 'bg-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

