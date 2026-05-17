export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

function generateLinkId(length = 8): string {
  return randomBytes(length).toString('base64url').slice(0, length)
}

// GET /api/affiliates/links â€” list links
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const links = await prisma.affiliateLink.findMany({
      where: { affiliatorId: profile.id },
      include: {
        product: {
          select: { id: true, title: true, thumbnail: true, price: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ links })
  } catch (e: any) {
    console.error('[GET /api/affiliates/links]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/affiliates/links â€” create link
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['AFFILIATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { productId } = body

    if (!productId) return NextResponse.json({ error: 'productId is required' }, { status: 400 })

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Affiliator profile not found' }, { status: 404 })

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, status: 'ACTIVE' },
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan atau tidak aktif' }, { status: 404 })

    // Check if link already exists
    const existing = await prisma.affiliateLink.findFirst({
      where: { affiliatorId: profile.id, productId },
    })
    if (existing) return NextResponse.json({ error: 'Link untuk produk ini sudah ada' }, { status: 409 })

    // Generate unique slug
    let slug = `${profile.referralCode.toLowerCase()}-${generateLinkId(6)}`
    let attempts = 0
    while (attempts < 10) {
      const conflict = await prisma.affiliateLink.findUnique({ where: { slug } })
      if (!conflict) break
      slug = `${profile.referralCode.toLowerCase()}-${generateLinkId(6)}`
      attempts++
    }

    const link = await prisma.affiliateLink.create({
      data: {
        affiliatorId: profile.id,
        productId,
        slug,
      },
      include: {
        product: {
          select: { id: true, title: true, thumbnail: true, price: true, category: true },
        },
      },
    })

    return NextResponse.json({ link }, { status: 201 })
  } catch (e: any) {
    console.error('[POST /api/affiliates/links]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

