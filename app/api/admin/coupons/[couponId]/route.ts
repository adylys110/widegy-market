import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const coupon = await prisma.coupon.update({
    where: { id: params.couponId },
    data: body,
  })

  return NextResponse.json({ coupon })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.coupon.delete({ where: { id: params.couponId } })

  return NextResponse.json({ success: true })
}
