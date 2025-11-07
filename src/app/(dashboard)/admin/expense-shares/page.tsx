'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api/admin';
import { ExpenseShareResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Search, MoreVertical, Share2 } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';

export default function AdminExpenseSharesPage() {
  const [expenseShares, setExpenseShares] = useState<ExpenseShareResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExpenseShares();
  }, []);

  const loadExpenseShares = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllExpenseShares({ page: 0, size: 50 });
      if (response.success) {
        setExpenseShares(response.data.content);
      }
    } catch (error) {
      console.error('Error loading expense shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShares = expenseShares.filter(
    (share) =>
      share.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Participaciones en Gastos</h1>
          <p className="text-muted-foreground">Gestiona todas las participaciones en gastos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredShares.length === 0 ? (
            <EmptyState
              title="No hay participaciones"
              description={searchTerm ? 'No se encontraron participaciones con ese criterio' : 'No hay participaciones registradas'}
            />
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShares.map((share) => (
                      <tr key={share.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Share2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{share.user.name} {share.user.lastName}</p>
                              <p className="text-xs text-muted-foreground">{share.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {formatCurrency(share.amount, 'USD', 'es')}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{getTypeLabel(share.type)}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/expense-shares/${share.id}`}>
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

