import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'

export const metadata = { title: 'Admin Dashboard - Widegy' }

async function getAdminDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalUsers, newUsersThisMonth, usersByRole,
    totalProducts, pendingProducts,
    orderStats, lastMonthRevenue,
    pendingWithdrawals,
    recentOrders, recentWithdrawals,
    topSellers, topProducts,
    monthlyStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.order.aggregate({
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: lastMonth, lte: endOfLastMonth }, status: { in: ['PAID', 'COMPLETED'] } },
      _sum: { totalAmount: true },
    }),
    prisma.withdrawal.aggregate({
      where: { status: 'PENDING' },
      _count: { id: true },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { select: { id: true } },
      },
    }),
    prisma.withdrawal.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        seller: { select: { storeName: true } },
        affiliator: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.sellerProfile.findMany({
      orderBy: { totalRevenue: 'desc' },
      take: 5,
      select: { id: true, storeName: true, totalRevenue: true, totalProducts: true, totalSales: true },
    }),
    prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { totalSales: 'desc' },
      take: 5,
      select: { id: true, title: true, thumbnail: true, totalSales: true, rating: true, price: true },
    }),
    prisma.$queryRaw<{ month: string; revenue: number; orders: number }[]>`
      SELECT
        TO_CHAR(o."createdAt", 'Mon') as month,
        COALESCE(SUM(o."totalAmount"), 0)::float as revenue,
        COUNT(o.id)::int as orders
      FROM orders o
      WHERE o."createdAt" >= NOW() - INTERVAL '6 months'
        AND o.status IN ('PAID', 'COMPLETED')
      GROUP BY TO_CHAR(o."createdAt", 'Mon'), DATE_TRUNC('month', o."createdAt")
      ORDER BY DATE_TRUNC('month', o."createdAt") ASC
    `,
  ])

  const roleMap = usersByRole.reduce((a: any, r) => {
    a[r.role] = r._count.id; return a
  }, {})

  const thisMonthRevenue = orderStats._sum.totalAmount ?? 0
  const lastMonthRev = lastMonthRevenue._sum.totalAmount ?? 0
  const revenueTrend = lastMonthRev > 0 ? ((thisMonthRevenue - lastMonthRev) / lastMonthRev) * 100 : 0

  return {
    totalUsers,
    newUsersThisMonth,
    totalBuyers: roleMap['BUYER'] ?? 0,
    totalSellers: roleMap['SELLER'] ?? 0,
    totalAffiliators: roleMap['AFFILIATOR'] ?? 0,
    totalAdmins: roleMap['ADMIN'] ?? 0,
    totalProducts,
    pendingProducts,
    totalOrders: orderStats._count.id,
    totalRevenue: thisMonthRevenue,
    revenueTrend,
    pendingWithdrawals: pendingWithdrawals._count.id,
    pendingWithdrawalAmount: pendingWithdrawals._sum.amount ?? 0,
    recentOrders,
    recentWithdrawals,
    topSellers,
    topProducts,
    monthlyStats,
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const data = await getAdminDashboardData()
  return <AdminDashboardClient data={data} />
}
