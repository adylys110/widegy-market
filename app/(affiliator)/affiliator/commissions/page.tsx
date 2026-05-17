import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AffiliatorCommissionsClient } from '@/components/affiliator/AffiliatorCommissionsClient'

export const metadata = { title: 'Komisi - Widegy Affiliator' }

async function getCommissionsData(userId: string) {
  const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
  })
  if (!affiliatorProfile) return null

  const affiliatorId = affiliatorProfile.id

  const [commissions, summary] = await Promise.all([
    prisma.affiliateCommission.findMany({
      where: { affiliatorId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { title: true, thumbnail: true, category: true } },
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    }),

    prisma.affiliateCommission.groupBy({
      by: ['status'],
      where: { affiliatorId },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ])

  const summaryMap = summary.reduce((acc: any, s) => {
    acc[s.status] = { amount: s._sum.amount ?? 0, count: s._count.id }
    return acc
  }, {})

  return {
    affiliatorProfile,
    commissions,
    summaryMap,
    totalEarnings: affiliatorProfile.totalEarnings,
    balance: affiliatorProfile.balance,
  }
}

export default async function AffiliatorCommissionsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['AFFILIATOR', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getCommissionsData(session.user.id)
  if (!data) redirect('/affiliator/setup')

  return <AffiliatorCommissionsClient data={data} />
}
