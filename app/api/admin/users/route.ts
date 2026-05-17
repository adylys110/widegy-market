import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search') ?? ''
  const role     = searchParams.get('role') ?? 'ALL'
  const status   = searchParams.get('status') ?? 'ALL'
  const page     = parseInt(searchParams.get('page') ?? '1')
  const perPage  = parseInt(searchParams.get('perPage') ?? '15')
  const limit    = parseInt(searchParams.get('limit') ?? String(perPage))
  const withStats = searchParams.get('stats') === 'true'

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (role !== 'ALL') where.role = role
  if (status === 'ACTIVE') where.isBanned = false
  if (status === 'BANNED') where.isBanned = true

  // ── Basic include for all roles ──────────────────────────────────
  const baseSelect: any = {
    id: true, name: true, email: true, image: true,
    role: true, isActive: true, isBanned: true, createdAt: true,
  }

  // ── Role-specific includes ───────────────────────────────────────
  if (role === 'SELLER') {
    baseSelect.sellerProfile = {
      select: {
        storeName: true, storeSlug: true, isVerified: true,
        totalProducts: true, totalSales: true, totalRevenue: true, balance: true,
      },
    }
  } else if (role === 'AFFILIATOR') {
    baseSelect.affiliatorProfile = {
      select: {
        totalClicks: true, totalConversions: true,
        totalEarnings: true, balance: true,
      },
    }
  } else if (role === 'BUYER') {
    baseSelect._count = { select: { orders: true } }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: baseSelect,
    }),
    prisma.user.count({ where }),
  ])

  // ── Compute aggregated stats if requested ────────────────────────
  let stats: any = null
  if (withStats && role !== 'ALL') {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    if (role === 'BUYER') {
      const [count, newThisMonth, spentAgg] = await Promise.all([
        prisma.user.count({ where: { role: 'BUYER' } }),
        prisma.user.count({ where: { role: 'BUYER', createdAt: { gte: startOfMonth } } }),
        prisma.order.aggregate({
          where: { status: { in: ['COMPLETED', 'PAID'] } },
          _sum: { totalAmount: true },
        }),
      ])
      stats = {
        total: count,
        newThisMonth,
        totalSpent: spentAgg._sum.totalAmount ?? 0,
      }
    } else if (role === 'SELLER') {
      const [count, productAgg, revenueAgg] = await Promise.all([
        prisma.user.count({ where: { role: 'SELLER' } }),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.sellerProfile.aggregate({ _sum: { totalRevenue: true } }),
      ])
      stats = {
        total: count,
        activeProducts: productAgg,
        totalRevenue: revenueAgg._sum.totalRevenue ?? 0,
      }
    } else if (role === 'AFFILIATOR') {
      const [count, clickAgg, earningsAgg] = await Promise.all([
        prisma.user.count({ where: { role: 'AFFILIATOR' } }),
        prisma.affiliatorProfile.aggregate({ _sum: { totalClicks: true } }),
        prisma.affiliatorProfile.aggregate({ _sum: { totalEarnings: true } }),
      ])
      stats = {
        total: count,
        totalClicks: clickAgg._sum.totalClicks ?? 0,
        totalCommission: earningsAgg._sum.totalEarnings ?? 0,
      }
    }
  }

  return NextResponse.json({ users, total, stats })
}
