import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'
import authConfig from './auth.config'

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true, name: true, email: true, image: true,
            password: true, role: true, isBanned: true,
            bannedReason: true, bannedUntil: true, isActive: true,
          },
        })

        if (!user || !user.password) return null

        // Cek apakah ban sudah expired → auto-unban
        if (user.isBanned && user.bannedUntil && user.bannedUntil < new Date()) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isBanned: false, bannedReason: null, bannedUntil: null },
          })
          // Lanjut login normal
        } else if (user.isBanned) {
          // Masih banned: lempar error dengan info ban
          const until = user.bannedUntil
            ? user.bannedUntil.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'permanen'
          throw new Error(`AccountBanned:${until}:${user.bannedReason ?? 'Melanggar ketentuan'}`)
        }

        if (!user.isActive) throw new Error('AccountInactive')

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      // Auto-create BuyerProfile saat user baru register via OAuth
      await prisma.buyerProfile.create({
        data: { userId: user.id! },
      })
    },
  },
})
