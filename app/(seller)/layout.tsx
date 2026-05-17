import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { BannedScreen } from '@/components/shared/BannedScreen'

export default async function SellerRootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  // Cek status ban real-time dari DB
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBanned: true, bannedReason: true, bannedUntil: true },
  })

  if (dbUser?.isBanned) {
    if (dbUser.bannedUntil && dbUser.bannedUntil < new Date()) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { isBanned: false, bannedReason: null, bannedUntil: null },
      })
    } else {
      const bannedUntilStr = dbUser.bannedUntil
        ? dbUser.bannedUntil.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : null
      return <BannedScreen reason={dbUser.bannedReason} bannedUntil={bannedUntilStr} />
    }
  }

  return <SellerLayout>{children}</SellerLayout>
}
