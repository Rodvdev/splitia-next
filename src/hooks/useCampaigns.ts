import { useState, useEffect } from 'react';
import { marketingApi } from '@/lib/api/marketing';
import { CampaignResponse, Pageable } from '@/types';
import { toast } from 'sonner';
import { extractDataFromResponse } from '@/lib/utils/api-response';
import { apiLogger } from '@/lib/utils/api-logger';

export function useCampaigns(pageable?: Pageable) {
  const [campaigns, setCampaigns] = useState<CampaignResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadCampaigns = async (params?: Pageable) => {
    try {
      setLoading(true);
      const response = await marketingApi.getAllCampaigns(params || pageable);
      apiLogger.general({
        endpoint: 'getAllCampaigns',
        success: response.success,
        params: params || pageable,
        data: response.data,
        error: response.success ? null : response,
      });
      if (response.success) {
        const page = response.data as any;
        setCampaigns(Array.isArray(page.content) ? page.content : []);
        setTotalPages(page.totalPages || 0);
        setTotalElements(page.totalElements || 0);
      }
    } catch (error) {
      apiLogger.general({
        endpoint: 'getAllCampaigns',
        success: false,
        params: params || pageable,
        error: error,
      });
      toast.error('Error al cargar campañas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

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

