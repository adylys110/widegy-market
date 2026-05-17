export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

// PUT /api/seller/settings â€” update seller profile info
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['SELLER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile tidak ditemukan' }, { status: 404 })
    }

    const body = await req.json()
    const {
      storeName,
      storeDescription,
      storeEmail,
      storePhone,
      website,
      bankName,
      bankAccountName,
      bankAccountNo,
      // User fields
      name,
      phone,
      bio,
    } = body

    if (!storeName || storeName.trim().length < 2) {
      return NextResponse.json({ error: 'Nama toko minimal 2 karakter' }, { status: 400 })
    }

    // Check store name uniqueness (exclude self)
    if (storeName !== sellerProfile.storeName) {
      const nameExists = await prisma.sellerProfile.findFirst({
        where: { storeName: storeName.trim(), id: { not: sellerProfile.id } },
      })
      if (nameExists) {
        return NextResponse.json({ error: 'Nama toko sudah digunakan' }, { status: 400 })
      }
    }

    // Generate new slug if storeName changed
    let storeSlug = sellerProfile.storeSlug
    if (storeName.trim() !== sellerProfile.storeName) {
      storeSlug = slugify(storeName.trim())
      const slugExists = await prisma.sellerProfile.findFirst({
        where: { storeSlug, id: { not: sellerProfile.id } },
      })
      if (slugExists) storeSlug = `${storeSlug}-${Date.now()}`
    }

    // Update seller profile + user profile in transaction
    const [updatedProfile] = await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: {
          storeName: storeName.trim(),
          storeSlug,
          storeDescription: storeDescription?.trim() || null,
          storeEmail: storeEmail?.trim() || null,
          storePhone: storePhone?.trim() || null,
          website: website?.trim() || null,
          ...(bankName && {
            bankName: bankName.trim(),
            bankAccountName: bankAccountName?.toUpperCase()?.trim() || null,
            bankAccountNo: bankAccountNo?.trim() || null,
          }),
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && { phone: phone?.trim() || null }),
          ...(bio !== undefined && { bio: bio?.trim() || null }),
        },
      }),
    ])

    return NextResponse.json({
      message: 'Pengaturan berhasil disimpan',
      sellerProfile: updatedProfile,
    })
  } catch (error) {
    console.error('[PUT /api/seller/settings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

