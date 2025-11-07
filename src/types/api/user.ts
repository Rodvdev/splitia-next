export interface UserResponse {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  currency: string;
  language: string;
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
}

