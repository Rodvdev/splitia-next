import { useState, useEffect, useCallback } from 'react';
import { salesApi } from '@/lib/api/sales';
import { OpportunityResponse, Pageable, OpportunityStage, SalesMetricsResponse, Page } from '@/types';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export function useOpportunities(pageable?: Pageable) {
  const [opportunities, setOpportunities] = useState<OpportunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadOpportunities = useCallback(async (params?: Pageable & {
    stage?: OpportunityStage;
    assignedToId?: string;
    contactId?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const response = await salesApi.getAllOpportunities(params || pageable);
      apiLogger.sales({
        endpoint: 'getAllOpportunities',
        success: response.success,
        params: params
          ? (params as unknown as Record<string, unknown>)
          : pageable
          ? (pageable as unknown as Record<string, unknown>)
          : undefined,
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        const page = response.data as Page<OpportunityResponse>;
        setOpportunities(Array.isArray(page.content) ? page.content : []);
        setTotalPages(page.totalPages || 0);
        setTotalElements(page.totalElements || 0);
      }
    } catch (error) {
      apiLogger.sales({
        endpoint: 'getAllOpportunities',
        success: false,
        params: params
          ? (params as unknown as Record<string, unknown>)
          : pageable
          ? (pageable as unknown as Record<string, unknown>)
          : undefined,
        error: error,
      });
      toast.error('Error al cargar oportunidades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pageable]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return {
    opportunities,
    loading,
    totalPages,
    totalElements,
    refetch: loadOpportunities,
  };
}

export function useOpportunity(id: string) {
  const [opportunity, setOpportunity] = useState<OpportunityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpportunity = async () => {
      try {
        setLoading(true);
        const response = await salesApi.getOpportunityById(id);
        apiLogger.sales({
          endpoint: 'getOpportunityById',
          success: response.success,
          params: { id },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setOpportunity(response.data as OpportunityResponse);
        }
      } catch (error) {
        apiLogger.sales({
          endpoint: 'getOpportunityById',
          success: false,
          params: { id },
          error: error,
        });
        toast.error('Error al cargar la oportunidad');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadOpportunity();
  }, [id]);

  return { opportunity, loading };
}

export function useOpportunityStats() {
  const [stats, setStats] = useState<SalesMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const response = await salesApi.getMetrics();
        apiLogger.sales({
          endpoint: 'getMetrics',
          success: response.success,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setStats(response.data as SalesMetricsResponse);
        }
      } catch (error) {
        apiLogger.sales({
          endpoint: 'getMetrics',
          success: false,
          error: error,
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return { stats, loading };
}

