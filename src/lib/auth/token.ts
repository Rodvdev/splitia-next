const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// JWT payload interface
interface JWTPayload {
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[];
  userRole?: string;
  [key: string]: unknown;
}

// Decode JWT token (client-side)
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Handle base64url encoding (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

// Get user role from token
export function getUserRole(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // Check common JWT claim names for role
  return payload.role || payload.roles?.[0] || payload.userRole || null;
}

// Check if user is admin
export function isAdmin(token: string | null): boolean {
  const role = getUserRole(token);
  if (!role) return false;
  
  const normalizedRole = role.toUpperCase();
  return ['ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'].includes(normalizedRole);
}

// Set cookie helper
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Remove cookie helper
function removeCookie(name: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set in cookie for server-side access (proxy.ts)
  setCookie(TOKEN_KEY, token, 7);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  removeCookie(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  // Also set in cookie for server-side access
  setCookie(REFRESH_TOKEN_KEY, token, 30);
}

export function removeRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeRefreshToken();
}

