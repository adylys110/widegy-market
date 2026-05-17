import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminSettingsClient } from '@/components/admin/AdminSettingsClient'

export const metadata = { title: 'Pengaturan Platform - Admin Widegy' }

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: 'Widegy',
  site_tagline: 'Digital Marketplace',
  site_email: 'hello@widegy.com',
  maintenance_mode: 'false',
  platform_commission: '10',
  default_affiliate_commission: '10',
  min_withdrawal: '50000',
  withdrawal_fee: '0',
  require_email_verification: 'false',
  allow_registration: 'true',
  auto_approve_products: 'false',
}

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return <AdminSettingsClient data={{ settings }} />
}
