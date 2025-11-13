'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { groupsApi } from '@/lib/api/groups';
import { GroupResponse, CreateBudgetRequest } from '@/types';
import { budgetsApi } from '@/lib/api/budgets';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { useAuthRestore } from '@/hooks/useAuthRestore';

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

export default function NewBudgetPage() {
  const { register, handleSubmit, watch, setValue, control } = useForm<{ amount: number; currency?: string; month: number; year: number; groupId?: string }>({
    defaultValues: {
      currency: 'USD',
    },
  });
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const { isRestoring, user } = useAuthRestore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [groupsRes] = await Promise.all([
        groupsApi.getAll({ page: 0, size: 100 }),
      ]);
      const groupsData = (groupsRes as any)?.data !== undefined
        ? extractDataFromResponse(groupsRes as any)
        : (Array.isArray(groupsRes) ? (groupsRes as any) : []);
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const selectedGroupId = watch('groupId');

  // Category selection removed

  // Removed categoryId

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      const payload: CreateBudgetRequest = {
        amount: Number(data.amount || 0),
        month: Number(data.month),
        year: Number(data.year),
        currency: data.currency || 'USD',
        groupId: data.groupId || undefined,
      };
      const res = await budgetsApi.create(payload);
      if (res.success) {
        toast.success('Presupuesto creado correctamente');
        window.location.href = '/dashboard/budgets';
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo crear el presupuesto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/budgets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Presupuesto</h1>
          <p className="text-muted-foreground">Crea un nuevo presupuesto mensual</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <Input id="month" type="number" min="1" max="12" placeholder="1-12" {...register('month', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input id="year" type="number" placeholder="2024" {...register('year', { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">Grupo (opcional)</Label>
                <Controller
                  name="groupId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Ninguno</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear Presupuesto'}</Button>
              <Link href="/dashboard/budgets">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

