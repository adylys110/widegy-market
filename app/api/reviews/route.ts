export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/reviews â€” submit review produk (harus sudah beli)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, rating, comment } = await req.json()

  if (!productId || !rating) {
    return NextResponse.json({ error: 'productId dan rating diperlukan' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating harus antara 1 dan 5' }, { status: 400 })
  }

  // Pastikan user sudah membeli produk ini
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.user.id, status: 'COMPLETED' },
    },
  })

  if (!hasPurchased) {
    return NextResponse.json(
      { error: 'Kamu harus membeli produk ini terlebih dahulu untuk memberikan ulasan' },
      { status: 403 }
    )
  }

  // Cek sudah review belum
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    // Update review
    const updated = await prisma.review.update({
      where: { id: existing.id },
      data: { rating, comment, isVerified: true },
    })

    // Recalculate product rating
    await recalculateProductRating(productId)

    return NextResponse.json({ review: updated })
  }

  // Buat review baru
  const review = await prisma.review.create({
    data: {
      userId: session.user.id,
      productId,
      rating,
      comment,
      isVerified: true,
    },
  })

  // Recalculate product rating
  await recalculateProductRating(productId)

  // Notifikasi seller
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { title: true, seller: { select: { userId: true } } },
  })

  if (product) {
    await prisma.notification.create({
      data: {
        userId: product.seller.userId,
        type: 'REVIEW',
        title: 'Review Baru! â­',
        message: `Produk "${product.title}" mendapat ulasan ${rating} bintang.`,
        data: { productId, reviewId: review.id },
      },
    })
  }

  return NextResponse.json({ review }, { status: 201 })
}

async function recalculateProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  })

  if (reviews.length === 0) return

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(avg * 10) / 10,
      ratingCount: reviews.length,
    },
  })
}

// GET /api/reviews?productId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 10
  const skip = (page - 1) * limit

  if (!productId) return NextResponse.json({ error: 'productId diperlukan' }, { status: 400 })

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
    prisma.review.count({ where: { productId } }),
  ])

  return NextResponse.json({ reviews, total, totalPages: Math.ceil(total / limit) })
}

