import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProductDetailClient } from '@/components/buyer/ProductDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, thumbnail: true },
  })
  if (!product) return { title: 'Produk Tidak Ditemukan' }
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
    openGraph: { images: product.thumbnail ? [product.thumbnail] : [] },
  }
}

async function getProductData(slug: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          storeLogo: true,
          storeBanner: true,
          storeDescription: true,
          isVerified: true,
          totalSales: true,
          rating: true,
          user: { select: { createdAt: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  })

  if (!product) return null

  // Cek apakah user sudah punya produk ini (sudah dibeli)
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: product.id,
      order: { userId, status: 'COMPLETED' },
    },
  })

  // Cek wishlist
  const isWishlisted = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId: product.id } },
  })

  // Cek apakah sudah di cart
  const inCart = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId: product.id } },
  })

  // Produk serupa dari kategori yang sama
  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      status: 'ACTIVE',
      id: { not: product.id },
    },
    orderBy: { totalSales: 'desc' },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      price: true,
      discountPrice: true,
      rating: true,
      ratingCount: true,
      totalSales: true,
      seller: { select: { storeName: true, isVerified: true } },
    },
  })

  return {
    product,
    hasPurchased: !!hasPurchased,
    isWishlisted: !!isWishlisted,
    inCart: !!inCart,
    relatedProducts,
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const data = await getProductData(params.slug, session.user.id)
  if (!data) notFound()

  return <ProductDetailClient {...data} user={session.user} />
}
