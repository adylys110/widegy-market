import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

export const metadata = { title: 'Kelola Pengguna - Admin Widegy' }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, isBanned: true, createdAt: true,
      },
    }),
    prisma.user.count(),
  ])

  return <AdminUsersClient data={{ users, total }} />
}
