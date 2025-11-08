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
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { contactsApi } from '@/lib/api/contacts';
import { CreateContactRequest, UserResponse, CompanyResponse, ContactType } from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';
import AsyncPaginatedSelect from '@/components/common/AsyncPaginatedSelect';
import { adminApi } from '@/lib/api/admin';

const createContactSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  type: z.enum(['CUSTOMER', 'PROSPECT', 'PARTNER', 'VENDOR']),
  companyId: z.string().optional(),
  ownerId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

type CreateContactFormData = z.infer<typeof createContactSchema>;

export default function CreateContactPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      type: 'CUSTOMER',
    },
  });

  const selectedCompanyId = watch('companyId');
  const selectedOwnerId = watch('ownerId');

  const onSubmit = async (data: CreateContactFormData) => {
    setIsLoading(true);
    const request: CreateContactRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      jobTitle: data.jobTitle,
      department: data.department,
      type: data.type,
      companyId: data.companyId,
      ownerId: data.ownerId,
      tagIds: data.tagIds,
    };
    try {
      const response = await contactsApi.createContact(request);
      apiLogger.general({
        endpoint: 'createContact',
        success: response.success,
        params: { request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Contacto creado exitosamente');
        router.push('/admin/crm/contacts');
      }
    } catch (error: any) {
      apiLogger.general({
        endpoint: 'createContact',
        success: false,
        params: { request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al crear el contacto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/crm/contacts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Contacto</h1>
          <p className="text-muted-foreground">Añade un nuevo contacto a tu base de datos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...register('lastName')} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" {...register('phone')} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Móvil</Label>
                <Input id="mobile" {...register('mobile')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Cargo</Label>
                <Input id="jobTitle" {...register('jobTitle')} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input id="department" {...register('department')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <select id="type" {...register('type')} className="w-full px-3 py-2 border rounded-md">
                  <option value="CUSTOMER">Cliente</option>
                  <option value="PROSPECT">Prospecto</option>
                  <option value="PARTNER">Partner</option>
                  <option value="VENDOR">Proveedor</option>
                </select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Empresa</Label>
                <AsyncPaginatedSelect<CompanyResponse>
                  value={selectedCompanyId}
                  onChange={(val) => setValue('companyId', val)}
                  placeholder="Seleccionar empresa"
                  getOptionLabel={(c) => c.name}
                  getOptionValue={(c) => c.id}
                  fetchPage={async (page, size) => {
                    const res = await contactsApi.getAllCompanies({ page, size });
                    const pageData = res.data as any;
                    return {
                      items: Array.isArray(pageData?.content) ? (pageData.content as CompanyResponse[]) : [],
                      total: typeof pageData?.totalElements === 'number' ? pageData.totalElements : 0,
                    };
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerId">Propietario</Label>
                <AsyncPaginatedSelect<UserResponse>
                  value={selectedOwnerId}
                  onChange={(val) => setValue('ownerId', val)}
                  placeholder="Seleccionar usuario"
                  getOptionLabel={(u) => `${u.name} ${u.lastName || ''} (${u.email})`}
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
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Contacto'}
              </Button>
              <Link href="/admin/crm/contacts">
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

