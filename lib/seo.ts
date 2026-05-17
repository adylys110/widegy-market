import { Metadata } from 'next'

interface SEOProps {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  keywords?: string[]
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://widegy.com'
const defaultImage = `${baseUrl}/og-default.png`
const siteName = 'Widegy'
const defaultDescription =
  'Marketplace digital terpercaya untuk template, UI kit, ilustrasi, dan aset kreatif berkualitas tinggi.'

export function generateSEO({
  title,
  description = defaultDescription,
  image = defaultImage,
  url,
  type = 'website',
  noIndex = false,
  keywords = [],
}: SEOProps): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`
  const canonicalUrl = url ? `${baseUrl}${url}` : baseUrl

  return {
    title: fullTitle,
    description,
    keywords: ['digital marketplace', 'template', 'UI kit', 'desain Indonesia', 'aset kreatif', ...keywords],
    metadataBase: new URL(baseUrl),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName,
      type,
      locale: 'id_ID',
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function generateProductSEO({
  name, description, price, image, slug, category, sellerName,
}: {
  name: string; description: string; price: number
  image?: string; slug: string; category: string; sellerName: string
}): Metadata {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(price)

  return generateSEO({
    title: name,
    description: `${description.slice(0, 120)} — ${formattedPrice} oleh ${sellerName}`,
    image: image || undefined,
    url: `/products/${slug}`,
    type: 'website',
    keywords: [name, category, sellerName, 'download digital', 'beli template'],
  })
}
