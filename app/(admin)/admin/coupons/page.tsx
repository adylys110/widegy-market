import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminCouponsClient } from '@/components/admin/AdminCouponsClient'

export const metadata = { title: 'Kelola Kupon - Admin Widegy' }

export default async function AdminCouponsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <AdminCouponsClient data={{ coupons }} />
}
