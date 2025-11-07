'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ExpenseShareResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, User, DollarSign, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function ExpenseShareDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;
  const [share, setShare] = useState<ExpenseShareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (shareId) {
      loadShare();
    }
  }, [shareId]);

  const loadShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getExpenseShareById(shareId);
      if (response.success) {
        setShare(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la participación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta participación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await adminApi.deleteExpenseShare(shareId);
      if (response.success) {
        toast.success('Participación eliminada correctamente');
        router.push('/admin/expense-shares');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar la participación');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EQUAL: 'Igual',
      PERCENTAGE: 'Porcentaje',
      FIXED: 'Fijo',
    };
    return labels[type] || type;
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

  if (!share) {
    return <ErrorMessage message="Participación no encontrada" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expense-shares">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Participación</h1>
          <p className="text-muted-foreground">Información completa de la participación</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Participación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm">{share.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monto</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(share.amount, 'USD', 'es')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tipo:</span>
                <Badge variant="outline">{getTypeLabel(share.type)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold">
                  {share.user.name[0]}{share.user.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{share.user.name} {share.user.lastName}</h3>
                <p className="text-sm text-muted-foreground">{share.user.email}</p>
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar Participación'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

