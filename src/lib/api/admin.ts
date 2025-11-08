import { apiClient } from './client';
import {
  ApiResponse,
  Page,
  Pageable,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GroupResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  ExpenseResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseShareResponse,
  ExpenseShareRequest,
  UpdateExpenseShareRequest,
  BudgetResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ConversationResponse,
  CreateConversationRequest,
  UpdateConversationRequest,
  MessageResponse,
  SendMessageRequest,
  UpdateMessageRequest,
  SettlementResponse,
  CreateSettlementRequest,
  UpdateSettlementRequest,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SupportTicketResponse,
  CreateSupportTicketRequest,
  UpdateSupportTicketRequest,
  GroupInvitationResponse,
  GroupUserResponse,
  PlanResponse,
  TaskResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskTagResponse,
  CreateTaskTagRequest,
  UpdateTaskTagRequest,
} from '@/types';

export const adminApi = {
  // Users
  getAllUsers: async (pageable?: Pageable): Promise<ApiResponse<Page<UserResponse>>> => {
    const response = await apiClient.instance.get('/admin/users', { params: pageable });
    return response.data;
  },
  getUserById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (data: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.post('/admin/users', data);
    return response.data;
  },
  updateUser: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.instance.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Groups
  getAllGroups: async (pageable?: Pageable): Promise<ApiResponse<Page<GroupResponse>>> => {
    const response = await apiClient.instance.get('/admin/groups', { params: pageable });
    return response.data;
  },
  getGroupById: async (id: string): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.get(`/admin/groups/${id}`);
    return response.data;
  },
  createGroup: async (data: CreateGroupRequest): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.post('/admin/groups', data);
    return response.data;
  },
  updateGroup: async (id: string, data: UpdateGroupRequest): Promise<ApiResponse<GroupResponse>> => {
    const response = await apiClient.instance.put(`/admin/groups/${id}`, data);
    return response.data;
  },
  deleteGroup: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/groups/${id}`);
    return response.data;
  },

  // Expenses
  getAllExpenses: async (pageable?: Pageable): Promise<ApiResponse<Page<ExpenseResponse>>> => {
    const response = await apiClient.instance.get('/admin/expenses', { params: pageable });
    return response.data;
  },
  getExpenseById: async (id: string): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.get(`/admin/expenses/${id}`);
    return response.data;
  },
  createExpense: async (data: CreateExpenseRequest): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.post('/admin/expenses', data);
    return response.data;
  },
  updateExpense: async (id: string, data: UpdateExpenseRequest): Promise<ApiResponse<ExpenseResponse>> => {
    const response = await apiClient.instance.put(`/admin/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/expenses/${id}`);
    return response.data;
  },

  // Expense Shares
  getAllExpenseShares: async (pageable?: Pageable): Promise<ApiResponse<Page<ExpenseShareResponse>>> => {
    const response = await apiClient.instance.get('/admin/expense-shares', { params: pageable });
    return response.data;
  },
  getExpenseShareById: async (id: string): Promise<ApiResponse<ExpenseShareResponse>> => {
    const response = await apiClient.instance.get(`/admin/expense-shares/${id}`);
    return response.data;
  },
  createExpenseShare: async (data: ExpenseShareRequest): Promise<ApiResponse<ExpenseShareResponse>> => {
    const response = await apiClient.instance.post('/admin/expense-shares', data);
    return response.data;
  },
  updateExpenseShare: async (
    id: string,
    data: UpdateExpenseShareRequest
  ): Promise<ApiResponse<ExpenseShareResponse>> => {
    const response = await apiClient.instance.put(`/admin/expense-shares/${id}`, data);
    return response.data;
  },
  deleteExpenseShare: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/expense-shares/${id}`);
    return response.data;
  },

  // Budgets
  getAllBudgets: async (pageable?: Pageable): Promise<ApiResponse<Page<BudgetResponse>>> => {
    const response = await apiClient.instance.get('/admin/budgets', { params: pageable });
    return response.data;
  },
  getBudgetById: async (id: string): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.get(`/admin/budgets/${id}`);
    return response.data;
  },
  createBudget: async (data: CreateBudgetRequest): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.post('/admin/budgets', data);
    return response.data;
  },
  updateBudget: async (id: string, data: UpdateBudgetRequest): Promise<ApiResponse<BudgetResponse>> => {
    const response = await apiClient.instance.put(`/admin/budgets/${id}`, data);
    return response.data;
  },
  deleteBudget: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/budgets/${id}`);
    return response.data;
  },

  // Categories
  getAllCategories: async (pageable?: Pageable): Promise<ApiResponse<Page<CategoryResponse>>> => {
    const response = await apiClient.instance.get('/admin/categories', { params: pageable });
    return response.data;
  },
  getCategoryById: async (id: string): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.get(`/admin/categories/${id}`);
    return response.data;
  },
  createCategory: async (data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (
    id: string,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<CategoryResponse>> => {
    const response = await apiClient.instance.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // Conversations
  getAllConversations: async (pageable?: Pageable): Promise<ApiResponse<Page<ConversationResponse>>> => {
    const response = await apiClient.instance.get('/admin/conversations', { params: pageable });
    return response.data;
  },
  getConversationById: async (id: string): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.get(`/admin/conversations/${id}`);
    return response.data;
  },
  createConversation: async (
    data: CreateConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.post('/admin/conversations', data);
    return response.data;
  },
  updateConversation: async (
    id: string,
    data: UpdateConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await apiClient.instance.put(`/admin/conversations/${id}`, data);
    return response.data;
  },
  deleteConversation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/conversations/${id}`);
    return response.data;
  },

  // Messages
  getAllMessages: async (pageable?: Pageable): Promise<ApiResponse<Page<MessageResponse>>> => {
    const response = await apiClient.instance.get('/admin/messages', { params: pageable });
    return response.data;
  },
  getMessageById: async (id: string): Promise<ApiResponse<MessageResponse>> => {
    const response = await apiClient.instance.get(`/admin/messages/${id}`);
    return response.data;
  },
  createMessage: async (data: SendMessageRequest): Promise<ApiResponse<MessageResponse>> => {
    // Ensure conversationId is present and not empty
    if (!data.conversationId || data.conversationId.trim() === '') {
      throw new Error('Conversation ID is required');
    }
    // Ensure content is present and not empty
    if (!data.content || data.content.trim() === '') {
      throw new Error('Content is required');
    }
    const response = await apiClient.instance.post('/admin/messages', {
      conversationId: data.conversationId,
      content: data.content,
    });
    return response.data;
  },
  updateMessage: async (id: string, data: UpdateMessageRequest): Promise<ApiResponse<MessageResponse>> => {
    const response = await apiClient.instance.put(`/admin/messages/${id}`, data);
    return response.data;
  },
  deleteMessage: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/messages/${id}`);
    return response.data;
  },

  // Settlements
  getAllSettlements: async (pageable?: Pageable): Promise<ApiResponse<Page<SettlementResponse>>> => {
    const response = await apiClient.instance.get('/admin/settlements', { params: pageable });
    return response.data;
  },
  getSettlementById: async (id: string): Promise<ApiResponse<SettlementResponse>> => {
    const response = await apiClient.instance.get(`/admin/settlements/${id}`);
    return response.data;
  },
  createSettlement: async (data: CreateSettlementRequest): Promise<ApiResponse<SettlementResponse>> => {
    const response = await apiClient.instance.post('/admin/settlements', data);
    return response.data;
  },
  updateSettlement: async (
    id: string,
    data: UpdateSettlementRequest
  ): Promise<ApiResponse<SettlementResponse>> => {
    const response = await apiClient.instance.put(`/admin/settlements/${id}`, data);
    return response.data;
  },
  deleteSettlement: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/settlements/${id}`);
    return response.data;
  },

  // Subscriptions
  getAllSubscriptions: async (pageable?: Pageable): Promise<ApiResponse<Page<SubscriptionResponse>>> => {
    const response = await apiClient.instance.get('/admin/subscriptions', { params: pageable });
    return response.data;
  },
  getSubscriptionById: async (id: string): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.get(`/admin/subscriptions/${id}`);
    return response.data;
  },
  createSubscription: async (
    data: CreateSubscriptionRequest
  ): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.post('/admin/subscriptions', data);
    return response.data;
  },
  updateSubscription: async (
    id: string,
    data: UpdateSubscriptionRequest
  ): Promise<ApiResponse<SubscriptionResponse>> => {
    const response = await apiClient.instance.put(`/admin/subscriptions/${id}`, data);
    return response.data;
  },
  deleteSubscription: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/subscriptions/${id}`);
    return response.data;
  },

  // Support Tickets
  getAllSupportTickets: async (pageable?: Pageable): Promise<ApiResponse<Page<SupportTicketResponse>>> => {
    const response = await apiClient.instance.get('/admin/support-tickets', { params: pageable });
    return response.data;
  },
  getSupportTicketById: async (id: string): Promise<ApiResponse<SupportTicketResponse>> => {
    const response = await apiClient.instance.get(`/admin/support-tickets/${id}`);
    return response.data;
  },
  createSupportTicket: async (
    data: CreateSupportTicketRequest
  ): Promise<ApiResponse<SupportTicketResponse>> => {
    const response = await apiClient.instance.post('/admin/support-tickets', data);
    return response.data;
  },
  updateSupportTicket: async (
    id: string,
    data: UpdateSupportTicketRequest
  ): Promise<ApiResponse<SupportTicketResponse>> => {
    const response = await apiClient.instance.put(`/admin/support-tickets/${id}`, data);
    return response.data;
  },
  deleteSupportTicket: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/support-tickets/${id}`);
    return response.data;
  },

  // Group Invitations
  getAllGroupInvitations: async (pageable?: Pageable): Promise<ApiResponse<Page<GroupInvitationResponse>>> => {
    const response = await apiClient.instance.get('/admin/group-invitations', { params: pageable });
    return response.data;
  },
  getGroupInvitationById: async (id: string): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.get(`/admin/group-invitations/${id}`);
    return response.data;
  },
  createGroupInvitation: async (
    data: { groupId: string; email?: string }
  ): Promise<ApiResponse<GroupInvitationResponse>> => {
    if (!data.groupId) {
      throw new Error('Group ID is required');
    }
    const response = await apiClient.instance.post('/admin/group-invitations', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
  updateGroupInvitation: async (
    id: string,
    data: Partial<GroupInvitationResponse>
  ): Promise<ApiResponse<GroupInvitationResponse>> => {
    const response = await apiClient.instance.put(`/admin/group-invitations/${id}`, data);
    return response.data;
  },
  deleteGroupInvitation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/group-invitations/${id}`);
    return response.data;
  },

  // Group Users
  getAllGroupUsers: async (pageable?: Pageable): Promise<ApiResponse<Page<GroupUserResponse>>> => {
    const response = await apiClient.instance.get('/admin/group-users', { params: pageable });
    return response.data;
  },
  getGroupUserById: async (id: string): Promise<ApiResponse<GroupUserResponse>> => {
    const response = await apiClient.instance.get(`/admin/group-users/${id}`);
    return response.data;
  },
  createGroupUser: async (data: Partial<GroupUserResponse>): Promise<ApiResponse<GroupUserResponse>> => {
    const response = await apiClient.instance.post('/admin/group-users', data);
    return response.data;
  },
  updateGroupUser: async (
    id: string,
    data: Partial<GroupUserResponse>
  ): Promise<ApiResponse<GroupUserResponse>> => {
    const response = await apiClient.instance.put(`/admin/group-users/${id}`, data);
    return response.data;
  },
  deleteGroupUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/group-users/${id}`);
    return response.data;
  },

  // Plans
  getAllPlans: async (pageable?: Pageable): Promise<ApiResponse<Page<PlanResponse>>> => {
    const response = await apiClient.instance.get('/admin/plans', { params: pageable });
    return response.data;
  },
  getPlanById: async (id: string): Promise<ApiResponse<PlanResponse>> => {
    const response = await apiClient.instance.get(`/admin/plans/${id}`);
    return response.data;
  },

  // Tasks
  getAllTasks: async (pageable?: Pageable): Promise<ApiResponse<Page<TaskResponse>>> => {
    const response = await apiClient.instance.get('/admin/tasks', { params: pageable });
    return response.data;
  },
  getTaskById: async (id: string): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.get(`/admin/tasks/${id}`);
    return response.data;
  },
  createTask: async (data: CreateTaskRequest): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.post('/admin/tasks', data);
    return response.data;
  },
  updateTask: async (id: string, data: UpdateTaskRequest): Promise<ApiResponse<TaskResponse>> => {
    const response = await apiClient.instance.put(`/admin/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/tasks/${id}`);
    return response.data;
  },

  // Task Tags
  getAllTaskTags: async (pageable?: Pageable): Promise<ApiResponse<Page<TaskTagResponse>>> => {
    const response = await apiClient.instance.get('/admin/task-tags', { params: pageable });
    return response.data;
  },
  getTaskTagById: async (id: string): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.get(`/admin/task-tags/${id}`);
    return response.data;
  },
  createTaskTag: async (data: CreateTaskTagRequest): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.post('/admin/task-tags', data);
    return response.data;
  },
  updateTaskTag: async (
    id: string,
    data: UpdateTaskTagRequest
  ): Promise<ApiResponse<TaskTagResponse>> => {
    const response = await apiClient.instance.put(`/admin/task-tags/${id}`, data);
    return response.data;
  },
  deleteTaskTag: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.instance.delete(`/admin/task-tags/${id}`);
    return response.data;
  },
};

