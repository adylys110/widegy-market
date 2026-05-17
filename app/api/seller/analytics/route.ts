import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/seller/analytics
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['SELLER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? '30'
    const days = parseInt(period)

    const sellerId = sellerProfile.id
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [revenue, orders, topProducts, recentReviews] = await Promise.all([
      prisma.orderItem.aggregate({
        where: {
          product: { sellerId },
          order: { status: { in: ['COMPLETED', 'PAID'] }, createdAt: { gte: since } },
        },
        _sum: { price: true },
        _count: { id: true },
      }),
      prisma.order.count({
        where: {
          orderItems: { some: { product: { sellerId } } },
          status: { in: ['COMPLETED', 'PAID'] },
          createdAt: { gte: since },
        },
      }),
      prisma.product.findMany({
        where: { sellerId },
        orderBy: { totalSales: 'desc' },
        take: 5,
        select: { id: true, title: true, totalSales: true, totalViews: true, price: true },
      }),
      prisma.review.findMany({
        where: { product: { sellerId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, image: true } },
          product: { select: { title: true } },
        },
      }),
    ])

    return NextResponse.json({
      period: days,
      revenue: revenue._sum.price ?? 0,
      orders,
      transactionCount: revenue._count.id,
      topProducts,
      recentReviews,
      balance: sellerProfile.balance,
    })
  } catch (error) {
    console.error('[GET /api/seller/analytics]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
