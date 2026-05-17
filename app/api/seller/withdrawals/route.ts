import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const withdrawalSchema = z.object({
  amount: z.number().positive().min(50_000, 'Minimum penarikan Rp 50.000'),
  bankName: z.string().min(1, 'Nama bank wajib diisi'),
  bankAccountName: z.string().min(1, 'Nama rekening wajib diisi'),
  bankAccountNo: z.string().min(5, 'Nomor rekening tidak valid'),
})

// POST /api/seller/withdrawals
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['SELLER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    const body = await req.json()
    const parsed = withdrawalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { amount, bankName, bankAccountName, bankAccountNo } = parsed.data

    if (sellerProfile.balance < amount) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
    }

    // Check for pending withdrawal
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: { sellerId: sellerProfile.id, status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] } },
    })
    if (pendingWithdrawal) {
      return NextResponse.json({ error: 'Masih ada pengajuan yang sedang diproses' }, { status: 400 })
    }

    // Create withdrawal + deduct balance (transaction)
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          sellerId: sellerProfile.id,
          amount,
          bankName,
          bankAccountName,
          bankAccountNo,
          status: 'PENDING',
        },
      }),
      prisma.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: { balance: { decrement: amount } },
      }),
    ])

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PAYMENT',
        title: 'Pengajuan penarikan diterima',
        message: `Pengajuan penarikan ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)} sedang diproses. Estimasi 1-3 hari kerja.`,
      },
    })

    return NextResponse.json({ withdrawal }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/seller/withdrawals]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/seller/withdrawals
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    const withdrawals = await prisma.withdrawal.findMany({
      where: { sellerId: sellerProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
