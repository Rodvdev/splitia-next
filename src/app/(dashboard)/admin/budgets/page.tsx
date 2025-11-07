'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { BudgetResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, Wallet, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';

export default function AdminBudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllBudgets({ page: 0, size: 50 });
      if (response.success) {
        setBudgets(response.data.content);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.month.toString().includes(searchTerm) ||
      budget.year.toString().includes(searchTerm) ||
      budget.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || month.toString();
  };

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
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">Gestiona todos los presupuestos del sistema</p>
        </div>
        <Link href="/admin/budgets/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Presupuesto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mes, año..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length === 0 ? (
            <EmptyState
              title="No hay presupuestos"
              description={searchTerm ? 'No se encontraron presupuestos con ese criterio' : 'No hay presupuestos registrados'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Mes/Año</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Moneda</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBudgets.map((budget) => (
                      <tr key={budget.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{formatCurrency(budget.amount, budget.currency, 'es')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {getMonthName(budget.month)} {budget.year}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{budget.currency}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {budget.category ? (
                            <Badge variant="outline">{budget.category.name}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin categoría</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(budget.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/budgets/${budget.id}`}>
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

