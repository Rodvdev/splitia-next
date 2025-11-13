"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { expensesApi } from '@/lib/api/expenses';
import { ExpenseResponse } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const response = await expensesApi.getAll({ page: 0, size: 50 });
        apiLogger.expenses({
          endpoint: 'getAll',
          success: response.success,
          params: { page: 0, size: 50 },
          data: response.data,
          error: response.success ? null : response,
        });
        setExpenses(extractDataFromResponse(response));
      } catch (error) {
        apiLogger.expenses({
          endpoint: 'getAll',
          success: false,
          params: { page: 0, size: 50 },
          error,
        });
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (!expenses.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gastos</h1>
            <p className="text-muted-foreground">Gestiona tus gastos individuales y grupales</p>
          </div>
          <Link href="/dashboard/expenses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Gasto
            </Button>
          </Link>
        </div>

        <EmptyState
          title="No hay gastos"
          description="Crea tu primer gasto para empezar a llevar un registro"
          action={
            <Link href="/dashboard/expenses/new">
              <Button>Crear Gasto</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Gestiona tus gastos individuales y grupales</p>
        </div>
        <Link href="/dashboard/expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Gasto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Moneda</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Pagado por</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Grupo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          {expense.location && (
                            <p className="text-xs text-muted-foreground">{expense.location}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {formatCurrency(expense.amount, expense.currency, 'es')}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{expense.currency}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {expense.paidBy.name} {expense.paidBy.lastName}
                    </td>
                    <td className="px-4 py-3">
                      {expense.group ? (
                        <Badge variant="outline">{expense.group.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Individual</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(expense.date, 'PP', 'es')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

