import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProductFormClient } from '@/components/seller/ProductFormClient'

export const metadata = { title: 'Upload Produk - Widegy Seller' }

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, storeName: true },
  })
  if (!sellerProfile) redirect('/seller/setup')

  return <ProductFormClient mode="create" sellerProfile={sellerProfile} />
}
