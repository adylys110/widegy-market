export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateReferralCode } from '@/lib/utils'

// POST /api/affiliates â€” setup affiliator profile
// Bisa diakses setelah user upgrade role ke AFFILIATOR atau SELLER ingin tambah affiliate
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Allow AFFILIATOR, SELLER, BUYER (kalau buyer sudah upgrade role baru ke sini)
    // Admin tidak perlu
    if (session.user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin tidak perlu setup affiliator' }, { status: 403 })
    }

    const body = await req.json()
    const { bankName, bankAccountName, bankAccountNo } = body

    if (!bankName || !bankAccountName || !bankAccountNo) {
      return NextResponse.json({ error: 'Data rekening bank tidak lengkap' }, { status: 400 })
    }

    // Check existing
    const existing = await prisma.affiliatorProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'Profil affiliator sudah ada' }, { status: 409 })
    }

    // Generate unique referral code
    let referralCode = generateReferralCode(session.user.name ?? session.user.email ?? 'AFF')
    let attempts = 0
    while (attempts < 10) {
      const conflict = await prisma.affiliatorProfile.findUnique({ where: { referralCode } })
      if (!conflict) break
      referralCode = generateReferralCode(session.user.name ?? 'AFF')
      attempts++
    }

    // Buat profile affiliator
    const profile = await prisma.affiliatorProfile.create({
      data: {
        userId: session.user.id,
        referralCode,
        bankName,
        bankAccountName: bankAccountName.toUpperCase(),
        bankAccountNo,
        status: 'ACTIVE',   // langsung ACTIVE tanpa perlu approval
        commissionRate: 0.10,
      },
    })

    // Jika user masih BUYER, upgrade role ke AFFILIATOR di DB
    if (session.user.role === 'BUYER') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'AFFILIATOR' },
      })
    }

    return NextResponse.json({ profile, role: session.user.role === 'BUYER' ? 'AFFILIATOR' : session.user.role }, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/affiliates]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/affiliates â€” get profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ profile })
  } catch (e: any) {
    console.error('[GET /api/affiliates]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

