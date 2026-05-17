import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OrderDetailClient } from '@/components/buyer/OrderDetailClient'

export const metadata = { title: 'Detail Pesanan' }

async function getOrder(id: string, userId: string) {
  return prisma.order.findFirst({
    where: { id, userId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              category: true,
              slug: true,
              fileType: true,
              fileSize: true,
              seller: { select: { storeName: true, storeSlug: true, storeLogo: true } },
            },
          },
        },
      },
      payment: true,
    },
  })
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const order = await getOrder(params.id, session.user.id)
  if (!order) notFound()

  return <OrderDetailClient order={order} />
}
