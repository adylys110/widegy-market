import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id] — detail satu order
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
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

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

  return NextResponse.json({ order })
}
