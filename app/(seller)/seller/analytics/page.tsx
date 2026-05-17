import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerAnalyticsClient } from '@/components/seller/SellerAnalyticsClient'

export const metadata = { title: 'Analitik - Widegy Seller' }

async function getAnalyticsData(userId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } })
  if (!sellerProfile) return null

  const sellerId = sellerProfile.id

  const [
    monthlySales,
    productPerformance,
    categoryRevenue,
    recentOrders,
  ] = await Promise.all([
    // Monthly revenue + orders (12 bulan)
    prisma.$queryRaw<{ month: string; year: number; revenue: number; orders: number }[]>`
      SELECT 
        TO_CHAR(o."createdAt", 'Mon') as month,
        EXTRACT(YEAR FROM o."createdAt")::int as year,
        COALESCE(SUM(oi.price * oi.quantity), 0)::float as revenue,
        COUNT(DISTINCT o.id)::int as orders
      FROM orders o
      JOIN order_items oi ON oi."orderId" = o.id
      JOIN products p ON p.id = oi."productId"
      WHERE p."sellerId" = ${sellerId}
        AND o.status IN ('COMPLETED', 'PAID')
        AND o."createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(o."createdAt", 'Mon'), EXTRACT(YEAR FROM o."createdAt"), DATE_TRUNC('month', o."createdAt")
      ORDER BY DATE_TRUNC('month', o."createdAt") ASC
    `,

    // Product performance
    prisma.product.findMany({
      where: { sellerId },
      orderBy: { totalSales: 'desc' },
      take: 10,
      select: {
        id: true, title: true, thumbnail: true, category: true,
        price: true, totalSales: true, totalViews: true, rating: true, ratingCount: true,
      },
    }),

    // Revenue by category
    prisma.$queryRaw<{ category: string; revenue: number; count: number }[]>`
      SELECT 
        p.category,
        COALESCE(SUM(oi.price * oi.quantity), 0)::float as revenue,
        COUNT(DISTINCT oi.id)::int as count
      FROM products p
      JOIN order_items oi ON oi."productId" = p.id
      JOIN orders o ON o.id = oi."orderId"
      WHERE p."sellerId" = ${sellerId}
        AND o.status IN ('COMPLETED', 'PAID')
      GROUP BY p.category
      ORDER BY revenue DESC
    `,

    // Recent 20 orders
    prisma.order.findMany({
      where: {
        orderItems: { some: { product: { sellerId } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          where: { product: { sellerId } },
          include: { product: { select: { title: true, thumbnail: true } } },
        },
        payment: { select: { status: true, paymentMethod: true } },
      },
    }),
  ])

  // Aggregate stats
  const totalRevenue = monthlySales.reduce((sum, m) => sum + m.revenue, 0)
  const totalOrders = monthlySales.reduce((sum, m) => sum + m.orders, 0)
  const prevMonthRevenue = monthlySales.at(-2)?.revenue ?? 0
  const currMonthRevenue = monthlySales.at(-1)?.revenue ?? 0
  const revenueGrowth = prevMonthRevenue > 0
    ? ((currMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    : 0

  return {
    sellerProfile,
    monthlySales,
    productPerformance,
    categoryRevenue,
    recentOrders,
    totalRevenue,
    totalOrders,
    revenueGrowth,
    currMonthRevenue,
  }
}

export default async function SellerAnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getAnalyticsData(session.user.id)
  if (!data) redirect('/seller/setup')

  return <SellerAnalyticsClient data={data} />
}
