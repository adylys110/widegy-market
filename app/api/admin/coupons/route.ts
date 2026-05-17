import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    code, description, discountType, discountValue,
    minPurchase, maxDiscount, usageLimit, expiresAt,
  } = body

  if (!code || !discountValue) {
    return NextResponse.json({ error: 'Kode dan nilai diskon wajib diisi' }, { status: 400 })
  }

  // Check duplicate code
  const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (existing) {
    return NextResponse.json({ error: 'Kode kupon sudah ada' }, { status: 409 })
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      description,
      discountType: discountType ?? 'PERCENTAGE',
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    },
  })

  return NextResponse.json({ coupon }, { status: 201 })
}
