import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SellerWithdrawalsClient } from '@/components/seller/SellerWithdrawalsClient'

export const metadata = { title: 'Penarikan Dana - Widegy Seller' }

async function getWithdrawalData(userId: string) {
  const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } })
  if (!sellerProfile) return null

  const withdrawals = await prisma.withdrawal.findMany({
    where: { sellerId: sellerProfile.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return {
    sellerProfile,
    withdrawals,
    balance: sellerProfile.balance,
    bankName: sellerProfile.bankName,
    bankAccountName: sellerProfile.bankAccountName,
    bankAccountNo: sellerProfile.bankAccountNo,
  }
}

export default async function SellerWithdrawalsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['SELLER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getWithdrawalData(session.user.id)
  if (!data) redirect('/seller/setup')

  return <SellerWithdrawalsClient data={data} />
}
