import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/seller/products/[id] — update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id: params.id, sellerId: sellerProfile.id },
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

    const body = await req.json()

    // Extract safe fields
    const {
      title, description, shortDescription, price, discountPrice,
      category, tags, thumbnail, previewUrl, downloadUrl,
      fileSize, fileType, commissionRate, metaTitle, metaDescription, status,
    } = body

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price !== undefined && { price }),
        ...(discountPrice !== undefined && { discountPrice }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(previewUrl !== undefined && { previewUrl: previewUrl || null }),
        ...(downloadUrl !== undefined && { downloadUrl }),
        ...(fileSize !== undefined && { fileSize }),
        ...(fileType !== undefined && { fileType }),
        ...(commissionRate !== undefined && { commissionRate }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(status !== undefined && { status }),
      },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('[PATCH /api/seller/products/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/seller/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } })
    if (!sellerProfile) return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id: params.id, sellerId: sellerProfile.id },
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

    // Soft delete: set to ARCHIVED
    await prisma.product.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
