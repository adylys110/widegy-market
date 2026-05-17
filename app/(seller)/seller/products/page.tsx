import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerProductsClient } from '@/components/seller/SellerProductsClient'

export const metadata = { title: 'Produk Saya - Widegy Seller' }

async function getSellerProducts(userId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } })
  if (!sellerProfile) return null

  const products = await prisma.product.findMany({
    where: { sellerId: sellerProfile.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      price: true,
      discountPrice: true,
      category: true,
      status: true,
      totalSales: true,
      totalViews: true,
      rating: true,
      ratingCount: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return { products, sellerProfile }
}

export default async function SellerProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getSellerProducts(session.user.id)
  if (!data) redirect('/seller/setup')

  return <SellerProductsClient data={data} />
}
