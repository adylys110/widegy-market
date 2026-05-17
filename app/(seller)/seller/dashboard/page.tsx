import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerDashboardClient } from '@/components/seller/SellerDashboardClient'

export const metadata = { title: 'Seller Dashboard - Widegy' }

async function getSellerDashboardData(userId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        select: { id: true },
      },
    },
  })

  if (!sellerProfile) return null

  const sellerId = sellerProfile.id

  // Get orders for this seller's products
  const [salesData, recentOrders, productStats, topProducts] = await Promise.all([
    // Sales aggregate per bulan (6 bulan terakhir)
    prisma.$queryRaw<{ month: string; total: number; count: number }[]>`
      SELECT 
        TO_CHAR(o."createdAt", 'Mon') as month,
        COALESCE(SUM(oi.price * oi.quantity), 0)::float as total,
        COUNT(DISTINCT o.id)::int as count
      FROM orders o
      JOIN order_items oi ON oi."orderId" = o.id
      JOIN products p ON p.id = oi."productId"
      WHERE p."sellerId" = ${sellerId}
        AND o.status IN ('COMPLETED', 'PAID')
        AND o."createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(o."createdAt", 'Mon'), DATE_TRUNC('month', o."createdAt")
      ORDER BY DATE_TRUNC('month', o."createdAt") ASC
    `,

    // Recent 5 orders
    prisma.order.findMany({
      where: {
        orderItems: { some: { product: { sellerId } } },
        status: { in: ['COMPLETED', 'PAID', 'PROCESSING'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true, image: true } },
        orderItems: {
          where: { product: { sellerId } },
          include: { product: { select: { title: true, thumbnail: true } } },
        },
        payment: { select: { status: true } },
      },
    }),

    // Product stats
    prisma.product.groupBy({
      by: ['status'],
      where: { sellerId },
      _count: { id: true },
    }),

    // Top 5 products by sales
    prisma.product.findMany({
      where: { sellerId },
      orderBy: { totalSales: 'desc' },
      take: 5,
      select: { id: true, title: true, thumbnail: true, totalSales: true, price: true, rating: true, ratingCount: true },
    }),
  ])

  // Hitung total revenue dari order items
  const revenueResult = await prisma.orderItem.aggregate({
    where: {
      product: { sellerId },
      order: { status: { in: ['COMPLETED', 'PAID'] } },
    },
    _sum: { price: true },
    _count: { id: true },
  })

  const productStatusMap = productStats.reduce((acc: any, s) => {
    acc[s.status] = s._count.id
    return acc
  }, {})

  // Cek apakah seller sudah jadi affiliator
  const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
    select: { id: true },
  })

  return {
    sellerProfile,
    totalRevenue: revenueResult._sum.price ?? 0,
    totalSales: revenueResult._count.id,
    balance: sellerProfile.balance,
    activeProducts: productStatusMap['ACTIVE'] ?? 0,
    pendingProducts: productStatusMap['PENDING_REVIEW'] ?? 0,
    draftProducts: productStatusMap['DRAFT'] ?? 0,
    salesData,
    recentOrders,
    topProducts,
    isAffiliate: !!affiliatorProfile,
  }
}

export default async function SellerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getSellerDashboardData(session.user.id)
  if (!data) redirect('/seller/setup')

  return <SellerDashboardClient data={data} user={session.user} />
}
