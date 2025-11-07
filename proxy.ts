import { NextRequest, NextResponse } from 'next/server';

// JWT payload interface
interface JWTPayload {
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[];
  userRole?: string;
  [key: string]: unknown;
}

// Decode JWT token without verification (for middleware)
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as JWTPayload;
  } catch {
    return null;
  }
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
  
  // Get token from request
  const token = getTokenFromRequest(request);
  
  if (!token) {
    // No token found, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Decode token and get role
  const role = getUserRole(token);
  
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

