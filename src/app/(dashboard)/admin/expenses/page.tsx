'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ExpenseResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, Receipt, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllExpenses({ page: 0, size: 50 });
      if (response.success) {
        setExpenses(response.data.content);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gastos</h1>
          <p className="text-muted-foreground">Gestiona todos los gastos del sistema</p>
        </div>
        <Link href="/admin/expenses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Gasto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción, ubicación, notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No hay gastos"
              description={searchTerm ? 'No se encontraron gastos con ese criterio' : 'No hay gastos registrados'}
            />
          ) : (
            <div className="space-y-4">
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

