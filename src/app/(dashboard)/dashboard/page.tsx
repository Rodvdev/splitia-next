'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Users, Wallet, TrendingUp, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { expensesApi } from '@/lib/api/expenses';
import { groupsApi } from '@/lib/api/groups';
import { budgetsApi } from '@/lib/api/budgets';
import { settlementsApi } from '@/lib/api/settlements';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ExpenseResponse, GroupResponse, BudgetResponse, SettlementResponse } from '@/types';
import { es } from 'date-fns/locale';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

interface ChartDataPoint {
  date: string;
  amount: number;
  previousAmount: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const currentDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState(0);
  const [activeGroups, setActiveGroups] = useState(0);
  const [budgetAvailable, setBudgetAvailable] = useState(0);
  const [balance, setBalance] = useState(0);
  const [expenseChartData, setExpenseChartData] = useState<ChartDataPoint[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategoryDataPoint[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseResponse[]>([]);
  const [recentGroups, setRecentGroups] = useState<GroupResponse[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const previousMonthStart = startOfMonth(subMonths(now, 1));
      const previousMonthEnd = endOfMonth(subMonths(now, 1));

      // Cargar gastos del mes actual y anterior
      const [currentExpensesRes, previousExpensesRes, groupsRes, budgetsRes, settlementsRes] = await Promise.all([
        expensesApi.getAll({ page: 0, size: 1000 }),
        expensesApi.getAll({ page: 0, size: 1000 }),
        groupsApi.getAll({ page: 0, size: 100 }),
        budgetsApi.getAll(),
        settlementsApi.getAll(),
      ]);

      // Log all API responses
      apiLogger.expenses({
        endpoint: 'getAll (current month)',
        success: currentExpensesRes.success,
        params: { page: 0, size: 1000 },
        data: currentExpensesRes.data,
        error: currentExpensesRes.success ? null : currentExpensesRes,
      });
      apiLogger.expenses({
        endpoint: 'getAll (previous month)',
        success: previousExpensesRes.success,
        params: { page: 0, size: 1000 },
        data: previousExpensesRes.data,
        error: previousExpensesRes.success ? null : previousExpensesRes,
      });
      apiLogger.groups({
        endpoint: 'getAll',
        success: groupsRes.success,
        params: { page: 0, size: 100 },
        data: groupsRes.data,
        error: groupsRes.success ? null : groupsRes,
      });
      apiLogger.budgets({
        endpoint: 'getAll',
        success: budgetsRes.success,
        params: {},
        data: budgetsRes.data,
        error: budgetsRes.success ? null : budgetsRes,
      });
      apiLogger.settlements({
        endpoint: 'getAll',
        success: settlementsRes.success,
        params: {},
        data: settlementsRes.data,
        error: settlementsRes.success ? null : settlementsRes,
      });

      if (!currentExpensesRes.success || !groupsRes.success || !budgetsRes.success) {
        throw new Error('Error al cargar datos del dashboard');
      }

      // Validar que los datos existan antes de procesarlos
      const currentExpensesData = extractDataFromResponse(currentExpensesRes);
      const previousExpensesData = extractDataFromResponse(previousExpensesRes);
      const groupsData = extractDataFromResponse(groupsRes);
      const budgetsData = extractDataFromResponse(budgetsRes);
      const settlementsData = extractDataFromResponse(settlementsRes);

      const currentExpenses = currentExpensesData.filter((exp: ExpenseResponse) => {
        const expDate = parseISO(exp.date);
        return expDate >= currentMonthStart && expDate <= currentMonthEnd;
      });

      const previousExpenses = previousExpensesData.filter((exp: ExpenseResponse) => {
        const expDate = parseISO(exp.date);
        return expDate >= previousMonthStart && expDate <= previousMonthEnd;
      });

      // Calcular totales
      const currentTotal = currentExpenses.reduce((sum: number, exp: ExpenseResponse) => sum + exp.amount, 0);
      const previousTotal = previousExpenses.reduce((sum: number, exp: ExpenseResponse) => sum + exp.amount, 0);
      setTotalExpenses(currentTotal);
      setPreviousMonthExpenses(previousTotal);

      // Calcular grupos activos contando elementos en las listas
      // Contar elementos en las listas (no usar number que es el número de página)
      const totalGroupsCount = groupsData.length;
      setActiveGroups(totalGroupsCount);

      // Calcular presupuesto disponible
      const currentBudgets = budgetsData.filter((budget: BudgetResponse) => 
        budget.month === now.getMonth() + 1 && budget.year === now.getFullYear()
      );
      const totalBudget = currentBudgets.reduce((sum: number, budget: BudgetResponse) => sum + (budget.amount || 0), 0);
      setBudgetAvailable(totalBudget - currentTotal);

      // Calcular balance (de settlements)
      if (settlementsRes.success && user?.id && settlementsData.length > 0) {
        const userSettlements = settlementsData.filter((settlement: SettlementResponse) => {
          // Filtrar settlements donde el usuario debe recibir dinero (RECEIPT) o pagar (PAYMENT)
          const isReceipt = settlement.type === 'RECEIPT' && settlement.settledWithUser?.id === user.id;
          const isPayment = settlement.type === 'PAYMENT' && settlement.initiatedBy?.id === user.id;
          return isReceipt || isPayment;
        });
        const totalBalance = userSettlements.reduce((sum: number, settlement: SettlementResponse) => {
          // Si es RECEIPT, el usuario recibe dinero (positivo)
          // Si es PAYMENT, el usuario paga dinero (negativo)
          const amount = settlement.type === 'RECEIPT' ? (settlement.amount || 0) : -(settlement.amount || 0);
          return sum + amount;
        }, 0);
        setBalance(Math.max(0, totalBalance)); // Solo mostrar balance positivo
      }

      // Preparar datos para gráfico semanal
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const weekData: ChartDataPoint[] = weekDays.map((day, index) => {
        const dayExpenses = currentExpenses.filter((exp: ExpenseResponse) => {
          const expDate = parseISO(exp.date);
          return format(expDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        const dayAmount = dayExpenses.reduce((sum: number, exp: ExpenseResponse) => sum + exp.amount, 0);
        
        // Obtener datos del día anterior de la semana pasada
        const previousWeekDay = subMonths(day, 0); // Ajustar según necesidad
        const previousDayExpenses = previousExpenses.filter((exp: ExpenseResponse) => {
          const expDate = parseISO(exp.date);
          return format(expDate, 'yyyy-MM-dd') === format(previousWeekDay, 'yyyy-MM-dd');
        });
        const previousDayAmount = previousDayExpenses.reduce((sum: number, exp: ExpenseResponse) => sum + exp.amount, 0);

        return {
          date: format(day, 'EEE', { locale: es }).slice(0, 3),
          amount: dayAmount,
          previousAmount: previousDayAmount,
        };
      });
      setExpenseChartData(weekData);

      // Preparar datos para gráfico de categorías
      const categoryMap = new Map<string, number>();
      currentExpenses.forEach((exp: ExpenseResponse) => {
        const categoryName = exp.category?.name || 'Sin categoría';
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + exp.amount);
      });
      
      const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
      const categoryData: CategoryDataPoint[] = Array.from(categoryMap.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      setCategoryChartData(categoryData);

      // Gastos recientes (últimos 3)
      const sortedExpenses = [...currentExpensesData]
        .sort((a: ExpenseResponse, b: ExpenseResponse) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 3);
      setRecentExpenses(sortedExpenses);

      // Grupos recientes (últimos 3)
      const sortedGroups = [...groupsData]
        .sort((a: GroupResponse, b: GroupResponse) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        .slice(0, 3);
      setRecentGroups(sortedGroups);

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

  const expensesTrend = calculateTrend(totalExpenses, previousMonthExpenses);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con saludo personalizado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hola, {user?.name || 'Usuario'} 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 capitalize">{currentDate}</p>
        </div>
        <QuickActions />
      </div>

      {/* KPIs principales - Priorizados visualmente */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Gastos Totales"
          value={formatCurrency(totalExpenses)}
          description="Este mes"
          icon={Receipt}
          trend={{ 
            value: expensesTrend.value, 
            label: 'vs mes anterior', 
            isPositive: !expensesTrend.isPositive 
          }}
          variant="danger"
          onClick={() => router.push('/dashboard/expenses')}
        />
        <MetricCard
          title="Grupos Activos"
          value={activeGroups.toString()}
          description="Participando"
          icon={Users}
          variant="success"
          onClick={() => router.push('/dashboard/groups')}
        />
        <MetricCard
          title="Presupuesto"
          value={formatCurrency(Math.max(0, budgetAvailable))}
          description="Disponible este mes"
          icon={Wallet}
          variant="default"
          onClick={() => router.push('/dashboard/budgets')}
        />
        <MetricCard
          title="Balance"
          value={formatCurrency(balance)}
          description="A tu favor"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Visualizaciones - Gráficos comprensibles */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <ExpenseChart data={expenseChartData} period="week" />
        <CategoryChart data={categoryChartData} />
      </div>

      {/* Información contextual - Gastos recientes y grupos */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gastos Recientes</CardTitle>
            <button
              onClick={() => router.push('/dashboard/expenses')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push('/dashboard/expenses')}
                  >
                    <div>
                      <p className="text-sm font-medium">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeDate(expense.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay gastos recientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grupos Activos</CardTitle>
            <button
              onClick={() => router.push('/dashboard/groups')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentGroups.length > 0 ? (
                recentGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push('/dashboard/groups')}
                  >
                    <div>
                      <p className="text-sm font-medium">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.members?.length || 0} miembro{(group.members?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay grupos activos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

