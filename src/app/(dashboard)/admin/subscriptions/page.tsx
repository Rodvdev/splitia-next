'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { SubscriptionResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, CreditCard, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSubscriptions({ page: 0, size: 50 });
      apiLogger.subscriptions({
        endpoint: 'getAllSubscriptions',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      setSubscriptions(extractDataFromResponse(response));
    } catch (error) {
      apiLogger.subscriptions({
        endpoint: 'getAllSubscriptions',
        success: false,
        params: { page: 0, size: 50 },
        error: error,
      });
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      FREE: 'Gratis',
      PREMIUM: 'Premium',
      ENTERPRISE: 'Enterprise',
    };
    return labels[plan] || plan;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      PAST_DUE: 'Vencida',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
      ACTIVE: 'default',
      INACTIVE: 'outline',
      CANCELLED: 'destructive',
      EXPIRED: 'outline',
      PAST_DUE: 'destructive',
    };
    return variants[status] || 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suscripciones</h1>
          <p className="text-muted-foreground">Gestiona todas las suscripciones del sistema</p>
        </div>
        <Link href="/admin/subscriptions/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Suscripción
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por plan, estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <EmptyState
              title="No hay suscripciones"
              description={searchTerm ? 'No se encontraron suscripciones con ese criterio' : 'No hay suscripciones registradas'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Precio/Mes</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Moneda</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Inicio</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          {subscription.user ? (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                  {subscription.user.name[0]}{subscription.user.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{subscription.user.name} {subscription.user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{subscription.user.email}</p>
                              </div>
                            </div>
                          ) : subscription.userEmail || subscription.userName ? (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{subscription.userName || 'Usuario'}</p>
                                {subscription.userEmail && (
                                  <p className="text-xs text-muted-foreground">{subscription.userEmail}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{getPlanLabel(subscription.planType)}</p>
                              {subscription.autoRenew && (
                                <p className="text-xs text-muted-foreground">Auto-renovación</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(subscription.status)}>
                            {getStatusLabel(subscription.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {formatCurrency(subscription.pricePerMonth, subscription.currency, 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{subscription.currency}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(subscription.startDate, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/subscriptions/${subscription.id}`}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

