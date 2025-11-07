'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HelpCircle, TrendingUp, ArrowRight, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { UserResponse, GroupResponse, SubscriptionResponse, SupportTicketResponse } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChartDataPoint {
  date: string;
  amount: number;
  previousAmount: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [previousMonthUsers, setPreviousMonthUsers] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);
  const [previousMonthGroups, setPreviousMonthGroups] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [previousMonthRevenue, setPreviousMonthRevenue] = useState(0);
  const [openTickets, setOpenTickets] = useState(0);
  const [previousMonthTickets, setPreviousMonthTickets] = useState(0);
  const [revenueChartData, setRevenueChartData] = useState<ChartDataPoint[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserResponse[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));

      // Cargar todos los datos necesarios
      const [
        usersRes,
        previousUsersRes,
        groupsRes,
        previousGroupsRes,
        subscriptionsRes,
        previousSubscriptionsRes,
        ticketsRes,
        previousTicketsRes,
      ] = await Promise.all([
        adminApi.getAllUsers({ page: 0, size: 10000 }),
        adminApi.getAllUsers({ page: 0, size: 10000 }),
        adminApi.getAllGroups({ page: 0, size: 10000 }),
        adminApi.getAllGroups({ page: 0, size: 10000 }),
        adminApi.getAllSubscriptions({ page: 0, size: 10000 }),
        adminApi.getAllSubscriptions({ page: 0, size: 10000 }),
        adminApi.getAllSupportTickets({ page: 0, size: 10000 }),
        adminApi.getAllSupportTickets({ page: 0, size: 10000 }),
      ]);

      if (!usersRes.success || !groupsRes.success || !subscriptionsRes.success || !ticketsRes.success) {
        throw new Error('Error al cargar datos del dashboard');
      }

      // Calcular total de usuarios
      const currentUsers = usersRes.data.content.filter((user: UserResponse) => {
        const userDate = parseISO(user.createdAt);
        return userDate <= now;
      });
      const previousUsers = previousUsersRes.data.content.filter((user: UserResponse) => {
        const userDate = parseISO(user.createdAt);
        return userDate <= previousMonthStart;
      });
      setTotalUsers(currentUsers.length);
      setPreviousMonthUsers(previousUsers.length);

      // Calcular grupos activos
      const currentGroups = groupsRes.data.content.filter((group: GroupResponse) => {
        const groupDate = parseISO(group.createdAt);
        return groupDate <= now;
      });
      const previousGroups = previousGroupsRes.data.content.filter((group: GroupResponse) => {
        const groupDate = parseISO(group.createdAt);
        return groupDate <= previousMonthStart;
      });
      setActiveGroups(currentGroups.length);
      setPreviousMonthGroups(previousGroups.length);

      // Calcular ingresos mensuales (MRR) - todas las suscripciones activas
      const currentActiveSubscriptions = subscriptionsRes.data.content.filter((sub: SubscriptionResponse) => 
        sub.status === 'ACTIVE'
      );
      const previousActiveSubscriptions = previousSubscriptionsRes.data.content.filter((sub: SubscriptionResponse) => 
        sub.status === 'ACTIVE'
      );

      const currentMRR = currentActiveSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
        sum + sub.pricePerMonth, 0);
      const previousMRR = previousActiveSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
        sum + sub.pricePerMonth, 0);
      setMonthlyRevenue(currentMRR);
      setPreviousMonthRevenue(previousMRR);

      // Calcular tickets abiertos
      const openTicketsCurrent = ticketsRes.data.content.filter((ticket: SupportTicketResponse) => 
        ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'PENDING_CUSTOMER'
      );
      const openTicketsPrevious = previousTicketsRes.data.content.filter((ticket: SupportTicketResponse) => 
        ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'PENDING_CUSTOMER'
      );
      setOpenTickets(openTicketsCurrent.length);
      setPreviousMonthTickets(openTicketsPrevious.length);

      // Preparar datos para gráfico de ingresos mensuales (últimas 4 semanas)
      const weeks = eachWeekOfInterval({
        start: subWeeks(now, 3),
        end: now,
      }, { weekStartsOn: 1 });

      // Para el gráfico, calcular MRR al final de cada semana (suscripciones activas en ese momento)
      const revenueData: ChartDataPoint[] = weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        // Suscripciones activas al final de esa semana
        const weekSubscriptions = subscriptionsRes.data.content.filter((sub: SubscriptionResponse) => {
          const subDate = parseISO(sub.createdAt);
          return subDate <= weekEnd && sub.status === 'ACTIVE';
        });
        const weekAmount = weekSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
          sum + sub.pricePerMonth, 0);

        // Obtener datos de la semana anterior para comparación
        const previousWeekStart = subWeeks(weekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
        const previousWeekSubscriptions = subscriptionsRes.data.content.filter((sub: SubscriptionResponse) => {
          const subDate = parseISO(sub.createdAt);
          return subDate <= previousWeekEnd && sub.status === 'ACTIVE';
        });
        const previousWeekAmount = previousWeekSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
          sum + sub.pricePerMonth, 0);

        return {
          date: `Sem ${index + 1}`,
          amount: weekAmount,
          previousAmount: previousWeekAmount,
        };
      });
      setRevenueChartData(revenueData);

      // Usuarios recientes (últimos 3)
      const sortedUsers = [...usersRes.data.content]
        .sort((a: UserResponse, b: UserResponse) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
      setRecentUsers(sortedUsers);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el dashboard';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0,
    };
  };

  const formatRelativeDate = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de una hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return format(date, 'dd/MM/yyyy');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const usersTrend = calculateTrend(totalUsers, previousMonthUsers);
  const groupsTrend = calculateTrend(activeGroups, previousMonthGroups);
  const revenueTrend = calculateTrend(monthlyRevenue, previousMonthRevenue);
  const ticketsTrend = calculateTrend(openTickets, previousMonthTickets);

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
          value={totalUsers.toLocaleString('es-ES')}
          description="Usuarios registrados"
          icon={Users}
          trend={{ 
            value: usersTrend.value, 
            label: 'vs mes anterior', 
            isPositive: usersTrend.isPositive 
          }}
          variant="success"
          onClick={() => router.push('/admin/users')}
        />
        <MetricCard
          title="Grupos Activos"
          value={activeGroups.toLocaleString('es-ES')}
          description="Grupos activos"
          icon={Users}
          trend={{ 
            value: groupsTrend.value, 
            label: 'vs mes anterior', 
            isPositive: groupsTrend.isPositive 
          }}
          variant="default"
        />
        <MetricCard
          title="Ingresos Mensuales"
          value={formatCurrency(monthlyRevenue)}
          description="MRR (Monthly Recurring Revenue)"
          icon={TrendingUp}
          trend={{ 
            value: revenueTrend.value, 
            label: 'vs mes anterior', 
            isPositive: revenueTrend.isPositive 
          }}
          variant="success"
        />
        <MetricCard
          title="Tickets Abiertos"
          value={openTickets.toString()}
          description="Pendientes de resolver"
          icon={HelpCircle}
          trend={{ 
            value: ticketsTrend.value, 
            label: 'vs mes anterior', 
            isPositive: !ticketsTrend.isPositive 
          }}
          variant="warning"
          onClick={() => router.push('/admin/support')}
        />
      </div>

      {/* Visualización de ingresos */}
      <ExpenseChart data={revenueChartData} period="month" />

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
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatRelativeDate(user.createdAt)}</p>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {user.role || 'USER'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay usuarios recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actividad del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-success mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{totalUsers} usuarios registrados</p>
                  <p className="text-xs text-muted-foreground">Total en el sistema</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activeGroups} grupos activos</p>
                  <p className="text-xs text-muted-foreground">En total</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-warning mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{formatCurrency(monthlyRevenue)} MRR</p>
                  <p className="text-xs text-muted-foreground">Ingresos recurrentes mensuales</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-info mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{openTickets} tickets abiertos</p>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

