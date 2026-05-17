import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Widegy — Digital Marketplace',
    short_name: 'Widegy',
    description: 'Marketplace digital terpercaya untuk aset kreatif berkualitas tinggi',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#FF6B35',
    orientation: 'portrait-primary',
    categories: ['shopping', 'productivity'],
    lang: 'id',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
      },
    ],
  }
}
