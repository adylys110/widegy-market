import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CheckoutClient } from '@/components/buyer/CheckoutClient'

export const metadata = { title: 'Checkout' }

async function getCheckoutData(userId: string) {
  const cartItems = await prisma.cartItem.findMany({
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

  return { cartItems }
}

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { cartItems } = await getCheckoutData(session.user.id)
  if (cartItems.length === 0) redirect('/cart')

  return <CheckoutClient cartItems={cartItems} user={session.user} />
}
