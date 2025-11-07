'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { CreateSupportTicketRequest } from '@/types';
import { toast } from 'sonner';

const createSupportTicketSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'BUG_REPORT', 'ACCOUNT', 'GENERAL'], {
    required_error: 'La categoría es requerida',
  }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

type CreateSupportTicketFormData = z.infer<typeof createSupportTicketSchema>;

export default function CreateSupportTicketPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSupportTicketFormData>({
    resolver: zodResolver(createSupportTicketSchema),
  });

  const onSubmit = async (data: CreateSupportTicketFormData) => {
    setIsLoading(true);
    try {
      const request: CreateSupportTicketRequest = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
      };
      const response = await adminApi.createSupportTicket(request);
      if (response.success) {
        toast.success('Ticket creado exitosamente');
        router.push('/admin/support-tickets');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/support-tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Ticket de Soporte</h1>
          <p className="text-muted-foreground">Crea un nuevo ticket de soporte en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Título del ticket" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" placeholder="Descripción del ticket" {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select id="category" {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="TECHNICAL">Técnico</option>
                  <option value="BILLING">Facturación</option>
                  <option value="FEATURE_REQUEST">Solicitud</option>
                  <option value="BUG_REPORT">Error</option>
                  <option value="ACCOUNT">Cuenta</option>
                  <option value="GENERAL">General</option>
                </select>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad (opcional)</Label>
                <select id="priority" {...register('priority')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Ticket'}
              </Button>
              <Link href="/admin/support-tickets">
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

