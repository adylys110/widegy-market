import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminProductsClient } from '@/components/admin/AdminProductsClient'

export const metadata = { title: 'Kelola Produk - Admin Widegy' }

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true, title: true, thumbnail: true, price: true,
        status: true, rating: true, totalSales: true, createdAt: true,
        seller: { select: { storeName: true } },
      },
    }),
    prisma.product.count(),
  ])

  return <AdminProductsClient data={{ products, total }} />
}
