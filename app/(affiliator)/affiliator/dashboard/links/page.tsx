import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AffiliatorLinksClient } from '@/components/affiliator/AffiliatorLinksClient'

export const metadata = { title: 'Link Affiliasi - Widegy Affiliator' }

async function getLinksData(userId: string) {
  const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
  })
  if (!affiliatorProfile) return null

  const affiliatorId = affiliatorProfile.id

  const [links, products] = await Promise.all([
    prisma.affiliateLink.findMany({
      where: { affiliatorId },
      include: {
        product: {
          select: {
            id: true, title: true, thumbnail: true, price: true,
            category: true, rating: true, totalSales: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Active products that can be affiliated (not already linked)
    prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        affiliateLinks: {
          none: { affiliatorId },
        },
      },
      select: {
        id: true, title: true, thumbnail: true, price: true,
        category: true, commissionRate: true,
        seller: { select: { storeName: true } },
      },
      orderBy: { totalSales: 'desc' },
      take: 50,
    }),
  ])

  return {
    affiliatorProfile,
    links,
    availableProducts: products,
    referralCode: affiliatorProfile.referralCode,
    commissionRate: affiliatorProfile.commissionRate,
  }
}

export default async function AffiliatorLinksPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['AFFILIATOR', 'SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getLinksData(session.user.id)
  if (!data) redirect('/affiliator/setup')

  return <AffiliatorLinksClient data={data} />
}
