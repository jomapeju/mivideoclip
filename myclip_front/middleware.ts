import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/favicon.ico'];
const ACCESS_COOKIE = 'access_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dejar pasar recursos estáticos y las páginas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Permitir páginas públicas de videos (detalle)
  if (pathname.startsWith('/videos/') && pathname.split('/').length === 3) {
    // /videos/{id}  -> permitir público
    return NextResponse.next();
  }

  // Rutas privadas (dashboard, upload, videos/mine, rankings)
  const PRIVATE_PREFIXES = ['/dashboard', '/upload', '/videos/mine', '/rankings'];
  if (PRIVATE_PREFIXES.some(p => pathname.startsWith(p))) {
    const access = req.cookies.get(ACCESS_COOKIE);
    if (!access) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/videos/mine/:path*', '/rankings/:path*'],
};
