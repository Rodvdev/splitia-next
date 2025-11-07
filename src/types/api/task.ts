import { UserResponse } from './user';
import { GroupResponse } from './group';
import { TaskTagResponse } from './task-tag';
import { ExpenseShareRequest } from './expense';

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  position: number;
  group: GroupResponse;
  assignedTo?: UserResponse;
  createdBy: UserResponse;
  tags: TaskTagResponse[];
  createdAt: string;
  updatedAt: string;
  expenseId?: string;
  futureExpenseAmount?: number;
  futureExpenseCurrency?: string;
  futureExpensePaidById?: string;
  futureExpensePaidByName?: string;
  futureExpenseShares?: Array<{ userId: string; amount: number; type: 'EQUAL' | 'PERCENTAGE' | 'FIXED' }>;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  groupId: string;
  assignedToId?: string;
  priority?: TaskPriority;
  startDate?: string;
  dueDate?: string;
  tagIds?: string[];
  expenseId?: string;
  createFutureExpense?: boolean;
  futureExpenseAmount?: number;
  futureExpenseCurrency?: string;
  futureExpensePaidById?: string;
  futureExpenseShares?: ExpenseShareRequest[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  startDate?: string;
  dueDate?: string;
  position?: number;
  tagIds?: string[];
  expenseId?: string;
  createFutureExpense?: boolean;
  futureExpenseAmount?: number;
  futureExpenseCurrency?: string;
  futureExpensePaidById?: string;
  futureExpenseShares?: ExpenseShareRequest[];
}

