export interface CategoryResponse {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  groupId: string;
  groupName?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  groupId: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

