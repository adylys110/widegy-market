import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { withdrawalId: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status, notes } = await req.json()

  const validStatuses = ['APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: params.withdrawalId },
    include: {
      seller: { select: { userId: true, storeName: true } },
      affiliator: { include: { user: { select: { id: true, name: true } } } },
    },
  })

  if (!withdrawal) {
    return NextResponse.json({ error: 'Withdrawal tidak ditemukan' }, { status: 404 })
  }

  const updated = await prisma.withdrawal.update({
    where: { id: params.withdrawalId },
    data: {
      status,
      ...(notes ? { adminNote: notes } : {}),
      ...(status === 'COMPLETED' ? { processedAt: new Date() } : {}),
    },
  })

  // If rejected — refund balance
  if (status === 'REJECTED') {
    if (withdrawal.sellerId) {
      await prisma.sellerProfile.update({
        where: { id: withdrawal.sellerId },
        data: { balance: { increment: withdrawal.amount } },
      })
    }
    if (withdrawal.affiliatorId) {
      await prisma.affiliatorProfile.update({
        where: { id: withdrawal.affiliatorId },
        data: { balance: { increment: withdrawal.amount } },
      })
    }
  }

  // Send notification
  const recipientUserId = withdrawal.seller?.userId ?? withdrawal.affiliator?.user?.id
  if (recipientUserId) {
    const isSeller = !!withdrawal.sellerId
    const notifMap: Record<string, { title: string; message: string }> = {
      APPROVED: {
        title: 'Penarikan Disetujui ✅',
        message: `Permintaan penarikan Rp ${withdrawal.amount.toLocaleString('id-ID')} telah disetujui dan sedang diproses.`,
      },
      COMPLETED: {
        title: 'Dana Terkirim 💰',
        message: `Dana sebesar Rp ${withdrawal.amount.toLocaleString('id-ID')} telah dikirim ke rekening Anda.`,
      },
      REJECTED: {
        title: 'Penarikan Ditolak ❌',
        message: `Permintaan penarikan Rp ${withdrawal.amount.toLocaleString('id-ID')} ditolak${notes ? `. Alasan: ${notes}` : '.'}`,
      },
    }
    if (notifMap[status]) {
      await prisma.notification.create({
        data: {
          userId: recipientUserId,
          type: 'PAYMENT',
          title: notifMap[status].title,
          message: notifMap[status].message,
          data: { link: isSeller ? '/seller/earnings' : '/affiliator/earnings' },
        },
      }).catch(() => {})
    }
  }

  return NextResponse.json({ withdrawal: updated })
}
