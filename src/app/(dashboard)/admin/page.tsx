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
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

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
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Suscripción a actualizaciones en tiempo real para métricas del dashboard
  useEffect(() => {
    if (!connected) return;

    // Suscripción a notificaciones globales
    const unsubscribeNotifications = subscribe(WS_CHANNELS.NOTIFICATIONS, (message) => {
      const { type, action, data } = message;
      
      if (type === 'USER_CREATED' || action === 'CREATED') {
        setTotalUsers((prev) => prev + 1);
        toast.success('Nuevo usuario registrado');
      } else if (type === 'GROUP_CREATED' || action === 'CREATED') {
        setActiveGroups((prev) => prev + 1);
      } else if (type === 'SUBSCRIPTION_CREATED' || type === 'SUBSCRIPTION_UPDATED' || action === 'CREATED' || action === 'UPDATED') {
        // Recargar datos de suscripciones para actualizar MRR
        loadDashboardData();
      } else if (type === 'TICKET_CREATED' || action === 'CREATED') {
        const ticket = data.ticket || data;
        if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') {
          setOpenTickets((prev) => prev + 1);
        }
      } else if (type === 'TICKET_STATUS_CHANGED' || action === 'STATUS_CHANGED') {
        const { oldStatus, newStatus } = data;
        if ((oldStatus === 'OPEN' || oldStatus === 'IN_PROGRESS') && 
            (newStatus === 'RESOLVED' || newStatus === 'CLOSED')) {
          setOpenTickets((prev) => Math.max(0, prev - 1));
        } else if ((oldStatus === 'RESOLVED' || oldStatus === 'CLOSED') && 
                   (newStatus === 'OPEN' || newStatus === 'IN_PROGRESS')) {
          setOpenTickets((prev) => prev + 1);
        }
      }
    });

    return unsubscribeNotifications;
  }, [subscribe, connected]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));

      // Cargar todos los datos necesarios con manejo individual de errores
      // Usar un tamaño más razonable para evitar problemas de rendimiento
      const [
        usersRes,
        previousUsersRes,
        groupsRes,
        previousGroupsRes,
        subscriptionsRes,
        previousSubscriptionsRes,
        ticketsRes,
        previousTicketsRes,
      ] = await Promise.allSettled([
        adminApi.getAllUsers({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading users:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllUsers({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading previous users:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllGroups({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading groups:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllGroups({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading previous groups:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllSubscriptions({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading subscriptions:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllSubscriptions({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading previous subscriptions:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllSupportTickets({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading tickets:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
        adminApi.getAllSupportTickets({ page: 0, size: 1000 }).catch((err) => {
          console.error('Error loading previous tickets:', err);
          return { success: false, data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true }, timestamp: new Date().toISOString() };
        }),
      ]);

      // Extraer resultados de Promise.allSettled con validación segura
      const emptyPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0, first: true, last: true };
      const fallbackResponse = { success: false, data: emptyPage, timestamp: new Date().toISOString() };
      const usersResValue = usersRes.status === 'fulfilled' && usersRes.value?.success 
        ? usersRes.value 
        : fallbackResponse;
      const previousUsersResValue = previousUsersRes.status === 'fulfilled' && previousUsersRes.value?.success
        ? previousUsersRes.value 
        : fallbackResponse;
      const groupsResValue = groupsRes.status === 'fulfilled' && groupsRes.value?.success
        ? groupsRes.value 
        : fallbackResponse;
      const previousGroupsResValue = previousGroupsRes.status === 'fulfilled' && previousGroupsRes.value?.success
        ? previousGroupsRes.value 
        : fallbackResponse;
      const subscriptionsResValue = subscriptionsRes.status === 'fulfilled' && subscriptionsRes.value?.success
        ? subscriptionsRes.value 
        : fallbackResponse;
      const previousSubscriptionsResValue = previousSubscriptionsRes.status === 'fulfilled' && previousSubscriptionsRes.value?.success
        ? previousSubscriptionsRes.value 
        : fallbackResponse;
      const ticketsResValue = ticketsRes.status === 'fulfilled' && ticketsRes.value?.success
        ? ticketsRes.value 
        : fallbackResponse;
      const previousTicketsResValue = previousTicketsRes.status === 'fulfilled' && previousTicketsRes.value?.success
        ? previousTicketsRes.value 
        : fallbackResponse;

      // Log todas las respuestas de la API para debugging
      apiLogger.users({
        endpoint: 'getAllUsers (current)',
        success: usersResValue.success,
        params: { page: 0, size: 1000 },
        data: usersResValue.data,
        error: usersRes.status === 'rejected' ? usersRes.reason : (usersResValue.success ? null : usersResValue),
      });
      apiLogger.users({
        endpoint: 'getAllUsers (previous)',
        success: previousUsersResValue.success,
        params: { page: 0, size: 1000 },
        data: previousUsersResValue.data,
        error: previousUsersRes.status === 'rejected' ? previousUsersRes.reason : (previousUsersResValue.success ? null : previousUsersResValue),
      });
      apiLogger.groups({
        endpoint: 'getAllGroups (current)',
        success: groupsResValue.success,
        params: { page: 0, size: 1000 },
        data: groupsResValue.data,
        error: groupsRes.status === 'rejected' ? groupsRes.reason : (groupsResValue.success ? null : groupsResValue),
      });
      apiLogger.groups({
        endpoint: 'getAllGroups (previous)',
        success: previousGroupsResValue.success,
        params: { page: 0, size: 1000 },
        data: previousGroupsResValue.data,
        error: previousGroupsRes.status === 'rejected' ? previousGroupsRes.reason : (previousGroupsResValue.success ? null : previousGroupsResValue),
      });
      apiLogger.subscriptions({
        endpoint: 'getAllSubscriptions (current)',
        success: subscriptionsResValue.success,
        params: { page: 0, size: 1000 },
        data: subscriptionsResValue.data,
        error: subscriptionsRes.status === 'rejected' ? subscriptionsRes.reason : (subscriptionsResValue.success ? null : subscriptionsResValue),
      });
      apiLogger.subscriptions({
        endpoint: 'getAllSubscriptions (previous)',
        success: previousSubscriptionsResValue.success,
        params: { page: 0, size: 1000 },
        data: previousSubscriptionsResValue.data,
        error: previousSubscriptionsRes.status === 'rejected' ? previousSubscriptionsRes.reason : (previousSubscriptionsResValue.success ? null : previousSubscriptionsResValue),
      });
      apiLogger.support({
        endpoint: 'getAllSupportTickets (current)',
        success: ticketsResValue.success,
        params: { page: 0, size: 1000 },
        data: ticketsResValue.data,
        error: ticketsRes.status === 'rejected' ? ticketsRes.reason : (ticketsResValue.success ? null : ticketsResValue),
      });
      apiLogger.support({
        endpoint: 'getAllSupportTickets (previous)',
        success: previousTicketsResValue.success,
        params: { page: 0, size: 1000 },
        data: previousTicketsResValue.data,
        error: previousTicketsRes.status === 'rejected' ? previousTicketsRes.reason : (previousTicketsResValue.success ? null : previousTicketsResValue),
      });

      // Verificar que al menos los datos críticos se cargaron
      if (!usersResValue.success || !groupsResValue.success) {
        console.error('Error al cargar datos críticos:', {
          users: usersResValue.success,
          groups: groupsResValue.success,
          usersError: usersRes.status === 'rejected' ? usersRes.reason : null,
          groupsError: groupsRes.status === 'rejected' ? groupsRes.reason : null,
        });
        throw new Error('Error al cargar datos críticos del dashboard');
      }

      // Mostrar advertencias para datos opcionales que fallaron
      if (!subscriptionsResValue.success) {
        console.warn('No se pudieron cargar las suscripciones');
      }
      if (!ticketsResValue.success) {
        console.warn('No se pudieron cargar los tickets de soporte');
      }

      // Calcular total de usuarios contando elementos en las listas
      const usersData = extractDataFromResponse(usersResValue) as UserResponse[];
      const previousUsersData = extractDataFromResponse(previousUsersResValue) as UserResponse[];
      
      // Contar elementos en las listas (no usar number que es el número de página)
      const totalUsersCount = usersData.length;
      // Para el mes anterior, contar usuarios creados hasta el inicio del mes anterior
      const previousUsersCount = previousUsersData.filter((user: UserResponse) => {
        if (!user?.createdAt) return false;
        const userDate = parseISO(user.createdAt);
        return userDate <= previousMonthStart;
      }).length;
      
      setTotalUsers(totalUsersCount);
      setPreviousMonthUsers(previousUsersCount);

      // Calcular grupos activos contando elementos en las listas
      const groupsData = extractDataFromResponse(groupsResValue) as GroupResponse[];
      const previousGroupsData = extractDataFromResponse(previousGroupsResValue) as GroupResponse[];
      
      // Contar elementos en las listas (no usar number que es el número de página)
      const totalGroupsCount = groupsData.length;
      // Para el mes anterior, contar grupos creados hasta el inicio del mes anterior
      const previousGroupsCount = previousGroupsData.filter((group: GroupResponse) => {
        if (!group?.createdAt) return false;
        const groupDate = parseISO(group.createdAt);
        return groupDate <= previousMonthStart;
      }).length;
      
      setActiveGroups(totalGroupsCount);
      setPreviousMonthGroups(previousGroupsCount);

      // Calcular ingresos mensuales (MRR) - todas las suscripciones activas
      const subscriptionsData = extractDataFromResponse(subscriptionsResValue) as SubscriptionResponse[];
      const previousSubscriptionsData = extractDataFromResponse(previousSubscriptionsResValue) as SubscriptionResponse[];
      
      const currentActiveSubscriptions = subscriptionsData.filter((sub: SubscriptionResponse) => sub?.status === 'ACTIVE');
      const previousActiveSubscriptions = previousSubscriptionsData.filter((sub: SubscriptionResponse) => sub?.status === 'ACTIVE');

      const currentMRR = currentActiveSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
        sum + (sub.pricePerMonth || 0), 0);
      const previousMRR = previousActiveSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
        sum + (sub.pricePerMonth || 0), 0);
      setMonthlyRevenue(currentMRR);
      setPreviousMonthRevenue(previousMRR);

      // Calcular tickets abiertos - filtrar por estado ya que necesitamos solo los abiertos
      const ticketsData = extractDataFromResponse(ticketsResValue) as SupportTicketResponse[];
      const previousTicketsData = extractDataFromResponse(previousTicketsResValue) as SupportTicketResponse[];
      
      const openTicketsCurrent = ticketsData.filter((ticket: SupportTicketResponse) => 
        ticket?.status === 'OPEN' || ticket?.status === 'IN_PROGRESS' || ticket?.status === 'PENDING_CUSTOMER'
      );
      const openTicketsPrevious = previousTicketsData.filter((ticket: SupportTicketResponse) => 
        ticket?.status === 'OPEN' || ticket?.status === 'IN_PROGRESS' || ticket?.status === 'PENDING_CUSTOMER'
      );
      // Usar el conteo de elementos filtrados para tickets abiertos
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
        const weekSubscriptions = subscriptionsData.filter((sub: SubscriptionResponse) => {
          if (!sub?.createdAt) return false;
          const subDate = parseISO(sub.createdAt);
          return subDate <= weekEnd && sub.status === 'ACTIVE';
        });
        const weekAmount = weekSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
          sum + (sub.pricePerMonth || 0), 0);

        // Obtener datos de la semana anterior para comparación
        const previousWeekStart = subWeeks(weekStart, 1);
        const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 1 });
        const previousWeekSubscriptions = subscriptionsData.filter((sub: SubscriptionResponse) => {
          if (!sub?.createdAt) return false;
          const subDate = parseISO(sub.createdAt);
          return subDate <= previousWeekEnd && sub.status === 'ACTIVE';
        });
        const previousWeekAmount = previousWeekSubscriptions.reduce((sum: number, sub: SubscriptionResponse) => 
          sum + (sub.pricePerMonth || 0), 0);

        return {
          date: `Sem ${index + 1}`,
          amount: weekAmount,
          previousAmount: previousWeekAmount,
        };
      });
      setRevenueChartData(revenueData);

      // Usuarios recientes (últimos 3)
      const sortedUsers = [...usersData]
        .sort((a: UserResponse, b: UserResponse) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
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

