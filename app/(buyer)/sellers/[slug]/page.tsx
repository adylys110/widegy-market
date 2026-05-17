import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerStoreClient } from '@/components/buyer/SellerStoreClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { storeSlug: params.slug },
    select: { storeName: true, storeDescription: true, storeBanner: true },
  })
  if (!seller) return { title: 'Toko Tidak Ditemukan' }
  return {
    title: `${seller.storeName} - Widegy`,
    description: seller.storeDescription ?? `Produk digital dari ${seller.storeName}`,
    openGraph: { images: seller.storeBanner ? [seller.storeBanner] : [] },
  }
}

async function getSellerData(slug: string, userId?: string) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { storeSlug: slug, isActive: true },
    include: {
      user: { select: { createdAt: true } },
      products: {
        where: { status: 'ACTIVE' },
        orderBy: { totalSales: 'desc' },
        select: {
          id: true, title: true, slug: true, thumbnail: true,
          price: true, discountPrice: true, category: true,
          rating: true, ratingCount: true, totalSales: true,
          fileType: true, tags: true, createdAt: true,
        },
      },
    },
  })

  if (!seller) return null

  let wishlistedIds: string[] = []
  if (userId) {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true },
    })
    wishlistedIds = wishlistItems.map((w) => w.productId)
  }

  // Serialize Dates to ISO strings for client components
  return {
    seller: {
      ...seller,
      createdAt: seller.createdAt.toISOString(),
      updatedAt: seller.updatedAt.toISOString(),
      user: { createdAt: seller.user.createdAt.toISOString() },
      products: seller.products.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    },
    wishlistedIds,
  }
}

export default async function SellerStorePage({ params }: { params: { slug: string } }) {
  const session = await auth()
  const data = await getSellerData(params.slug, session?.user?.id)
  if (!data) notFound()

  return <SellerStoreClient {...data} user={session?.user ?? null} />
}
