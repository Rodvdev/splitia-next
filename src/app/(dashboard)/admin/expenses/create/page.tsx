'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateExpenseRequest, ExpenseShareRequest, GroupResponse, CategoryResponse, UserResponse } from '@/types';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

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

const createExpenseSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string().min(1, 'La fecha es requerida'),
  currency: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
  categoryId: z.string().optional(),
  paidById: z.string().min(1, 'El usuario que pagó es requerido'),
  shares: z.array(z.object({
    userId: z.string(),
    amount: z.number(),
    type: z.enum(['EQUAL', 'PERCENTAGE', 'FIXED']),
  })).min(1, 'Debe haber al menos una participación'),
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

export default function CreateExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getAllCategories({ page: 0, size: 100 });
      if (response.success) {
        setCategories(extractDataFromResponse(response));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const selectedGroupId = watch('groupId');
  const selectedCategoryId = watch('categoryId');
  const selectedPaidById = watch('paidById');

  const onSubmit = async (data: CreateExpenseFormData) => {
    setIsLoading(true);
    const request: CreateExpenseRequest = {
      amount: data.amount,
      description: data.description,
      date: data.date,
      currency: data.currency,
      location: data.location,
      notes: data.notes,
      groupId: data.groupId,
      categoryId: data.categoryId,
      paidById: data.paidById,
      shares: data.shares.map(s => ({
        userId: s.userId,
        amount: s.amount,
        type: s.type,
      })),
    };
    try {
      const response = await adminApi.createExpense(request);
      apiLogger.expenses({
        endpoint: 'createExpense',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Gasto creado exitosamente');
        router.push('/admin/expenses');
      }
    } catch (error: any) {
      apiLogger.expenses({
        endpoint: 'createExpense',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el gasto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Gasto</h1>
          <p className="text-muted-foreground">Crea un nuevo gasto en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación (opcional)</Label>
                <Input id="location" {...register('location')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input id="notes" {...register('notes')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupId">Grupo (opcional)</Label>
                <AsyncPaginatedSelect<GroupResponse>
                  value={selectedGroupId}
                  onChange={(val) => setValue('groupId', val)}
                  placeholder="Seleccionar grupo"
                  getOptionLabel={(g) => g.name}
                  getOptionValue={(g) => g.id}
                  fetchPage={async (page, size) => {
                    const res = await adminApi.getAllGroups({ page, size });
                    const data: any = res.data as any;
                    return {
                      items: Array.isArray(data?.content) ? (data.content as GroupResponse[]) : [],
                      total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                    };
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría (opcional)</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguna</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidById">Usuario que Pagó</Label>
              <AsyncPaginatedSelect<UserResponse>
                value={selectedPaidById}
                onChange={(val) => setValue('paidById', val)}
                placeholder="Seleccionar usuario"
                getOptionLabel={(u) => `${u.name} ${u.lastName} (${u.email})`}
                getOptionValue={(u) => u.id}
                fetchPage={async (page, size) => {
                  const res = await adminApi.getAllUsers({ page, size });
                  const data: any = res.data as any;
                  return {
                    items: Array.isArray(data?.content) ? (data.content as UserResponse[]) : [],
                    total: typeof data?.totalElements === 'number' ? data.totalElements : 0,
                  };
                }}
              />
              {errors.paidById && <p className="text-sm text-destructive">{errors.paidById.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Participaciones (formato JSON simplificado - se puede mejorar después)</Label>
              <Input placeholder='[{"userId":"...","amount":100,"type":"EQUAL"}]' disabled />
              <p className="text-xs text-muted-foreground">Nota: La funcionalidad completa de participaciones se implementará después</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Gasto'}
              </Button>
              <Link href="/admin/expenses">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

