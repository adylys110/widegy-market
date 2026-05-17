import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@prisma/client'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { loginSchema } from '@/lib/validations/auth'

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        // Actual user lookup dilakukan di auth.ts (non-edge)
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/seller') ||
        nextUrl.pathname.startsWith('/affiliator') ||
        nextUrl.pathname.startsWith('/admin')

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl.origin))
      }

      return true
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id ?? ''
        token.role = (user as any).role
        token.image = user.image ?? null
      }
      // Handle session.update() — misalnya setelah upgrade role
      if (trigger === 'update' && session?.role) {
        token.role = session.role
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.image = (token.image as string) ?? session.user.image
      }
      return session
    },
  },
} satisfies NextAuthConfig
