'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { budgetsApi } from '@/lib/api/budgets';
import { groupsApi } from '@/lib/api/groups';
import { BudgetResponse } from '@/types';
import { toast } from 'sonner';
import { Plus, Wallet, Calendar, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetResponse | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCurrency, setEditCurrency] = useState<string>('USD');
  const [editMonth, setEditMonth] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [groupsMap, setGroupsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const [response, groupsRes] = await Promise.all([
        budgetsApi.getAll(),
        groupsApi.getAll({ page: 0, size: 100 }),
      ]);
      apiLogger.budgets({
        endpoint: 'getAll',
        success: response.success,
        params: {},
        data: response.data,
        error: response.success ? null : response,
      });
      setBudgets(extractDataFromResponse(response));
      const groupsData = extractDataFromResponse(groupsRes);
      const map: Record<string, string> = {};
      groupsData.forEach((g: any) => { if (g?.id) map[g.id] = g.name; });
      setGroupsMap(map);
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

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
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
        setConfirmOpen(false);
        setPendingDeleteId(null);
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

  const CURRENCIES = [
    { value: 'USD', label: 'USD - Dólar Estadounidense' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'MXN', label: 'MXN - Peso Mexicano' },
    { value: 'GBP', label: 'GBP - Libra Esterlina' },
    { value: 'JPY', label: 'JPY - Yen Japonés' },
    { value: 'CAD', label: 'CAD - Dólar Canadiense' },
    { value: 'AUD', label: 'AUD - Dólar Australiano' },
    { value: 'CHF', label: 'CHF - Franco Suizo' },
    { value: 'CNY', label: 'CNY - Yuan Chino' },
    { value: 'BRL', label: 'BRL - Real Brasileño' },
  ];

  const openEdit = (budget: BudgetResponse) => {
    setEditingBudget(budget);
    setEditAmount(String(budget.amount));
    setEditCurrency(budget.currency || 'USD');
    setEditMonth(String(budget.month));
    setEditYear(String(budget.year));
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingBudget) return;
    try {
      setSavingEdit(true);
      const monthChanged = Number(editMonth) !== editingBudget.month;
      const yearChanged = Number(editYear) !== editingBudget.year;

      if (monthChanged || yearChanged) {
        const createRes = await budgetsApi.create({
          amount: Number(editAmount),
          month: Number(editMonth),
          year: Number(editYear),
          currency: editCurrency,
          categoryId: editingBudget.category?.id,
        });
        apiLogger.budgets({
          endpoint: 'create',
          success: createRes.success,
          params: { amount: Number(editAmount), month: Number(editMonth), year: Number(editYear) },
          data: createRes.data,
          error: createRes.success ? null : createRes,
        });
        if (createRes.success) {
          const delRes = await budgetsApi.delete(editingBudget.id);
          apiLogger.budgets({
            endpoint: 'delete',
            success: delRes.success,
            params: { id: editingBudget.id },
            data: delRes.data,
            error: delRes.success ? null : delRes,
          });
          toast.success('Presupuesto actualizado');
          setEditOpen(false);
          setEditingBudget(null);
          loadBudgets();
        } else {
          toast.error('No se pudo actualizar el presupuesto');
        }
      } else {
        const response = await budgetsApi.update(editingBudget.id, {
          amount: Number(editAmount),
          currency: editCurrency,
        });
        apiLogger.budgets({
          endpoint: 'update',
          success: response.success,
          params: { id: editingBudget.id },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          toast.success('Presupuesto actualizado');
          setEditOpen(false);
          setEditingBudget(null);
          loadBudgets();
        } else {
          toast.error('No se pudo actualizar el presupuesto');
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar');
    } finally {
      setSavingEdit(false);
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
                      {groupsMap[budget.groupId || ''] || budget.group?.name || budget.category?.name || 'General'}
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
                    onClick={() => openEdit(budget)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar presupuesto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este presupuesto?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={performDelete} disabled={!pendingDeleteId || deletingId === pendingDeleteId}>
              {deletingId === pendingDeleteId ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar presupuesto</DialogTitle>
            <DialogDescription>
              Actualiza el monto y la moneda del presupuesto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="edit-amount" className="text-sm">Monto</label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-month" className="text-sm">Mes</label>
                <Input
                  id="edit-month"
                  type="number"
                  min={1}
                  max={12}
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-year" className="text-sm">Año</label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm">Moneda</label>
              <Select value={editCurrency} onValueChange={setEditCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

