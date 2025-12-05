export type ShareType = "FIXED" | "PERCENTAGE" | "EQUAL";

export interface ShareInput {
  userId: string;
  amount: number;
  type: ShareType;
}

export interface ExpenseRequest {
  amount: number;
  groupId: string;
  paidById: string;
  shares: ShareInput[];
  description?: string;
  currency?: string;
  notes?: string;
  date?: string;
  location?: string;
}

export interface GroupMember {
  id: string;
  name: string;
}