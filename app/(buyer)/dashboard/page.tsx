import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/buyer/DashboardClient'

export const metadata = { title: 'Dashboard' }

async function getDashboardData(userId: string) {
  const [orders, wishlistCount, cartCount, recentOrders, sellerProfile, affiliatorProfile] = await Promise.all([
    prisma.order.aggregate({
      where: { userId },
      _count: { id: true },
      _sum: { totalAmount: true },
    }),
    prisma.wishlist.count({ where: { userId } }),
    prisma.cartItem.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        orderItems: {
          include: {
            product: { select: { title: true, thumbnail: true, category: true } },
          },
        },
        payment: { select: { status: true, paymentMethod: true } },
      },
    }),
    prisma.sellerProfile.findUnique({ where: { userId } }),
    prisma.affiliatorProfile.findUnique({ where: { userId } }),
  ])

  return {
    totalOrders: orders._count.id,
    totalSpent: orders._sum.totalAmount ?? 0,
    wishlistCount,
    cartCount,
    recentOrders,
    isSeller: !!sellerProfile,
    isAffiliate: !!affiliatorProfile,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const data = await getDashboardData(session.user.id)

  return <DashboardClient data={data} user={session.user} />
}
