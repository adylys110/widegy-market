import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST /api/users/upgrade-role
// Buyer bisa upgrade ke SELLER atau AFFILIATOR
// Seller bisa tambah role AFFILIATOR (role tetap SELLER, tapi affiliatorProfile dibuat)
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { role } = body

    if (!['SELLER', 'AFFILIATOR'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
    }

    const currentRole = session.user.role

    // Admin tidak bisa upgrade
    if (currentRole === 'ADMIN') {
      return NextResponse.json({ error: 'Admin tidak perlu upgrade role' }, { status: 400 })
    }

    // Kalau mau jadi SELLER
    if (role === 'SELLER') {
      // Cek apakah sudah seller
      if (currentRole === 'SELLER') {
        return NextResponse.json({ error: 'Kamu sudah terdaftar sebagai seller' }, { status: 400 })
      }
      // Buyer → Seller
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'SELLER' },
      })
      return NextResponse.json({ message: 'Role berhasil diupgrade ke SELLER', role: 'SELLER' })
    }

    // Kalau mau jadi AFFILIATOR
    if (role === 'AFFILIATOR') {
      // Cek apakah sudah punya affiliatorProfile
      const existingAffiliate = await prisma.affiliatorProfile.findUnique({
        where: { userId: session.user.id }
      })
      if (existingAffiliate) {
        return NextResponse.json({ error: 'Kamu sudah terdaftar sebagai affiliator' }, { status: 400 })
      }

      if (currentRole === 'BUYER') {
        // Buyer → Affiliator: update role ke AFFILIATOR
        await prisma.user.update({
          where: { id: session.user.id },
          data: { role: 'AFFILIATOR' },
        })
        return NextResponse.json({ message: 'Role berhasil diupgrade ke AFFILIATOR', role: 'AFFILIATOR' })
      }

      if (currentRole === 'SELLER') {
        // Seller ingin tambah affiliator: tetap SELLER, nanti setup affiliator akan buat profilenya
        // Kita tandai dengan role SELLER tapi redirect ke affiliator setup
        // Middleware perlu tau seller bisa akses /affiliator/setup
        return NextResponse.json({
          message: 'Silakan setup profil affiliator kamu',
          role: 'SELLER', // role tetap SELLER
          redirectTo: '/affiliator/setup',
          isSellerAddingAffiliate: true,
        })
      }

      // AFFILIATOR coba daftar lagi
      if (currentRole === 'AFFILIATOR') {
        return NextResponse.json({ error: 'Kamu sudah terdaftar sebagai affiliator' }, { status: 400 })
      }
    }

    return NextResponse.json({ error: 'Kondisi tidak valid' }, { status: 400 })
  } catch (error) {
    console.error('[UPGRADE_ROLE_ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
