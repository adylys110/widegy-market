import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://widegy.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/browse', '/products/', '/sellers/'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/seller/',
          '/admin/',
          '/affiliator/',
          '/cart',
          '/checkout',
          '/orders/',
          '/profile',
          '/wishlist',
          '/_next/',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
