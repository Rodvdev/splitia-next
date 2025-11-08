'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { contactsApi } from '@/lib/api/contacts';
import { ContactResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContact = async () => {
      try {
        setLoading(true);
        const response = await contactsApi.getContactById(id);
        apiLogger.sales({
          endpoint: 'getContactById',
          success: response.success,
          params: { id },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setContact(response.data as ContactResponse);
        }
      } catch (error) {
        apiLogger.sales({
          endpoint: 'getContactById',
          success: false,
          params: { id },
          error: error,
        });
        toast.error('Error al cargar el contacto');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadContact();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;

    try {
      const response = await contactsApi.deleteContact(id);
      apiLogger.sales({
        endpoint: 'deleteContact',
        success: response.success,
        params: { id },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Contacto eliminado exitosamente');
        router.push('/admin/crm/contacts');
      }
    } catch (error) {
      apiLogger.sales({
        endpoint: 'deleteContact',
        success: false,
        params: { id },
        error: error,
      });
      toast.error('Error al eliminar el contacto');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!contact) {
    return (
      <EmptyState
        title="Contacto no encontrado"
        description="El contacto que buscas no existe o fue eliminado"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/crm/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName || ''}
            </h1>
            <p className="text-muted-foreground">Detalle del contacto</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/crm/contacts/${contact.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="activities">Actividades</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </p>
                </div>
                {contact.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </p>
                  </div>
                )}
                </div>
                {/* {contact.company && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                    <p className="mt-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {contact.company}
                    </p>
                  </div>
                )}
                {contact.position && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cargo</label>
                    <p className="mt-1">{contact.position}</p>
                  </div>
                )}
                {contact.industry && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Industria</label>
                    <p className="mt-1">{contact.industry}</p>
                  </div>
                )}
                {contact.website && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sitio Web</label>
                    <p className="mt-1">
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {contact.website}
                      </a>
                    </p>
                  </div>
                )}
                {contact.status && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <p className="mt-1">
                      <Badge variant={contact.status === 'CUSTOMER' ? 'default' : 'outline'}>
                        {contact.status}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
              {(contact.address || contact.city || contact.country) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección
                  </label>
                  <p className="mt-1">
                    {contact.address}
                    {contact.city && `, ${contact.city}`}
                    {contact.country && `, ${contact.country}`}
                    {contact.postalCode && ` ${contact.postalCode}`}
                  </p>
                </div>
              )}
              {contact.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notas</label>
                  <p className="mt-1 whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )} */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Oportunidades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Oportunidades relacionadas - Próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Historial de actividades - Próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

