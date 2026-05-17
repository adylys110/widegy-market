import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerSettingsClient } from '@/components/seller/SellerSettingsClient'

export const metadata = { title: 'Pengaturan Toko - Widegy Seller' }

export default async function SellerSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!sellerProfile) redirect('/seller/setup')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, bio: true, image: true },
  })

  return <SellerSettingsClient sellerProfile={sellerProfile} user={user} />
}
