import axios from 'axios';
import { ApiResponse, Page } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Public API client without authentication
const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
});

export const publicStatsApi = {
  getUserCount: async (): Promise<number> => {
    try {
      // Try to get user count from admin endpoint
      // Note: This endpoint may require authentication, so it might fail
      // If it fails, we'll return 0 and the UI will show a default value
      const response = await publicApiClient.get<ApiResponse<Page<any>>>('/admin/users', {
        params: { page: 0, size: 1 },
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.totalElements || 0;
      }
      return 0;
    } catch (error: any) {
      // If the endpoint requires auth (401/403) or fails, return 0
      // The UI will handle showing a default value
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Endpoint requires authentication, which is expected for public access
        return 0;
      }
      // For other errors, also return 0
      return 0;
    }
  },
};

