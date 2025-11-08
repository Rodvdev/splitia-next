import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api/analytics';
import {
  CustomerLTVResponse,
  ChurnAnalysisResponse,
  EngagementScoreResponse,
  CohortAnalysisResponse,
  CustomerSegmentationResponse,
} from '@/types';
import { toast } from 'sonner';
import { apiLogger } from '@/lib/utils/api-logger';

export function useCustomerLTV(params?: { customerId?: string; period?: string }) {
  const [ltv, setLtv] = useState<CustomerLTVResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLTV = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getCustomerLTV(params);
        apiLogger.general({
          endpoint: 'getCustomerLTV',
          success: response.success,
          params,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setLtv(response.data as CustomerLTVResponse[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getCustomerLTV',
          success: false,
          params,
          error: error,
        });
        toast.error('Error al cargar LTV');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadLTV();
  }, [params?.customerId, params?.period]);

  return { ltv, loading };
}

export function useChurnAnalysis(params?: { startDate?: string; endDate?: string }) {
  const [churn, setChurn] = useState<ChurnAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChurn = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getChurnAnalysis(params);
        apiLogger.general({
          endpoint: 'getChurnAnalysis',
          success: response.success,
          params,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setChurn(response.data as ChurnAnalysisResponse[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getChurnAnalysis',
          success: false,
          params,
          error: error,
        });
        toast.error('Error al cargar análisis de churn');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadChurn();
  }, [params?.startDate, params?.endDate]);

  return { churn, loading };
}

export function useEngagementScores(params?: { minScore?: number; maxScore?: number }) {
  const [scores, setScores] = useState<EngagementScoreResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getEngagementScores(params);
        apiLogger.general({
          endpoint: 'getEngagementScores',
          success: response.success,
          params,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setScores(response.data as EngagementScoreResponse[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getEngagementScores',
          success: false,
          params,
          error: error,
        });
        toast.error('Error al cargar engagement scores');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, [params?.minScore, params?.maxScore]);

  return { scores, loading };
}

export function useCohortAnalysis(params?: { cohort?: string }) {
  const [cohorts, setCohorts] = useState<CohortAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCohorts = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getCohortAnalysis(params);
        apiLogger.general({
          endpoint: 'getCohortAnalysis',
          success: response.success,
          params,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setCohorts(response.data as CohortAnalysisResponse[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getCohortAnalysis',
          success: false,
          params,
          error: error,
        });
        toast.error('Error al cargar análisis de cohortes');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCohorts();
  }, [params?.cohort]);

  return { cohorts, loading };
}

export function useCustomerSegmentation() {
  const [segments, setSegments] = useState<CustomerSegmentationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSegments = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getCustomerSegmentation();
        apiLogger.general({
          endpoint: 'getCustomerSegmentation',
          success: response.success,
          data: response.data,
          error: response.success ? null : response,
        });
        if (response.success) {
          setSegments(response.data as CustomerSegmentationResponse[]);
        }
      } catch (error) {
        apiLogger.general({
          endpoint: 'getCustomerSegmentation',
          success: false,
          error: error,
        });
        toast.error('Error al cargar segmentación');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadSegments();
  }, []);

  return { segments, loading };
}

