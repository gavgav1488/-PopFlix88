import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Получаем текущую сессию
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Публичные маршруты, которые не требуют аутентификации
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Защищённые маршруты, которые требуют аутентификации
  const protectedRoutes = ['/dashboard', '/search', '/movie', '/watched', '/favorites', '/stats', '/onboarding']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Если пользователь не авторизован и пытается попасть на защищённый маршрут
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Если пользователь авторизован и пытается попасть на страницы входа/регистрации
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Если пользователь авторизован и находится на главной странице
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}