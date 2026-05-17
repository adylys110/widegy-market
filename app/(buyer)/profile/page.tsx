import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProfileClient } from '@/components/buyer/ProfileClient'

export const metadata = { title: 'Profil Saya' }

async function getProfile(userId: string) {
  const [user, buyerProfile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.buyerProfile.findUnique({
      where: { userId },
      select: {
        totalOrders: true,
        totalSpent: true,
        loyaltyPoints: true,
      },
    }),
  ])
  return { user, buyerProfile }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { user, buyerProfile } = await getProfile(session.user.id)
  if (!user) redirect('/login')

  return <ProfileClient user={user} profile={buyerProfile} />
}
