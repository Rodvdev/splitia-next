'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { ProductResponse, ProductStatus } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { inventoryApi } from '@/lib/api/inventory';
import { useWebSocket, WS_CHANNELS } from '@/lib/websocket/WebSocketProvider';

export default function InventoryProductsPage() {
  const router = useRouter();
  const { products, loading, refetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { subscribe, connected } = useWebSocket();

  useEffect(() => {
    refetch({ page: 0, size: 50, search: searchTerm || undefined });
  }, [searchTerm, refetch]);

  // Suscripción a actualizaciones en tiempo real
  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe('/topic/inventory/products', (message) => {
      const { type, payload } = message;
      
      if (type === 'PRODUCT_CREATED' || type === 'PRODUCT_UPDATED') {
        const product = payload as ProductResponse;
        refetch();
        if (type === 'PRODUCT_CREATED') {
          toast.success(`Nuevo producto: ${product.name}`);
        }
      } else if (type === 'PRODUCT_DELETED') {
        refetch();
        toast.info('Producto eliminado');
      } else if (type === 'STOCK_UPDATED') {
        refetch();
      }
    });

    return unsubscribe;
  }, [subscribe, connected, refetch]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await inventoryApi.deleteProduct(id);
      if (response.success) {
        toast.success('Producto eliminado exitosamente');
        refetch();
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<ProductStatus, string> = {
    ACTIVE: 'bg-green-500',
    INACTIVE: 'bg-gray-500',
    DISCONTINUED: 'bg-red-500',
  };

  const statusLabels: Record<ProductStatus, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    DISCONTINUED: 'Descontinuado',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const headers = [
    { label: 'SKU' },
    { label: 'Nombre' },
    { label: 'Categoría' },
    { label: 'Stock' },
    { label: 'Precio' },
    { label: 'Estado' },
    { label: 'Acciones', className: 'w-[80px] text-right' },
  ];

  const rows = filteredProducts.map((product) => [
    <span key={`${product.id}-sku`} className="font-mono text-sm">
      {product.sku}
    </span>,
    <Link
      key={`${product.id}-name`}
      href={`/admin/inventory/products/${product.id}`}
      className="text-primary hover:underline font-medium"
    >
      {product.name}
    </Link>,
    <span key={`${product.id}-category`}>{product.category?.name || 'Sin categoría'}</span>,
    <span key={`${product.id}-stock`} className={product.stock < product.minStock ? 'text-red-600 font-semibold' : ''}>
      {product.stock} {product.stock < product.minStock && '⚠️'}
    </span>,
    <span key={`${product.id}-price`}>{formatCurrency(product.price)}</span>,
    <Badge
      key={`${product.id}-status`}
      className={statusColors[product.status] + ' text-white'}
    >
      {statusLabels[product.status]}
    </Badge>,
    <DropdownMenu key={`${product.id}-actions`}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/inventory/products/${product.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/inventory/products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive">
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
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        <Link href="/admin/inventory/products/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="DISCONTINUED">Descontinuado</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No hay productos"
              description={
                searchTerm || statusFilter !== 'ALL'
                  ? 'No se encontraron productos con esos filtros'
                  : 'Comienza agregando productos a tu inventario'
              }
              action={
                !searchTerm && statusFilter === 'ALL' ? (
                  <Link href="/admin/inventory/products/create">
                    <Button>Crear Producto</Button>
                  </Link>
                ) : null
              }
            />
          ) : (
            <ResponsiveTable headers={headers} rows={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

