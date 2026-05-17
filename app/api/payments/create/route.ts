export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

// POST /api/payments/create â€” buat snap token Midtrans
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: 'orderId diperlukan' }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id, status: 'PENDING' },
    include: {
      orderItems: {
        include: { product: { select: { title: true } } },
      },
      user: { select: { name: true, email: true, phone: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan atau sudah dibayar' }, { status: 404 })
  }

  // Check if snap token already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { orderId },
  })
  if (existingPayment?.snapToken) {
    return NextResponse.json({ snapToken: existingPayment.snapToken })
  }

  // Build Midtrans payload
  // PENTING: total item_details HARUS sama persis dengan gross_amount
  const itemDetails = order.orderItems.map((item) => ({
    id: item.productId,
    price: Math.round(item.price),
    quantity: item.quantity,
    name: item.product.title.slice(0, 50),
  }))

  // Hitung total dari item details
  const itemTotal = itemDetails.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const grossAmount = Math.round(order.totalAmount)

  // Tambahkan diskon sebagai item negatif (jika ada)
  if (order.discountAmount > 0) {
    const discountItem = {
      id: 'DISCOUNT',
      price: -Math.round(order.discountAmount),
      quantity: 1,
      name: `Diskon${order.couponCode ? ` (${order.couponCode})` : ''}`.slice(0, 50),
    }
    itemDetails.push(discountItem)
  }

  // Pastikan sum item_details == gross_amount (Midtrans wajibkan ini)
  const itemDetailsTotal = itemDetails.reduce((sum, i) => sum + i.price * i.quantity, 0)
  if (itemDetailsTotal !== grossAmount) {
    // Tambahkan adjustment item untuk menutup selisih (rounding)
    const diff = grossAmount - itemDetailsTotal
    if (diff !== 0) {
      itemDetails.push({
        id: 'ADJUSTMENT',
        price: diff,
        quantity: 1,
        name: 'Penyesuaian harga',
      })
    }
  }

  const payload = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: grossAmount,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: order.user.name ?? 'Buyer',
      email: order.user.email,
      phone: order.user.phone ?? '',
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=error`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=pending`,
    },
  }

  const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')

  const midtransRes = await fetch(MIDTRANS_SNAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  })

  if (!midtransRes.ok) {
    const err = await midtransRes.json()
    console.error('Midtrans error:', err)
    return NextResponse.json({ error: 'Gagal membuat sesi pembayaran' }, { status: 500 })
  }

  const { token, redirect_url } = await midtransRes.json()

  // Upsert payment record
  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      amount: order.totalAmount,
      snapToken: token,
      snapRedirectUrl: redirect_url,
      status: 'PENDING',
    },
    update: {
      snapToken: token,
      snapRedirectUrl: redirect_url,
    },
  })

  return NextResponse.json({ snapToken: token, redirectUrl: redirect_url })
}

