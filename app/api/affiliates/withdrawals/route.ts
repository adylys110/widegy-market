export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const MIN_WITHDRAW = 50_000

// POST /api/affiliates/withdrawals â€” create withdrawal request
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['AFFILIATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { amount, bankName, bankAccountName, bankAccountNo } = body

    if (!amount || !bankName || !bankAccountName || !bankAccountNo) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < MIN_WITHDRAW) {
      return NextResponse.json({ error: `Minimum penarikan Rp ${MIN_WITHDRAW.toLocaleString('id-ID')}` }, { status: 400 })
    }

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (profile.balance < amountNum) {
      return NextResponse.json({ error: 'Saldo tidak mencukupi' }, { status: 400 })
    }

    // Create withdrawal and deduct balance in transaction
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          affiliatorId: profile.id,
          amount: amountNum,
          bankName,
          bankAccountName: bankAccountName.toUpperCase(),
          bankAccountNo,
          status: 'PENDING',
        },
      }),
      prisma.affiliatorProfile.update({
        where: { id: profile.id },
        data: { balance: { decrement: amountNum } },
      }),
    ])

    // Save bank info to profile if not set
    if (!profile.bankName) {
      await prisma.affiliatorProfile.update({
        where: { id: profile.id },
        data: { bankName, bankAccountName: bankAccountName.toUpperCase(), bankAccountNo },
      })
    }

    return NextResponse.json({ withdrawal }, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/affiliates/withdrawals]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/affiliates/withdrawals â€” list withdrawals
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const withdrawals = await prisma.withdrawal.findMany({
      where: { affiliatorId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ withdrawals, balance: profile.balance })
  } catch (e: any) {
    console.error('[GET /api/affiliates/withdrawals]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

