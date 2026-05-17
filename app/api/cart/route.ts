export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/cart â€” ambil semua cart items milik user
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
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

  return NextResponse.json({ items })
}

// POST /api/cart â€” tambah item ke cart
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId diperlukan' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId, quantity: 1 },
    update: { quantity: { increment: 1 } },
  })

  return NextResponse.json({ item }, { status: 201 })
}

// DELETE /api/cart â€” hapus semua cart items
export async function DELETE() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ message: 'Keranjang dikosongkan' })
}

