import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/affiliates/links/[id] — toggle active/inactive
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const link = await prisma.affiliateLink.findFirst({
      where: { id: params.id, affiliatorId: profile.id },
    })
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

    const body = await req.json()
    const updated = await prisma.affiliateLink.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    })

    return NextResponse.json({ link: updated })
  } catch (e: any) {
    console.error('[PATCH /api/affiliates/links/[id]]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/affiliates/links/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.affiliatorProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const link = await prisma.affiliateLink.findFirst({
      where: { id: params.id, affiliatorId: profile.id },
    })
    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

    await prisma.affiliateLink.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[DELETE /api/affiliates/links/[id]]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
