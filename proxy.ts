import { NextRequest, NextResponse } from 'next/server';

// JWT payload interface
interface JWTPayload {
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[];
  userRole?: string;
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
  [key: string]: unknown;
}

// Decode JWT token without verification (for middleware)
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Handle base64url encoding (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return false; // If no exp claim, assume not expired
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  return Date.now() >= expirationTime;
}

// Check if token is valid (exists, can be decoded, and optionally not expired)
function isTokenValid(token: string, checkExpiration: boolean = true): boolean {
  if (!token || token.trim() === '') return false;
  
  const payload = decodeJWT(token);
  if (!payload) return false; // Cannot decode token
  
  // If checkExpiration is true, verify token is not expired
  if (checkExpiration && isTokenExpired(token)) {
    return false;
  }
  
  return true;
}

// Get token from request (cookies or Authorization header)
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const token = request.cookies.get('auth_token')?.value;
  if (token) {
    return token;
  }
  
  return null;
}

// Check if user has a valid session (token or refreshToken)
function hasValidSession(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // If there's a token that can be decoded, user has a session
  if (token && isTokenValid(token, false)) {
    return true;
  }
  
  // If there's a refreshToken, user has a session (even if token expired)
  if (refreshToken) {
    return true;
  }
  
  return false;
}

// Get user role from token
function getUserRole(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  // Check common JWT claim names for role
  return payload.role || payload.roles?.[0] || payload.userRole || null;
}

// Map role to admin route
function getAdminRouteForRole(role: string | null): string {
  if (!role) return '/admin';
  
  const normalizedRole = role.toUpperCase();
  
  // Map roles to their admin routes
  switch (normalizedRole) {
    case 'SUPER_ADMIN':
    case 'SUPERADMIN':
      return '/admin';
    case 'ADMIN':
      return '/admin';
    case 'SUPPORT_AGENT':
    case 'SUPPORT':
      return '/admin/support';
    case 'DEVELOPER':
    case 'DEV':
      return '/admin/dev';
    default:
      // Default to main admin route
      return '/admin';
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only process admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Check if user has a valid session (token or refreshToken)
  // This is more permissive - we allow access if there's any indication of a session
  // The client-side will handle token refresh if needed
  if (!hasValidSession(request)) {
    // No session found at all, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User has a session (token or refreshToken), allow access
  // Get token to determine role (if available)
  const token = getTokenFromRequest(request);
  const role = token ? getUserRole(token) : null;
  
  // Get the appropriate admin route for this role
  const adminRoute = getAdminRouteForRole(role);
  
  // If user is already on their correct admin route, continue
  if (pathname === adminRoute || pathname.startsWith(adminRoute + '/')) {
    return NextResponse.next();
  }
  
  // Redirect to role-specific admin route
  const redirectUrl = new URL(adminRoute, request.url);
  return NextResponse.redirect(redirectUrl);
}

