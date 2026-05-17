import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.siteSetting.findMany()
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS }
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return NextResponse.json({ settings })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { settings } = await req.json()

  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const promises = Object.entries(settings).map(([key, value]) =>
    prisma.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  )

  await Promise.all(promises)

  return NextResponse.json({ success: true })
}
