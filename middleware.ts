import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from '@/config';
import { roleRoutes, defaultRouteByRole } from '@/lib/roleRoutes';

/**
 * Normalize user role to match keys in roleRoutes
 */
function normalizeRole(role: string | undefined | null): string | null {
  if (!role) return null;
  const lower = role.toLowerCase();
  if (lower === 'admin') return 'Admin';
  if (lower === 'inventory') return 'Inventory';
  if (lower === 'sales') return 'sales'; // lowercase to match your roleRoutes
  return null;
}

/**
 * Extract locale from path
 */
function getLocaleFromPath(pathname: string): string | null {
  const pathnameSegments = pathname.split('/');
  const firstSegment = pathnameSegments[1];
  return locales.includes(firstSegment) ? firstSegment : null;
}

/**
 * Check if route is allowed for a specific role
 */
function isRouteAllowed(pathname: string, role: string): boolean {
  const allowedRoutes = roleRoutes[role] || [];

  return allowedRoutes.some(route => {
    // Wildcard: allow everything
    if (route === "*") return true;

    // Exact match
    if (route === pathname) return true;

    // Match prefix (if you intentionally allow all subpaths)
    if (pathname.startsWith(route) && !route.includes(":")) return true;

    // Handle dynamic routes like /en/dashboard/edit-user/:id
    if (route.includes(":")) {
      const pattern = "^" + route
              .replace(/:[^/]+/g, "[^/]+") // Replace :id with a regex
              .replace(/\//g, "\\/")       // Escape slashes
          + "$";
      return new RegExp(pattern).test(pathname);
    }

    return false;
  });
}

export default async function middleware(request: NextRequest) {
  const config = request.cookies.get('config');
  let isRtl = false;

  try {
    isRtl = config ? JSON.parse(config.value || '{}').isRtl : false;
  } catch (_) {
    isRtl = false;
  }

  const preferredLocale = isRtl ? 'ar' : 'en';
  const headerLocale = request.headers.get('dashcode-locale');
  const defaultLocale = headerLocale && locales.includes(headerLocale) ? headerLocale : preferredLocale;

  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  const { pathname } = request.nextUrl;
  const urlLocale = getLocaleFromPath(pathname);
  const currentLocale = urlLocale || defaultLocale;

  // Auth
  const token = request.cookies.get('authToken')?.value;
  const rawUserRole = request.cookies.get('userRole')?.value;
  const userRole = normalizeRole(rawUserRole);
  const userId = request.cookies.get('userId')?.value;

  // Redirect from root
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Redirect locale-only path if authenticated
  if (urlLocale && pathname === `/${urlLocale}` && token && userRole && userId) {
    const defaultRoute = defaultRouteByRole[userRole];
    if (defaultRoute) {
      return NextResponse.redirect(new URL(`/${currentLocale}${defaultRoute}`, request.url));
    }
  }

  // Role-based access control
  if (token && userRole) {
    try {
      if (userRole === 'Admin') {
        const response = await intlMiddleware(request);
        response.headers.set('dashcode-locale', currentLocale);
        return response;
      }

      if (!isRouteAllowed(pathname, userRole)) {
        return NextResponse.redirect(new URL(`/${currentLocale}/`, request.url));
      }
    } catch (_) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }
  }

  // Default: apply i18n middleware
  const response = await intlMiddleware(request);
  response.headers.set('dashcode-locale', currentLocale);
  return response;
}

// Updated config to exclude static assets
export const config = {
  matcher: [
    // Exclude static files and assets
    '/((?!api|_next/static|_next/image|_next/scripts|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|eot|pdf|zip|rar|7z|mp4|mp3|avi|mov|wmv|flv|webm|ogg|wav)$).*)',
  ],
};