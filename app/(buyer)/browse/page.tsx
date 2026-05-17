import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BrowseClient } from '@/components/buyer/BrowseClient'

export const metadata = { title: 'Jelajahi Produk - Widegy' }

async function getProducts(params: {
  category?: string
  sort?: string
  q?: string
  page?: number
}) {
  const { category, sort = 'popular', q, page = 1 } = params
  const limit = 24
  const skip = (page - 1) * limit

  const where: any = { status: 'ACTIVE' }
  if (category && category !== 'ALL') where.category = category
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
    ]
  }

  const orderBy: any =
    sort === 'popular'
      ? { totalSales: 'desc' }
      : sort === 'newest'
      ? { createdAt: 'desc' }
      : sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : sort === 'rating'
      ? { rating: 'desc' }
      : { totalSales: 'desc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
        totalSales: true,
        fileType: true,
        tags: true,
        seller: {
          select: { storeName: true, storeSlug: true, isVerified: true, storeLogo: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  // Ambil juga wishlist user (untuk tanda heart)
  return { products, total, totalPages: Math.ceil(total / limit) }
}

async function getCategories() {
  const result = await prisma.product.groupBy({
    by: ['category'],
    where: { status: 'ACTIVE' },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
  })
  return result.map((r) => ({ category: r.category, count: r._count.category }))
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string; page?: string }
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const page = parseInt(searchParams.page ?? '1')
  const [{ products, total, totalPages }, categories, wishlistItems] = await Promise.all([
    getProducts({
      category: searchParams.category,
      sort: searchParams.sort,
      q: searchParams.q,
      page,
    }),
    getCategories(),
    prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { productId: true },
    }),
  ])

  const wishlistedIds = new Set(wishlistItems.map((w) => w.productId))

  return (
    <BrowseClient
      products={products}
      categories={categories}
      wishlistedIds={Array.from(wishlistedIds)}
      total={total}
      totalPages={totalPages}
      currentPage={page}
      initialFilters={{
        category: searchParams.category ?? 'ALL',
        sort: searchParams.sort ?? 'popular',
        q: searchParams.q ?? '',
      }}
    />
  )
}
