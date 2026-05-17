export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      seller: { select: { storeName: true } },
      affiliator: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json({ withdrawals })
}

