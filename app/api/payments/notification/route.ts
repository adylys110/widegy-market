import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!

function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex')
  return hash === signatureKey
}

// POST /api/payments/notification — Midtrans webhook
export async function POST(req: Request) {
  const body = await req.json()
  const {
    order_id: midtransOrderId,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    payment_type,
    transaction_id,
    fraud_status,
  } = body

  // Verify signature
  if (!verifySignature(midtransOrderId, status_code, gross_amount, signature_key)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Find order by orderNumber (midtrans order_id = orderNumber)
  const order = await prisma.order.findUnique({
    where: { orderNumber: midtransOrderId },
    include: {
      orderItems: {
        include: {
          product: {
            select: { downloadUrl: true, sellerId: true, price: true, commissionRate: true },
          },
        },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  }

  // Map Midtrans status to our PaymentStatus
  let paymentStatus: string = 'PENDING'
  let orderStatus: string = order.status

  if (transaction_status === 'capture' && fraud_status === 'accept') {
    paymentStatus = 'CAPTURE'
    orderStatus = 'PAID'
  } else if (transaction_status === 'settlement') {
    paymentStatus = 'SETTLEMENT'
    orderStatus = 'PAID'
  } else if (transaction_status === 'pending') {
    paymentStatus = 'PENDING'
  } else if (['deny', 'cancel', 'expire', 'failure'].includes(transaction_status)) {
    paymentStatus = transaction_status.toUpperCase()
    if (['cancel', 'expire', 'failure'].includes(transaction_status)) {
      orderStatus = 'CANCELLED'
    }
  } else if (transaction_status === 'refund') {
    paymentStatus = 'REFUND'
    orderStatus = 'REFUNDED'
  }

  // Update payment + order in transaction
  await prisma.$transaction(async (tx) => {
    // Update payment
    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: paymentStatus as any,
        transactionId: transaction_id,
        paymentMethod: payment_type,
        rawResponse: body,
        ...(paymentStatus === 'SETTLEMENT' || paymentStatus === 'CAPTURE'
          ? { paidAt: new Date() }
          : {}),
      },
    })

    // Update order status jika berubah
    if (orderStatus !== order.status) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: orderStatus as any },
      })
    }

    // Jika PAID → proses seluruh fulfillment digital
    if (orderStatus === 'PAID') {
      // 1. Update buyer profile stats
      await tx.buyerProfile.upsert({
        where: { userId: order.userId },
        create: {
          userId: order.userId,
          totalOrders: 1,
          totalSpent: order.totalAmount,
          loyaltyPoints: Math.floor(order.totalAmount / 10000),
        },
        update: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: order.totalAmount },
          loyaltyPoints: { increment: Math.floor(order.totalAmount / 10000) },
        },
      })

      // 2. Update seller balance per order item
      for (const item of order.orderItems) {
        const platformFee = item.product.commissionRate  // platform mengambil commissionRate
        const sellerAmount = item.price * (1 - platformFee)

        await tx.sellerProfile.update({
          where: { id: item.product.sellerId },
          data: {
            balance: { increment: sellerAmount },
            totalRevenue: { increment: sellerAmount },
            totalSales: { increment: 1 },
          },
        })

        // Update product totalSales
        await tx.product.update({
          where: { id: item.productId },
          data: { totalSales: { increment: 1 } },
        })

        // Update download URL dari product ke order item
        if (item.product.downloadUrl) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { downloadUrl: item.product.downloadUrl },
          })
        }
      }

      // 3. Update affiliate commissions → APPROVED + tambah balance affiliator
      const affiliateCommissions = await tx.affiliateCommission.findMany({
        where: { orderId: order.id, status: 'PENDING' },
      })

      for (const commission of affiliateCommissions) {
        // Approve commission
        await tx.affiliateCommission.update({
          where: { id: commission.id },
          data: { status: 'APPROVED' },
        })

        // Tambah ke balance affiliator
        await tx.affiliatorProfile.update({
          where: { id: commission.affiliatorId },
          data: {
            balance: { increment: commission.amount },
            totalEarnings: { increment: commission.amount },
          },
        })
      }

      // 4. Langsung set order ke COMPLETED (digital goods — instant delivery)
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      })

      // 5. Notifikasi buyer
      await tx.notification.create({
        data: {
          userId: order.userId,
          type: 'PAYMENT',
          title: 'Pembayaran Berhasil! 🎉',
          message: `Order #${order.orderNumber} telah lunas. Produk siap didownload.`,
          data: { orderId: order.id },
        },
      })

      // 6. Notifikasi seller per item (group by sellerId)
      const sellerIds = [...new Set(order.orderItems.map((i) => i.product.sellerId))]
      for (const sellerId of sellerIds) {
        const sellerProfile = await tx.sellerProfile.findUnique({
          where: { id: sellerId },
          select: { userId: true },
        })
        if (sellerProfile) {
          const sellerItems = order.orderItems.filter((i) => i.product.sellerId === sellerId)
          await tx.notification.create({
            data: {
              userId: sellerProfile.userId,
              type: 'ORDER',
              title: 'Pesanan Baru! 🛍️',
              message: `Kamu mendapat pesanan baru (${sellerItems.length} produk). Cek dashboard seller.`,
              data: { orderId: order.id },
            },
          })
        }
      }
    }

    // Jika REFUNDED — kembalikan commission status ke REJECTED
    if (orderStatus === 'REFUNDED') {
      const approvedCommissions = await tx.affiliateCommission.findMany({
        where: { orderId: order.id, status: 'APPROVED' },
      })

      for (const commission of approvedCommissions) {
        await tx.affiliateCommission.update({
          where: { id: commission.id },
          data: { status: 'REJECTED' },
        })
        // Kurangi balance kembali
        await tx.affiliatorProfile.update({
          where: { id: commission.affiliatorId },
          data: {
            balance: { decrement: commission.amount },
            totalEarnings: { decrement: commission.amount },
          },
        })
      }
    }
  })

  return NextResponse.json({ message: 'OK' })
}
