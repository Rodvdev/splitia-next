'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ExpenseResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Receipt, Calendar, MapPin, FileText, User, Users, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;
  const [expense, setExpense] = useState<ExpenseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (expenseId) {
      loadExpense();
    }
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getExpenseById(expenseId);
      if (response.success) {
        setExpense(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await adminApi.deleteExpense(expenseId);
      if (response.success) {
        toast.success('Gasto eliminado correctamente');
        router.push('/admin/expenses');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar el gasto');
    } finally {
      setDeleting(false);
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

  if (!expense) {
    return <ErrorMessage message="Gasto no encontrado" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/expenses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{expense.description}</h1>
          <p className="text-muted-foreground">Detalle del gasto</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Gasto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p className="text-sm">{expense.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(expense.amount, expense.currency, 'es')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Moneda:</span>
                <Badge variant="outline">{expense.currency}</Badge>
              </div>
              {expense.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expense.location}</span>
                </div>
              )}
              {expense.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notas</p>
                    <p className="text-sm">{expense.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Fecha: {formatDate(expense.date, 'PP', 'es')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Creado: {formatDate(expense.createdAt, 'PP', 'es')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagado por</p>
                <p className="text-sm">
                  {expense.paidBy.name} {expense.paidBy.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{expense.paidBy.email}</p>
              </div>
            </div>
            {expense.group && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grupo</p>
                  <p className="text-sm">{expense.group.name}</p>
                </div>
              </div>
            )}
            {expense.category && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <p className="text-sm">{expense.category.name}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Es Liquidación</p>
              <Badge variant={expense.isSettlement ? 'default' : 'outline'}>
                {expense.isSettlement ? 'Sí' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {expense.shares && expense.shares.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Participaciones ({expense.shares.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expense.shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {share.user.name[0]}{share.user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {share.user.name} {share.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{share.user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(share.amount, expense.currency, 'es')}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {share.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar Gasto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

