export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const productSchema = z.object({
  title: z.string().min(3, 'Judul terlalu pendek'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Deskripsi terlalu pendek'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Harga harus lebih dari 0'),
  discountPrice: z.number().positive().nullable().optional(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().url('URL thumbnail tidak valid'),
  previewUrl: z.string().url().optional().or(z.literal('')),
  downloadUrl: z.string().url('URL download tidak valid'),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
  commissionRate: z.number().min(0).max(0.5).default(0.1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW']).default('DRAFT'),
})

// GET /api/seller/products â€” list seller products
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['SELLER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const products = await prisma.product.findMany({
      where: {
        sellerId: sellerProfile.id,
        ...(status && { status: status as any }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/seller/products â€” create new product
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
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data = parsed.data

    // Generate unique slug
    let slug = data.slug || slugify(data.title)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        sellerId: sellerProfile.id,
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription ?? null,
        price: data.price,
        discountPrice: data.discountPrice ?? null,
        category: data.category as any,
        tags: data.tags,
        thumbnail: data.thumbnail,
        previewUrl: data.previewUrl || null,
        downloadUrl: data.downloadUrl,
        fileSize: data.fileSize ?? null,
        fileType: data.fileType ?? null,
        commissionRate: data.commissionRate,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        status: data.status as any,
      },
    })

    // Update seller product count
    await prisma.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: { totalProducts: { increment: 1 } },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/seller/products]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

