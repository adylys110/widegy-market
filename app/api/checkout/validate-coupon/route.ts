export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/checkout/validate-coupon
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'Kode kupon diperlukan' }, { status: 400 })

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: code.toUpperCase().trim(),
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  })

  if (!coupon) {
    return NextResponse.json({ error: 'Kode kupon tidak valid atau sudah kadaluarsa' }, { status: 404 })
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Kupon sudah mencapai batas penggunaan' }, { status: 400 })
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return NextResponse.json(
      {
        error: `Minimum pembelian Rp${coupon.minPurchase.toLocaleString('id-ID')} untuk kupon ini`,
      },
      { status: 400 }
    )
  }

  let discountValue = coupon.discountValue
  if (coupon.discountType === 'PERCENTAGE' && coupon.maxDiscount) {
    const calculated = (coupon.discountValue / 100) * subtotal
    discountValue = Math.min(calculated, coupon.maxDiscount)
  }

  return NextResponse.json({
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    calculatedDiscount: discountValue,
    minPurchase: coupon.minPurchase,
    maxDiscount: coupon.maxDiscount,
    description: coupon.description,
  })
}

