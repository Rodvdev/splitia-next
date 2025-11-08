'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { contactsApi } from '@/lib/api/contacts';
import { ContactResponse, ContactType } from '@/types';
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
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

export default function AdminContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    loadContacts();
  }, []);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(WS_CHANNELS.CONTACTS, (message) => {
      const { type, action, entityId, data } = message;
      
      if (type === 'CONTACT_CREATED' || type === 'CONTACT_UPDATED' || action === 'CREATED' || action === 'UPDATED') {
        const contact = data.contact || data as ContactResponse;
        setContacts((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === contact.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = contact;
            return updated;
          } else {
            return [contact, ...prev];
          }
        });
        
        if (type === 'CONTACT_CREATED' || action === 'CREATED') {
          toast.success(`Nuevo contacto: ${contact.firstName} ${contact.lastName || ''}`);
        }
      } else if (type === 'CONTACT_DELETED' || action === 'DELETED') {
        const id = entityId || data.id;
        setContacts((prev) => prev.filter((c) => c.id !== id));
        toast.info('Contacto eliminado');
      }
    });

    return unsubscribe;
  }, [subscribe, connected]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsApi.getAllContacts({
        page: 0,
        size: 50,
      });
      apiLogger.general({
        endpoint: 'getAllContacts',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      const pageData = extractDataFromResponse(response);
      setContacts(pageData as ContactResponse[] || []);
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllContacts',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContacts();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;

    try {
      const response = await contactsApi.deleteContact(id);
      apiLogger.general({
        endpoint: 'deleteContact',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Contacto eliminado exitosamente');
        loadContacts();
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'deleteContact',
        success: false,
        params: { id },
        error: error,
      });
      toast.error('Error al eliminar el contacto');
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
    { label: 'Empresa' },
    { label: 'Cargo' },
    { label: 'Tipo' },
    { label: 'Fecha Creación' },
    { label: 'Acciones' },
  ];

  const tableRows = filteredContacts.map((contact) => [
    <Link
      key={contact.id}
      href={`/admin/crm/contacts/${contact.id}`}
      className="font-medium text-primary hover:underline"
    >
      {contact.firstName} {contact.lastName || ''}
    </Link>,
    <span key={`${contact.id}-email`}>{contact.email}</span>,
    <span key={`${contact.id}-phone`}>{contact.phone || '-'}</span>,
    <span key={`${contact.id}-company`}>{contact.companyName || '-'}</span>,
    <span key={`${contact.id}-position`}>{contact.jobTitle || '-'}</span>,
    <Badge
      key={`${contact.id}-type`}
      variant={
        contact.type === 'CUSTOMER'
          ? 'default'
          : contact.type === 'PROSPECT'
          ? 'secondary'
          : 'outline'
      }
    >
      {contact.type || 'CUSTOMER'}
    </Badge>,
    <span key={`${contact.id}-date`}>{formatDate(contact.createdAt, 'dd/MM/yyyy')}</span>,
    <DropdownMenu key={`${contact.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/contacts/${contact.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/crm/contacts/${contact.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive">
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
          <h1 className="text-3xl font-bold">Contactos</h1>
          <p className="text-muted-foreground">Gestiona tu base de contactos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/crm/companies">
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Empresas
            </Button>
          </Link>
          <Link href="/admin/crm/contacts/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Contacto
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todos los tipos</option>
              <option value="CUSTOMER">Cliente</option>
              <option value="PROSPECT">Prospecto</option>
              <option value="PARTNER">Partner</option>
              <option value="VENDOR">Proveedor</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <EmptyState
              title="No hay contactos"
              description={
                searchTerm || typeFilter !== 'ALL'
                  ? 'No se encontraron contactos con esos filtros'
                  : 'No hay contactos registrados'
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

