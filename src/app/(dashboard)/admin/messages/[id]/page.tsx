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
import { MessageResponse, UpdateMessageRequest } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Mail, Calendar, User, Bot, Edit, Save, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

const updateMessageSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido'),
});

type UpdateMessageFormData = z.infer<typeof updateMessageSchema>;

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.id as string;
  const [message, setMessage] = useState<MessageResponse | null>(null);
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
  } = useForm<UpdateMessageFormData>({
    resolver: zodResolver(updateMessageSchema),
  });

  useEffect(() => {
    if (messageId) {
      loadMessage();
    }
  }, [messageId]);

  useEffect(() => {
    if (message && isEditing) {
      reset({
        content: message.content,
      });
    }
  }, [message, isEditing, reset]);

  const loadMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getMessageById(messageId);
      if (response.success) {
        setMessage(response.data);
        // Note: We need conversationId for update, but MessageResponse doesn't include it
        // This would need to be passed or fetched separately
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateMessageFormData) => {
    setIsSaving(true);
    try {
      const request: UpdateMessageRequest = {
        content: data.content,
      };
      const response = await adminApi.updateMessage(messageId, request);
      if (response.success) {
        toast.success('Mensaje actualizado exitosamente');
        setMessage(response.data);
        setIsEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar el mensaje');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminApi.deleteMessage(messageId);
      if (response.success) {
        toast.success('Mensaje eliminado correctamente');
        router.push('/admin/messages');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el mensaje');
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

  if (!message) {
    return <ErrorMessage message="Mensaje no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Mensaje</h1>
          <p className="text-muted-foreground">Información completa del mensaje</p>
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contenido del Mensaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="text-sm font-mono text-xs">{message.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Contenido</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                      {message.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.isAI ? (
                      <>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="default">Mensaje de IA</Badge>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">Mensaje de Usuario</Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Enviado: {formatDate(message.createdAt, 'PP', 'es')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Remitente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold">
                      {message.sender.name[0]}{message.sender.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{message.sender.name} {message.sender.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{message.sender.email}</p>
                  </div>
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
                  Editar Mensaje
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar Mensaje'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Editar Mensaje</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Input id="content" {...register('content')} />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
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

