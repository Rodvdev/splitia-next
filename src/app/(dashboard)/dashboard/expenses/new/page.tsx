'use client';

import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expensesApi } from '@/lib/api/expenses';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { CreateExpenseRequest } from '@/types';

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

export default function NewExpensePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { register, handleSubmit, control } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const amountNum = typeof data.amount === 'string' ? parseFloat(data.amount) : Number(data.amount);
      const paidById = user?.id;
      if (!paidById) {
        toast.error('No hay usuario autenticado');
        return;
      }

      const request: CreateExpenseRequest = {
        amount: amountNum || 0,
        description: data.description || '',
        date: new Date().toISOString(),
        currency: data.currency || 'USD',
        location: data.location || undefined,
        notes: data.notes || undefined,
        paidById,
        shares: [
          {
            userId: paidById,
            amount: amountNum || 0,
            type: 'FIXED',
          },
        ],
      };

      const response = await expensesApi.create(request);
      if (response.success) {
        toast.success('Gasto creado exitosamente');
        router.push('/dashboard/expenses');
      } else {
        toast.error('Error al crear el gasto');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear el gasto');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crear Gasto</h1>
        <p className="text-muted-foreground">Registra un nuevo gasto</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" placeholder="Ej: Cena en restaurante" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
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
                <Label htmlFor="location">Ubicación</Label>
                <Input id="location" placeholder="Opcional" {...register('location')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Input id="notes" placeholder="Opcional" {...register('notes')} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Crear Gasto</Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

