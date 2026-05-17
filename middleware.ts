import NextAuth from 'next-auth'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req

  const isLoggedIn = !!session?.user
  const userRole = (session?.user as any)?.role
  const pathname = nextUrl.pathname

  // ─────────────────────────────────────────────
  // Redirect authenticated users from auth pages
  // ─────────────────────────────────────────────
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return Response.redirect(
      new URL(getDashboardByRole(userRole), nextUrl)
    )
  }

  // ─────────────────────────────────────────────
  // Main dashboard redirect by role
  // ─────────────────────────────────────────────
  if (pathname === '/dashboard') {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl))
    }

    // Hanya ADMIN yang tidak boleh di /dashboard → arahkan ke admin panel
    // BUYER, SELLER, AFFILIATOR semua boleh akses /dashboard (buyer mode)
    if (userRole === 'ADMIN') {
      return Response.redirect(new URL('/admin/dashboard', nextUrl))
    }

    // Semua role non-admin: biarkan masuk buyer dashboard
    return
  }

  // ─────────────────────────────────────────────
  // Admin routes
  // ─────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl))
    }

    if (userRole !== 'ADMIN') {
      return Response.redirect(
        new URL(getDashboardByRole(userRole), nextUrl)
      )
    }
  }

  // ─────────────────────────────────────────────
  // Seller routes
  // ─────────────────────────────────────────────
  if (pathname.startsWith('/seller')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl))
    }

    if (!['SELLER', 'ADMIN'].includes(userRole)) {
      return Response.redirect(
        new URL(getDashboardByRole(userRole), nextUrl)
      )
    }
  }

  // ─────────────────────────────────────────────
  // Affiliator routes
  // ─────────────────────────────────────────────
  if (pathname.startsWith('/affiliator')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl))
    }

    const isSetupPage = pathname === '/affiliator/setup'

    if (isSetupPage) {
      if (!['BUYER', 'SELLER', 'AFFILIATOR', 'ADMIN'].includes(userRole)) {
        return Response.redirect(
          new URL(getDashboardByRole(userRole), nextUrl)
        )
      }
    } else {
      if (!['AFFILIATOR', 'SELLER', 'ADMIN'].includes(userRole)) {
        return Response.redirect(
          new URL(getDashboardByRole(userRole), nextUrl)
        )
      }
    }
  }

  // ─────────────────────────────────────────────
  // Buyer protected routes
  // ─────────────────────────────────────────────
  const buyerProtectedRoutes = [
    '/cart',
    '/orders',
    '/wishlist',
    '/profile',
    '/checkout',
    '/browse',
    '/dashboard',
  ]

  const isBuyerRoute = buyerProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isBuyerRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/login', nextUrl))
    }

    // Hanya ADMIN yang tidak boleh masuk buyer pages
    if (userRole === 'ADMIN') {
      return Response.redirect(new URL('/admin/dashboard', nextUrl))
    }
  }

  return
})

function getDashboardByRole(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'SELLER':
      return '/seller/dashboard'
    case 'AFFILIATOR':
      return '/affiliator/dashboard'
    default:
      return '/dashboard'
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/seller/:path*',
    '/affiliator/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/browse/:path*',
    '/login',
    '/register',
  ],
}
