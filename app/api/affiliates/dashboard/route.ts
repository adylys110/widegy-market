export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/affiliates/dashboard â€” statistik & data dashboard affiliator
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profil affiliator tidak ditemukan' }, { status: 404 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Komisi bulan ini
    const [
      commissionsThisMonth,
      commissionsLastMonth,
      totalCommissions,
      recentCommissions,
      affiliateLinks,
      withdrawals,
    ] = await Promise.all([
      prisma.affiliateCommission.aggregate({
        where: {
          affiliatorId: profile.id,
          createdAt: { gte: startOfMonth },
          status: { in: ['APPROVED', 'PENDING'] },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.affiliateCommission.aggregate({
        where: {
          affiliatorId: profile.id,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { in: ['APPROVED', 'PENDING'] },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.affiliateCommission.aggregate({
        where: { affiliatorId: profile.id },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.affiliateCommission.findMany({
        where: { affiliatorId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          product: { select: { title: true, thumbnail: true, category: true } },
          order: { select: { orderNumber: true, createdAt: true } },
        },
      }),
      prisma.affiliateLink.findMany({
        where: { affiliatorId: profile.id },
        orderBy: { clicks: 'desc' },
        take: 5,
        include: {
          product: { select: { id: true, title: true, thumbnail: true, price: true, category: true } },
        },
      }),
      prisma.withdrawal.findMany({
        where: { affiliatorId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Clicks bulan ini dari affiliate_link_clicks
    const clicksThisMonth = await prisma.affiliateLinkClick.count({
      where: {
        link: { affiliatorId: profile.id },
        createdAt: { gte: startOfMonth },
      },
    })

    const stats = {
      balance: profile.balance,
      totalEarnings: profile.totalEarnings,
      totalClicks: profile.totalClicks,
      totalConversions: profile.totalConversions,
      commissionRate: profile.commissionRate,
      status: profile.status,
      referralCode: profile.referralCode,
      earningsThisMonth: commissionsThisMonth._sum.amount ?? 0,
      earningsLastMonth: commissionsLastMonth._sum.amount ?? 0,
      conversionsThisMonth: commissionsThisMonth._count.id,
      clicksThisMonth,
      totalCommissionsCount: totalCommissions._count.id,
    }

    return NextResponse.json({
      profile,
      stats,
      recentCommissions,
      topLinks: affiliateLinks,
      recentWithdrawals: withdrawals,
    })
  } catch (e: any) {
    console.error('[GET /api/affiliates/dashboard]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

