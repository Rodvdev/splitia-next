'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api/admin';
import { CategoryResponse } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Tag, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';
import { apiLogger } from '@/lib/utils/api-logger';
import { extractDataFromResponse } from '@/lib/utils/api-response';

export default function GroupDetailCategoriesTab({ groupId }: { groupId: string }) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [groupId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCategories({ page: 0, size: 50 });
      apiLogger.categories({
        endpoint: 'getAllCategories',
        success: response.success,
        params: { page: 0, size: 50 },
        data: response.data,
        error: response.success ? null : response,
      });
      const allCategories = extractDataFromResponse(response);
      // Filter categories for this group
      const groupCategories = allCategories.filter(category => category.groupId === groupId);
      setCategories(groupCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (categories.length === 0) {
    return <EmptyState title="No hay categorías" description="Este grupo no tiene categorías registradas" />;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Icono</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Color</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Creado por</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <Tag className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {category.icon ? (
                  <span className="text-2xl">{category.icon}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin icono</span>
                )}
              </td>
              <td className="px-4 py-3">
                {category.color ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border-2 shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs font-medium">{category.color}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin color</span>
                )}
              </td>
              <td className="px-4 py-3">
                {category.createdByName ? (
                  <span className="text-sm">{category.createdByName}</span>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">{category.createdById}</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(category.createdAt, 'PP', 'es')}
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/categories/${category.id}`}>
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
  );
}

