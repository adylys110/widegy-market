import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// GET /api/affiliates/track?ref=CODE&productId=xxx — track affiliate click
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref')
  const productId = searchParams.get('productId')

  if (!ref || !productId) {
    return NextResponse.json({ error: 'ref dan productId diperlukan' }, { status: 400 })
  }

  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
  const userAgent = headersList.get('user-agent') ?? ''
  const referer = headersList.get('referer') ?? ''

  // Find affiliate link
  const affiliateLink = await prisma.affiliateLink.findFirst({
    where: {
      slug: ref,
      productId,
      isActive: true,
    },
  })

  if (!affiliateLink) {
    // Coba cari by referral code dari affiliatorProfile
    const affiliator = await prisma.affiliatorProfile.findUnique({
      where: { referralCode: ref.toUpperCase() },
    })

    if (affiliator) {
      // Update affiliator totalClicks
      await prisma.affiliatorProfile.update({
        where: { id: affiliator.id },
        data: { totalClicks: { increment: 1 } },
      })
    }

    return NextResponse.json({ tracked: true, method: 'referral_code' })
  }

  // Log click
  await prisma.$transaction([
    prisma.affiliateLinkClick.create({
      data: {
        linkId: affiliateLink.id,
        ip: ip.split(',')[0].trim(),
        userAgent: userAgent.slice(0, 500),
        referer: referer.slice(0, 500),
        converted: false,
      },
    }),
    prisma.affiliateLink.update({
      where: { id: affiliateLink.id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.affiliatorProfile.update({
      where: { id: affiliateLink.affiliatorId },
      data: { totalClicks: { increment: 1 } },
    }),
  ])

  return NextResponse.json({ tracked: true, method: 'affiliate_link' })
}
