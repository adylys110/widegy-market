import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status, reason } = await req.json()

  const validStatuses = ['ACTIVE', 'REJECTED', 'ARCHIVED', 'DRAFT']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const product = await prisma.product.update({
    where: { id: params.productId },
    data: { status },
    select: { id: true, title: true, status: true, seller: { select: { userId: true } } },
  })

  // Notify seller
  if (product.seller?.userId && (status === 'ACTIVE' || status === 'REJECTED')) {
    const isApproved = status === 'ACTIVE'
    await prisma.notification.create({
      data: {
        userId: product.seller.userId,
        type: 'PRODUCT',
        title: isApproved ? 'Produk Disetujui ✅' : 'Produk Ditolak ❌',
        message: isApproved
          ? `Produk "${product.title}" Anda telah disetujui dan kini aktif di marketplace!`
          : `Produk "${product.title}" ditolak.${reason ? ` Alasan: ${reason}` : ' Silakan periksa kembali konten produk Anda.'}`,
        data: { link: '/seller/products', productId: params.productId },
      },
    }).catch(() => {})
  }

  return NextResponse.json({ product })
}
