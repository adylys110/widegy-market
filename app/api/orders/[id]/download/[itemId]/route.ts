import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/orders/[id]/download/[itemId]
// Hanya boleh download kalau order status = COMPLETED dan milik user
export async function GET(
  _req: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pastikan order milik user dan sudah COMPLETED
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id, status: 'COMPLETED' },
    include: {
      orderItems: {
        where: { id: params.itemId },
        include: {
          product: { select: { title: true, downloadUrl: true, fileType: true } },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  }

  const item = order.orderItems[0]
  if (!item) {
    return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })
  }

  const downloadUrl = item.downloadUrl ?? item.product.downloadUrl
  if (!downloadUrl) {
    return NextResponse.json({ error: 'File tidak tersedia' }, { status: 404 })
  }

  // Mark as downloaded
  await prisma.orderItem.update({
    where: { id: item.id },
    data: { downloaded: true },
  })

  // Redirect ke URL download (signed URL dari storage)
  // Untuk production, generate signed URL dari Supabase Storage / S3
  return NextResponse.redirect(downloadUrl)
}
