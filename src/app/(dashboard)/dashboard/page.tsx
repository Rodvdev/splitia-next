'use client';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Users, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';

// Mock data - En producción esto vendría de la API
const mockExpenseData = [
  { date: 'Lun', amount: 120, previousAmount: 100 },
  { date: 'Mar', amount: 150, previousAmount: 130 },
  { date: 'Mié', amount: 80, previousAmount: 90 },
  { date: 'Jue', amount: 200, previousAmount: 180 },
  { date: 'Vie', amount: 90, previousAmount: 110 },
  { date: 'Sáb', amount: 160, previousAmount: 140 },
  { date: 'Dom', amount: 110, previousAmount: 120 },
];

const mockCategoryData = [
  { name: 'Comida', value: 450, color: 'var(--chart-1)' },
  { name: 'Transporte', value: 280, color: 'var(--chart-2)' },
  { name: 'Entretenimiento', value: 150, color: 'var(--chart-3)' },
  { name: 'Otros', value: 120, color: 'var(--chart-4)' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM");

  return (
    <div className="space-y-6">
      {/* Header con saludo personalizado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Hola, {user?.name || 'Usuario'} 👋
          </h1>
          <p className="text-muted-foreground mt-1 capitalize">{currentDate}</p>
        </div>
        <QuickActions />
      </div>

      {/* KPIs principales - Priorizados visualmente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gastos Totales"
          value="$1,000.00"
          description="Este mes"
          icon={Receipt}
          trend={{ value: 12, label: 'vs mes anterior', isPositive: false }}
          variant="danger"
          onClick={() => router.push('/expenses')}
        />
        <MetricCard
          title="Grupos Activos"
          value="3"
          description="Participando"
          icon={Users}
          trend={{ value: 1, label: 'nuevo este mes', isPositive: true }}
          variant="success"
          onClick={() => router.push('/groups')}
        />
        <MetricCard
          title="Presupuesto"
          value="$2,500.00"
          description="Disponible este mes"
          icon={Wallet}
          variant="default"
          onClick={() => router.push('/budgets')}
        />
        <MetricCard
          title="Balance"
          value="$1,500.00"
          description="A tu favor"
          icon={TrendingUp}
          trend={{ value: 8, label: 'vs mes anterior', isPositive: true }}
          variant="success"
        />
      </div>

      {/* Visualizaciones - Gráficos comprensibles */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseChart data={mockExpenseData} period="week" />
        <CategoryChart data={mockCategoryData} />
      </div>

      {/* Información contextual - Gastos recientes y grupos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gastos Recientes</CardTitle>
            <button
              onClick={() => router.push('/expenses')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Cena en restaurante', amount: 85.50, date: 'Hoy' },
                { name: 'Uber', amount: 25.00, date: 'Ayer' },
                { name: 'Supermercado', amount: 120.30, date: '2 días' },
              ].map((expense, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/expenses')}
                >
                  <div>
                    <p className="text-sm font-medium">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">{expense.date}</p>
                  </div>
                  <p className="text-sm font-semibold">${expense.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grupos Activos</CardTitle>
            <button
              onClick={() => router.push('/groups')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Viaje a París', members: 4, balance: -45.20 },
                { name: 'Casa compartida', members: 3, balance: 120.50 },
                { name: 'Cena semanal', members: 5, balance: 0 },
              ].map((group, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push('/groups')}
                >
                  <div>
                    <p className="text-sm font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.members} miembros
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      group.balance > 0
                        ? 'text-success'
                        : group.balance < 0
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {group.balance > 0 && '+'}${Math.abs(group.balance)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

