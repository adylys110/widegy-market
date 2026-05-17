import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { isBanned, banReason, banDurationDays } = await req.json()

  // Prevent admin from banning themselves or other admins
  if (params.userId === session.user.id) {
    return NextResponse.json({ error: 'Tidak bisa memban diri sendiri' }, { status: 400 })
  }

  const targetUser = await prisma.user.findUnique({ where: { id: params.userId } })
  if (!targetUser) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  if (targetUser.role === 'ADMIN') {
    return NextResponse.json({ error: 'Tidak bisa memban admin lain' }, { status: 400 })
  }

  // Hitung waktu berakhir ban
  let bannedUntil: Date | null = null
  if (isBanned && banDurationDays && banDurationDays > 0) {
    bannedUntil = new Date()
    bannedUntil.setDate(bannedUntil.getDate() + banDurationDays)
  }

  const updateData: any = { isBanned }
  if (isBanned) {
    updateData.bannedReason = banReason ?? 'Melanggar ketentuan layanan'
    updateData.bannedUntil = bannedUntil  // null = permanen
  } else {
    // Unban: bersihkan data ban
    updateData.bannedReason = null
    updateData.bannedUntil = null
  }

  const user = await prisma.user.update({
    where: { id: params.userId },
    data: updateData,
    select: { id: true, name: true, isBanned: true, bannedReason: true },
  })

  // Notifikasi ke user
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: 'SYSTEM',
      title: isBanned ? '⛔ Akun Ditangguhkan' : '✅ Akun Dipulihkan',
      message: isBanned
        ? `Akun kamu ditangguhkan${bannedUntil ? ` hingga ${bannedUntil.toLocaleDateString('id-ID')}` : ' secara permanen'}. Alasan: ${updateData.bannedReason}`
        : 'Akun kamu telah dipulihkan. Kamu bisa login kembali.',
    },
  })

  return NextResponse.json({ user })
}
