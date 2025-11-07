'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { budgetsApi } from '@/lib/api/budgets';
import { BudgetResponse } from '@/types';
import { toast } from 'sonner';
import { Plus, Wallet, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await budgetsApi.getAll();
      apiLogger.budgets({
        endpoint: 'getAll',
        success: response.success,
        params: {},
        data: response.data,
        error: response.success ? null : response,
      });
      setBudgets(extractDataFromResponse(response));
    } catch (err) {
      apiLogger.budgets({
        endpoint: 'getAll',
        success: false,
        params: {},
        error: err,
      });
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar los presupuestos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await budgetsApi.delete(id);
      apiLogger.budgets({
        endpoint: 'delete',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Presupuesto eliminado correctamente');
        loadBudgets();
      }
    } catch (err) {
      apiLogger.budgets({
        endpoint: 'delete',
        success: false,
        params: { id },
        error: err,
      });
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al eliminar el presupuesto';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">Gestiona tus presupuestos mensuales</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadBudgets} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground">Gestiona tus presupuestos mensuales</p>
        </div>
        <Link href="/dashboard/budgets/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Presupuesto
          </Button>
        </Link>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          title="No hay presupuestos"
          description="Crea tu primer presupuesto para empezar a controlar tus gastos"
          action={
            <Link href="/dashboard/budgets/new">
              <Button>Crear Presupuesto</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      {budget.category?.name || 'General'}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">
                    {budget.currency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">
                    {budget.currency} {budget.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {MONTHS[budget.month - 1]} {budget.year}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(budget.id)}
                    disabled={deletingId === budget.id}
                  >
                    {deletingId === budget.id ? (
                      <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

