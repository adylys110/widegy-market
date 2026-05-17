import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { WishlistClient } from '@/components/buyer/WishlistClient'

export const metadata = { title: 'Wishlist Saya' }

async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          price: true,
          discountPrice: true,
          category: true,
          rating: true,
          ratingCount: true,
          totalSales: true,
          seller: { select: { storeName: true, isVerified: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const items = await getWishlist(session.user.id)

  return <WishlistClient initialItems={items} />
}
