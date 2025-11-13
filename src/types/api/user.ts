export interface UserResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  currency: string;
  language: string;
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  dateFormat?: string;
  timeFormat?: '24H' | '12H';
  role?: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  lastName?: string;
  phoneNumber?: string;
  image?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesRequest {
  currency?: string;
  language?: string;
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  dateFormat?: string;
  timeFormat?: '24H' | '12H';
}

// Admin types
export interface CreateUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
  currency?: string;
  language?: string;
}

export interface UpdateUserRequest {
  name?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
  role?: string;
  currency?: string;
  language?: string;
}

