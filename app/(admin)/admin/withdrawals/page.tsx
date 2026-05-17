import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminWithdrawalsClient } from '@/components/admin/AdminWithdrawalsClient'

export const metadata = { title: 'Kelola Penarikan - Admin Widegy' }

export default async function AdminWithdrawalsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      seller: { select: { storeName: true } },
      affiliator: { include: { user: { select: { name: true } } } },
    },
  })

  return <AdminWithdrawalsClient data={{ withdrawals }} />
}
