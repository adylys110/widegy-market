import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/cart/[itemId] — hapus satu item dari cart
export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // itemId bisa berupa cartItem.id atau productId
  const item = await prisma.cartItem.findFirst({
    where: {
      OR: [
        { id: params.itemId, userId: session.user.id },
        { productId: params.itemId, userId: session.user.id },
      ],
    },
  })

  if (!item) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

  await prisma.cartItem.delete({ where: { id: item.id } })

  return NextResponse.json({ message: 'Item dihapus dari keranjang' })
}
