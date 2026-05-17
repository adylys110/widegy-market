import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient'

export const metadata = { title: 'Kelola Pesanan - Admin Widegy' }

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { select: { id: true } },
      },
    }),
    prisma.order.count(),
  ])

  return <AdminOrdersClient data={{ orders, total }} />
}
