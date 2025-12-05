import { useState, useEffect, useCallback } from 'react';
import { marketingApi } from '@/lib/api/marketing';
import { CampaignResponse, Pageable, Page } from '@/types';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export function useCampaigns(pageable?: Pageable) {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadCampaigns = useCallback(async (params?: Pageable) => {
    try {
      setLoading(true);
      const response = await marketingApi.getAllCampaigns(params || pageable);
      apiLogger.general({
        endpoint: 'getAllCampaigns',
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
        const page = response.data as Page<CampaignResponse>;
        setCampaigns(Array.isArray(page.content) ? page.content : []);
        setTotalPages(page.totalPages || 0);
        setTotalElements(page.totalElements || 0);
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllCampaigns',
        success: false,
        params: params
          ? (params as unknown as Record<string, unknown>)
          : pageable
          ? (pageable as unknown as Record<string, unknown>)
          : undefined,
        error: error,
      });
      toast.error('Error al cargar campañas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pageable]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return {
    campaigns,
    loading,
    totalPages,
    totalElements,
    refetch: loadCampaigns,
  };
}

export function useCampaign(id: string) {
  const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        const response = await marketingApi.getCampaignById(id);
        apiLogger.general({
          endpoint: 'getCampaignById',
          success: response.success,
          params: { id },
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setCampaign(response.data as CampaignResponse);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getCampaignById',
          success: false,
          params: { id },
          error: error,
        });
        toast.error('Error al cargar la campaña');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadCampaign();
  }, [id]);

  return { campaign, loading };
}

