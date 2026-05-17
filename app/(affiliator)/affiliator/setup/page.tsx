import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AffiliatorSetupClient } from '@/components/affiliator/AffiliatorSetupClient'

export const metadata = { title: 'Daftar Affiliator - Widegy' }

export default async function AffiliatorSetupPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userRole = session.user.role

  // Hanya BUYER, SELLER, AFFILIATOR yang bisa setup (bukan langsung reject)
  if (userRole === 'ADMIN') redirect('/admin/dashboard')

  // Cek apakah sudah punya affiliatorProfile
  const existing = await prisma.affiliatorProfile.findUnique({
    where: { userId: session.user.id }
  })

  // Kalau sudah punya profil → ke dashboard affiliator
  // Seller dengan affiliatorProfile: redirect ke affiliator dashboard
  if (existing) redirect('/affiliator/dashboard')

  return <AffiliatorSetupClient user={session.user} />
}
