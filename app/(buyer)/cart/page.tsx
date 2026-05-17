import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CartClient } from '@/components/buyer/CartClient'

export const metadata = { title: 'Keranjang Belanja' }

async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
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
          fileType: true,
          seller: { select: { storeName: true, storeSlug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function CartPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const items = await getCartItems(session.user.id)

  return <CartClient initialItems={items} />
}
