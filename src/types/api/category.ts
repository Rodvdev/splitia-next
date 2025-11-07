export interface CategoryResponse {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

