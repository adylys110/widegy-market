import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id] — detail produk by ID (public)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id, status: 'ACTIVE' },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          storeLogo: true,
          isVerified: true,
          totalSales: true,
          rating: true,
        },
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
  }

  // Increment view count
  await prisma.product.update({
    where: { id: params.id },
    data: { totalViews: { increment: 1 } },
  })

  return NextResponse.json({ product })
}
