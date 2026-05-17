import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { BuyerLayout } from '@/components/buyer/BuyerLayout'
import { BannedScreen } from '@/components/shared/BannedScreen'

export default async function BuyerRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Admin tidak boleh di buyer layout sama sekali
  if (session.user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  }

  // Cek status ban dari DB (real-time, bukan dari token cache)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, bannedReason: true, bannedUntil: true },
  })

  if (dbUser?.isBanned) {
    // Cek apakah ban sudah expired
    if (dbUser.bannedUntil && dbUser.bannedUntil < new Date()) {
      // Auto-unban
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isBanned: false, bannedReason: null, bannedUntil: null },
      })
    } else {
      // Masih banned → tampilkan layar ban
      const bannedUntilStr = dbUser.bannedUntil
        ? dbUser.bannedUntil.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          })
        : null
      return <BannedScreen reason={dbUser.bannedReason} bannedUntil={bannedUntilStr} />
    }
  }

  return <BuyerLayout>{children}</BuyerLayout>
}
