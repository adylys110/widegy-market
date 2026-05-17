export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/search?q=xxx&limit=5 â€” autocomplete/search suggestions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '8'), 20)
  const category = searchParams.get('category')

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [], suggestions: [] })
  }

  const where: any = {
    status: 'ACTIVE',
    OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
      { shortDescription: { contains: q, mode: 'insensitive' } },
    ],
  }

  if (category && category !== 'ALL') {
    where.category = category
  }

  const products = await prisma.product.findMany({
    where,
    take: limit,
    orderBy: [{ totalSales: 'desc' }, { rating: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      price: true,
      discountPrice: true,
      category: true,
      rating: true,
      ratingCount: true,
      seller: { select: { storeName: true, isVerified: true } },
    },
  })

  // Tag suggestions dari products yang ditemukan
  const tagSuggestions = new Set<string>()
  const productIds = products.map((p) => p.id)
  const productsWithTags = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { tags: true },
  })
  productsWithTags.forEach((p) => {
    p.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(q.toLowerCase())) {
        tagSuggestions.add(tag)
      }
    })
  })

  return NextResponse.json({
    products,
    suggestions: Array.from(tagSuggestions).slice(0, 5),
    total: products.length,
  })
}

