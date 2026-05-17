export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WDG-${timestamp}-${random}`
}

// POST /api/checkout â€” buat order dari cart
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { couponCode, affiliateCode } = await req.json()

  // Ambil cart items user
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          discountPrice: true,
          sellerId: true,
          status: true,
          commissionRate: true,
          downloadUrl: true,
        },
      },
    },
  })

  if (cartItems.length === 0) {
    return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })
  }

  // Pastikan semua produk masih aktif
  const inactiveProducts = cartItems.filter((i) => i.product.status !== 'ACTIVE')
  if (inactiveProducts.length > 0) {
    return NextResponse.json(
      { error: `Beberapa produk tidak tersedia: ${inactiveProducts.map((i) => i.product.title).join(', ')}` },
      { status: 400 }
    )
  }

  // Hitung subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price
    return sum + price
  }, 0)

  // Validasi kupon jika ada
  let discountAmount = 0
  let validCouponCode: string | undefined

  if (couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    })

    if (coupon) {
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return NextResponse.json(
          { error: `Minimum pembelian ${coupon.minPurchase.toLocaleString('id-ID')} untuk kupon ini` },
          { status: 400 }
        )
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'Kupon sudah mencapai batas penggunaan' }, { status: 400 })
      }

      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = Math.min((coupon.discountValue / 100) * subtotal, coupon.maxDiscount ?? Infinity)
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal)
      }

      validCouponCode = coupon.code
    }
  }

  // Validasi affiliate code jika ada
  let validAffiliateCode: string | undefined
  let affiliatorProfile: { id: string; commissionRate: number } | null = null

  if (affiliateCode) {
    const affiliator = await prisma.affiliatorProfile.findUnique({
      where: { referralCode: affiliateCode.toUpperCase() },
      select: { id: true, commissionRate: true, status: true },
    })
    if (affiliator && affiliator.status === 'ACTIVE') {
      validAffiliateCode = affiliateCode.toUpperCase()
      affiliatorProfile = affiliator
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount)

  // Buat order dalam transaction
  const order = await prisma.$transaction(async (tx) => {
    // Buat order
    const newOrder = await tx.order.create({
      data: {
        userId: session.user!.id,
        orderNumber: generateOrderNumber(),
        status: 'PENDING',
        subtotal,
        discountAmount,
        totalAmount,
        couponCode: validCouponCode,
        affiliateCode: validAffiliateCode,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: 1,
            price: item.product.discountPrice ?? item.product.price,
            downloadUrl: item.product.downloadUrl,
          })),
        },
      },
    })

    // Increment coupon usage
    if (validCouponCode) {
      await tx.coupon.update({
        where: { code: validCouponCode },
        data: { usageCount: { increment: 1 } },
      })
    }

    // Buat affiliate commissions jika ada affiliate code
    if (affiliatorProfile && validAffiliateCode) {
      for (const item of cartItems) {
        const itemPrice = item.product.discountPrice ?? item.product.price
        const commissionAmount = itemPrice * affiliatorProfile.commissionRate

        await tx.affiliateCommission.create({
          data: {
            affiliatorId: affiliatorProfile.id,
            orderId: newOrder.id,
            productId: item.productId,
            amount: commissionAmount,
            rate: affiliatorProfile.commissionRate,
            status: 'PENDING',
          },
        })
      }

      // Update affiliator total clicks (conversion)
      await tx.affiliatorProfile.update({
        where: { id: affiliatorProfile.id },
        data: { totalConversions: { increment: 1 } },
      })
    }

    // Kosongkan cart setelah order dibuat
    await tx.cartItem.deleteMany({ where: { userId: session.user!.id } })

    // Buat payment record awal
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        amount: totalAmount,
        status: 'PENDING',
      },
    })

    return newOrder
  })

  return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber }, { status: 201 })
}

