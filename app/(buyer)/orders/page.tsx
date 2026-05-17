import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OrdersClient } from '@/components/buyer/OrdersClient'

export const metadata = { title: 'Pesanan Saya' }

async function getOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, title: true, thumbnail: true, category: true, slug: true } },
        },
      },
      payment: { select: { status: true, paymentMethod: true, paidAt: true } },
    },
  })
  return orders
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const orders = await getOrders(session.user.id)

  return <OrdersClient orders={orders} />
}
