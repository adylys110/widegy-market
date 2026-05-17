import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AffiliatorWithdrawalsClient } from '@/components/affiliator/AffiliatorWithdrawalsClient'

export const metadata = { title: 'Penarikan Komisi - Widegy Affiliator' }

async function getWithdrawalData(userId: string) {
  const affiliatorProfile = await prisma.affiliatorProfile.findUnique({
    where: { userId },
  })
  if (!affiliatorProfile) return null

  const withdrawals = await prisma.withdrawal.findMany({
    where: { affiliatorId: affiliatorProfile.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return {
    affiliatorProfile,
    withdrawals,
    balance: affiliatorProfile.balance,
    bankName: affiliatorProfile.bankName,
    bankAccountName: affiliatorProfile.bankAccountName,
    bankAccountNo: affiliatorProfile.bankAccountNo,
  }
}

export default async function AffiliatorWithdrawalsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!['AFFILIATOR', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  const data = await getWithdrawalData(session.user.id)
  if (!data) redirect('/affiliator/setup')

  return <AffiliatorWithdrawalsClient data={data} />
}
