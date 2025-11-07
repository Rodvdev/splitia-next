'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { PlanResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, CreditCard, Check, X } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllPlans({ page: 0, size: 50 });
      if (response.success) {
        setPlans(response.data.content);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLimit = (value: number | null): string => {
    return value === null ? 'Ilimitado' : value.toLocaleString();
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
          <h1 className="text-3xl font-bold">Planes</h1>
          <p className="text-muted-foreground">Gestiona todos los planes de suscripción</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlans.length === 0 ? (
            <EmptyState
              title="No hay planes"
              description={searchTerm ? 'No se encontraron planes con ese criterio' : 'No hay planes registrados'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Grupos</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Miembros</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Kanban</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{plan.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {plan.pricePerMonth === 0
                                ? 'Gratis'
                                : `${plan.currency} ${plan.pricePerMonth.toFixed(2)}/mes`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatLimit(plan.maxGroups)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatLimit(plan.maxGroupMembers)}
                        </td>
                        <td className="px-4 py-3">
                          {plan.hasKanban ? (
                            <Badge variant="default" className="bg-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Sí
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(plan.createdAt, 'PP', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/plans/${plan.id}`}>
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

