import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerSetupClient } from '@/components/seller/SellerSetupClient'

export const metadata = { title: 'Setup Toko - Widegy Seller' }

export default async function SellerSetupPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  // If already setup, redirect to dashboard
  const existing = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
  if (existing) redirect('/seller/dashboard')

  return <SellerSetupClient user={session.user} />
}
