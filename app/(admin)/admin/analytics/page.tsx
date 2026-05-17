import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminAnalyticsClient } from '@/components/admin/AdminAnalyticsClient'

export const metadata = { title: 'Analitik - Admin Widegy' }

export default async function AdminAnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [monthlyRevenue, userGrowth, categoryStats, paymentMethodStats] = await Promise.all([
    prisma.$queryRaw<{ month: string; revenue: number; orders: number }[]>`
      SELECT TO_CHAR(o."createdAt", 'Mon YYYY') as month,
        COALESCE(SUM(o."totalAmount"), 0)::float as revenue,
        COUNT(o.id)::int as orders
      FROM orders o
      WHERE o."createdAt" >= NOW() - INTERVAL '12 months'
        AND o.status IN ('PAID', 'COMPLETED')
      GROUP BY TO_CHAR(o."createdAt", 'Mon YYYY'), DATE_TRUNC('month', o."createdAt")
      ORDER BY DATE_TRUNC('month', o."createdAt") ASC
    `,
    prisma.$queryRaw<{ month: string; users: number }[]>`
      SELECT TO_CHAR(u."createdAt", 'Mon YYYY') as month,
        COUNT(u.id)::int as users
      FROM users u
      WHERE u."createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(u."createdAt", 'Mon YYYY'), DATE_TRUNC('month', u."createdAt")
      ORDER BY DATE_TRUNC('month', u."createdAt") ASC
    `,
    prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { totalSales: true },
      where: { status: 'ACTIVE' },
      orderBy: { _sum: { totalSales: 'desc' } },
      take: 10,
    }),
    prisma.payment.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
      where: { status: { in: ['SETTLEMENT', 'CAPTURE'] } },
    }),
  ])

  return <AdminAnalyticsClient data={{ monthlyRevenue, userGrowth, categoryStats, paymentMethodStats }} />
}
