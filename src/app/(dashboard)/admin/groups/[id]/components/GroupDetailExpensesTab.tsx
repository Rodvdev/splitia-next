'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ExpenseResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Receipt, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { Button } from '@/components/ui/button';

export default function GroupDetailExpensesTab({ groupId }: { groupId: string }) {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [groupId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllExpenses({ page: 0, size: 50 });
      apiLogger.expenses({
        endpoint: 'getAllExpenses',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      const allExpenses = extractDataFromResponse(response);
      // Filter expenses for this group
      const groupExpenses = allExpenses.filter(expense => expense.group?.id === groupId);
      setExpenses(groupExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (expenses.length === 0) {
    return <EmptyState title="No hay gastos" description="Este grupo no tiene gastos registrados" />;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Pagado por</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
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
              <td className="px-4 py-3 text-sm">
                {expense.paidBy.name} {expense.paidBy.lastName}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(expense.date, 'PP', 'es')}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/expenses/${expense.id}`}>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

