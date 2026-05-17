import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AffiliatorDashboardClient } from '@/components/affiliator/AffiliatorDashboardClient'

export const metadata = { title: 'Affiliator Dashboard - Widegy' }

async function getAffiliatorDashboardData(userId: string) {
  const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
    include: {
      affiliateLinks: {
        include: {
          product: {
            select: { id: true, title: true, thumbnail: true, price: true, category: true },
          },
        },
        orderBy: { clicks: 'desc' },
        take: 5,
      },
    },
  })

  if (!affiliatorProfile) return null

  const affiliatorId = affiliatorProfile.id

  const [commissions, clicksThisMonth, recentCommissions] = await Promise.all([
    // Aggregate commissions
    prisma.affiliateCommission.groupBy({
      by: ['status'],
      where: { affiliatorId },
      _sum: { amount: true },
      _count: { id: true },
    }),

    // Clicks this month
    prisma.affiliateLinkClick.count({
      where: {
        link: { affiliatorId },
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),

    // Recent 5 commissions
    prisma.affiliateCommission.findMany({
      where: { affiliatorId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        product: { select: { title: true, thumbnail: true } },
        order: { select: { orderNumber: true, createdAt: true } },
      },
    }),
  ])

  // Monthly earnings (6 months)
  const monthlyEarnings = await prisma.$queryRaw<
    { month: string; earnings: number; conversions: number }[]
  >`
    SELECT 
      TO_CHAR(ac."createdAt", 'Mon') as month,
      COALESCE(SUM(ac.amount), 0)::float as earnings,
      COUNT(ac.id)::int as conversions
    FROM affiliate_commissions ac
    WHERE ac."affiliatorId" = ${affiliatorId}
      AND ac."createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(ac."createdAt", 'Mon'), DATE_TRUNC('month', ac."createdAt")
    ORDER BY DATE_TRUNC('month', ac."createdAt") ASC
  `

  const commissionMap = commissions.reduce((acc: any, c) => {
    acc[c.status] = { amount: c._sum.amount ?? 0, count: c._count.id }
    return acc
  }, {})

  const pendingEarnings = commissionMap['PENDING']?.amount ?? 0
  const approvedEarnings = commissionMap['APPROVED']?.amount ?? 0
  const completedEarnings = commissionMap['COMPLETED']?.amount ?? 0
  const totalCommissions = commissions.reduce((s, c) => s + (c._sum.amount ?? 0), 0)

  return {
    affiliatorProfile,
    balance: affiliatorProfile.balance,
    totalEarnings: affiliatorProfile.totalEarnings,
    totalClicks: affiliatorProfile.totalClicks,
    totalConversions: affiliatorProfile.totalConversions,
    commissionRate: affiliatorProfile.commissionRate,
    pendingEarnings,
    approvedEarnings,
    completedEarnings,
    totalCommissions,
    clicksThisMonth,
    monthlyEarnings,
    topLinks: affiliatorProfile.affiliateLinks,
    recentCommissions,
    status: affiliatorProfile.status,
  }
}

export default async function AffiliatorDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  // SELLER yang punya affiliatorProfile juga boleh akses
  if (!['AFFILIATOR', 'SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getAffiliatorDashboardData(session.user.id)
  if (!data) redirect('/affiliator/setup')
  if (data.status === 'PENDING') {
    // Still show dashboard but with pending notice
  }

  return <AffiliatorDashboardClient data={data} user={session.user} />
}
