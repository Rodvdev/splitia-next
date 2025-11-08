import { apiClient } from './client';
import { ApiResponse, GroupInvitationResponse, CreateGroupInvitationRequest, Page, Pageable } from '@/types';

/**
 * Public Group Invitations API
 * Aligns with new backend endpoints:
 * - POST   /groups/{groupId}/invitations/targeted (DEPRECATED - Use admin endpoint instead)
 * - GET    /groups/{groupId}/invitations
 * - GET    /invitations/me
 * - POST   /invitations/{token}/accept
 * - POST   /invitations/{token}/reject
 * 
 * NOTE: Creating group invitations requires system admin role (ADMIN/SUPER_ADMIN).
 * Use adminApi.createGroupInvitation() instead of createTargeted().
 */
export const groupInvitationsApi = {
  /**
   * Deprecated legacy create endpoint (kept for backward compatibility)
   */
  create: async (
    data: CreateGroupInvitationRequest
  ): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.post('/group-invitations', data);
    return response.data;
  },

  /**
   * Create a targeted invitation for a specific group
   * @deprecated This endpoint requires admin permissions and may return 500/403 errors.
   * Use adminApi.createGroupInvitation() instead, which requires system admin role.
   * Only system admins (ADMIN/SUPER_ADMIN) can create group invitations.
   */
  createTargeted: async (
    groupId: string,
    data: { email?: string; userId?: string; expiresAt?: string; maxUses?: number }
  ): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.post(`/groups/${groupId}/invitations/targeted`, data);
    return response.data;
  },

  /**
   * List invitations for a specific group (admin/system admin only)
   */
  listByGroup: async (
    groupId: string,
    pageable?: Pageable
  ): Promise<ApiResponse<Page<GroupInvitationResponse>>> => {
    const response = await apiClient.instance.get(`/groups/${groupId}/invitations`, { params: pageable });
    return response.data;
  },

  /**
   * List pending invitations for the current user
   */
  listMine: async (): Promise<ApiResponse<GroupInvitationResponse[] | Page<GroupInvitationResponse>>> => {
    const response = await apiClient.instance.get('/invitations/me');
    return response.data;
  },

  /**
   * Accept invitation by token
   */
  acceptByToken: async (token: string): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.post(`/invitations/${token}/accept`);
    return response.data;
  },

  /**
   * Reject invitation by token
   */
  rejectByToken: async (token: string): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.post(`/invitations/${token}/reject`);
    return response.data;
  },
};