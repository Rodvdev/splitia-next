'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { contactsApi } from '@/lib/api/contacts';
import { CompanyResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await contactsApi.getAllCompanies(
        {
          page: 0,
          size: 50,
        },
        searchTerm || undefined
      );
      apiLogger.sales({
        endpoint: 'getAllCompanies',
        success: response.success,
        params: { page: 0, size: 50, search: searchTerm },
        data: response.data,
        error: response.success ? null : response,
      });
      setCompanies(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.sales({
        endpoint: 'getAllCompanies',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCompanies();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta empresa?')) return;

    try {
      const response = await contactsApi.deleteCompany(id);
      apiLogger.sales({
        endpoint: 'deleteCompany',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Empresa eliminada exitosamente');
        loadCompanies();
      }
    } catch (error) {
      apiLogger.sales({
        endpoint: 'deleteCompany',
        success: false,
        params: { id },
        error: error,
      });
      toast.error('Error al eliminar la empresa');
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const tableHeaders = [
    { label: 'Nombre' },
    { label: 'Email' },
    { label: 'Teléfono' },
    { label: 'Industria' },
    { label: 'Empleados' },
    { label: 'Fecha Creación' },
    { label: 'Acciones' },
  ];

  const tableRows = filteredCompanies.map((company) => [
    <Link
      key={company.id}
      href={`/admin/crm/companies/${company.id}`}
      className="font-medium text-primary hover:underline"
    >
      {company.name}
    </Link>,
    <span key={`${company.id}-email`}>{company.email || '-'}</span>,
    <span key={`${company.id}-phone`}>{company.phone || '-'}</span>,
    <span key={`${company.id}-industry`}>{company.industry || '-'}</span>,
    <span key={`${company.id}-size`}>{company.size || '-'}</span>,
    <span key={`${company.id}-date`}>{formatDate(company.createdAt, 'dd/MM/yyyy')}</span>,
    <DropdownMenu key={`${company.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/companies/${company.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/companies/${company.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(company.id)} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gestiona tu base de empresas</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/crm/contacts">
            <Button variant="outline">Contactos</Button>
          </Link>
          <Link href="/admin/crm/companies/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Empresa
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, industria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <EmptyState
              title="No hay empresas"
              description={
                searchTerm
                  ? 'No se encontraron empresas con ese criterio'
                  : 'No hay empresas registradas'
              }
            />
          ) : (
            <ResponsiveTable headers={tableHeaders} rows={tableRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

