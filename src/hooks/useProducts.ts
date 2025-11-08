import { useState, useEffect } from 'react';
import { inventoryApi } from '@/lib/api/inventory';
import { ProductResponse, Pageable, InventoryMovementResponse } from '@/types';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export function useProducts(pageable?: Pageable) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadProducts = async (params?: Pageable) => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAllProducts(params || pageable);
      apiLogger.general({
        endpoint: 'getAllProducts',
        success: response.success,
        params: params || pageable,
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        const page = response.data as any;
        setProducts(Array.isArray(page.content) ? page.content : []);
        setTotalPages(page.totalPages || 0);
        setTotalElements(page.totalElements || 0);
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllProducts',
        success: false,
        params: params || pageable,
        error: error,
      });
      toast.error('Error al cargar productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    totalPages,
    totalElements,
    refetch: loadProducts,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getProductById(id);
        apiLogger.general({
          endpoint: 'getProductById',
          success: response.success,
          params: { id },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setProduct(response.data as ProductResponse);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getProductById',
          success: false,
          params: { id },
          error: error,
        });
        toast.error('Error al cargar el producto');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  return { product, loading };
}

export function useInventoryMovements(productId?: string, pageable?: Pageable) {
  const [movements, setMovements] = useState<InventoryMovementResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getInventoryMovements(productId, pageable);
        apiLogger.general({
          endpoint: 'getInventoryMovements',
          success: response.success,
          params: { productId, pageable },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          const page = response.data as any;
          setMovements(Array.isArray(page.content) ? page.content : []);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getInventoryMovements',
          success: false,
          params: { productId, pageable },
          error: error,
        });
        toast.error('Error al cargar movimientos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadMovements();
  }, [productId, pageable?.page, pageable?.size]);

  return { movements, loading };
}

export function useStockAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const response = await inventoryApi.getStockAlerts();
        apiLogger.general({
          endpoint: 'getStockAlerts',
          success: response.success,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setAlerts(response.data as any[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getStockAlerts',
          success: false,
          error: error,
        });
        toast.error('Error al cargar alertas de stock');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, []);

  return { alerts, loading };
}

