'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ConversationResponse, UpdateConversationRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, MessageSquare, Calendar, Users, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

const updateConversationSchema = z.object({
  name: z.string().optional(),
});

type UpdateConversationFormData = z.infer<typeof updateConversationSchema>;

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateConversationFormData>({
    resolver: zodResolver(updateConversationSchema),
  });

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversation && isEditing) {
      reset({
        name: conversation.name ?? undefined,
      });
    }
  }, [conversation, isEditing, reset]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getConversationById(conversationId);
      apiLogger.conversations({
        endpoint: 'getConversationById',
        success: response.success,
        params: { id: conversationId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        setConversation(response.data);
      }
    } catch (err: any) {
      apiLogger.conversations({
        endpoint: 'getConversationById',
        success: false,
        params: { id: conversationId },
        error: err,
      });
      setError(err.response?.data?.message || 'Error al cargar la conversación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateConversationFormData) => {
    setIsSaving(true);
    const request: UpdateConversationRequest = {
      name: data.name,
    };
    try {
      const response = await adminApi.updateConversation(conversationId, request);
      apiLogger.conversations({
        endpoint: 'updateConversation',
        success: response.success,
        params: { id: conversationId, request },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Conversación actualizada exitosamente');
        setConversation(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      apiLogger.conversations({
        endpoint: 'updateConversation',
        success: false,
        params: { id: conversationId, request },
        error: error,
      });
      toast.error(error.response?.data?.message || 'Error al actualizar la conversación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteConversation(conversationId);
      apiLogger.conversations({
        endpoint: 'deleteConversation',
        success: response.success,
        params: { id: conversationId },
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        toast.success('Conversación eliminada correctamente');
        router.push('/admin/conversations');
      }
    } catch (err: any) {
      apiLogger.conversations({
        endpoint: 'deleteConversation',
        success: false,
        params: { id: conversationId },
        error: err,
      });
      toast.error(err.response?.data?.message || 'Error al eliminar la conversación');
    } finally {
      setIsDeleting(false);
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
    return <ErrorMessage message={error} />;
  }

  if (!conversation) {
    return <ErrorMessage message="Conversación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/conversations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{conversation.name || 'Detalle de Conversación'}</h1>
          <p className="text-muted-foreground">Información completa de la conversación</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Conversación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm font-mono text-xs">{conversation.id}</p>
                  </div>
                  {conversation.name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                      <p className="text-sm">{conversation.name}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Creado: {formatDate(conversation.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                  {conversation.updatedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Actualizado: {formatDate(conversation.updatedAt, 'PP', 'es')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participantes ({conversation.participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conversation.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold">
                            {participant.name[0]}{participant.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.name} {participant.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Conversación
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Conversación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Conversación</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

