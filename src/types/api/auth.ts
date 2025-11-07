import { UserResponse } from './user';

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

