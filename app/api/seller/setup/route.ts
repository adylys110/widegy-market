export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// POST /api/seller/setup â€” create seller profile
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['SELLER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already exists
    const existing = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (existing) return NextResponse.json({ error: 'Seller profile already exists' }, { status: 400 })

    const body = await req.json()
    const { storeName, storeSlug, storeDescription, storeEmail, storePhone, website } = body

    if (!storeName) return NextResponse.json({ error: 'Nama toko wajib diisi' }, { status: 400 })

    let slug = storeSlug || slugify(storeName)

    // Check slug uniqueness
    const slugExists = await prisma.sellerProfile.findUnique({ where: { storeSlug: slug } })
    if (slugExists) slug = `${slug}-${Date.now()}`

    // Check store name uniqueness
    const nameExists = await prisma.sellerProfile.findUnique({ where: { storeName } })
    if (nameExists) {
      return NextResponse.json({ error: 'Nama toko sudah digunakan' }, { status: 400 })
    }

    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId: session.user.id,
        storeName,
        storeSlug: slug,
        storeDescription: storeDescription || null,
        storeEmail: storeEmail || null,
        storePhone: storePhone || null,
        website: website || null,
      },
    })

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'Selamat datang di Widegy Seller! ðŸŽ‰',
        message: `Toko "${storeName}" berhasil dibuat. Mulai upload produk pertamamu dan raih penghasilan!`,
      },
    })

    return NextResponse.json({ sellerProfile }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/seller/setup]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

