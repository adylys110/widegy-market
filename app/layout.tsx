import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'sonner'
import './globals.css'
import { Providers } from '@/components/providers'
import { BackToTop } from '@/components/shared/BackToTop'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Widegy — Digital Marketplace',
    template: '%s | Widegy',
  },
  description:
    'Marketplace digital terpercaya untuk template, UI kit, ilustrasi, dan aset kreatif berkualitas tinggi.',
  keywords: ['digital marketplace', 'template', 'UI kit', 'desain', 'Indonesia'],
  authors: [{ name: 'Widegy Team' }],
  creator: 'Widegy',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Widegy — Digital Marketplace',
    description: 'Marketplace digital terpercaya untuk aset kreatif berkualitas tinggi.',
    siteName: 'Widegy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Widegy — Digital Marketplace',
    description: 'Marketplace digital terpercaya untuk aset kreatif berkualitas tinggi.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'
const MIDTRANS_CLIENT_KEY    = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style>{`
          /* Landing page cinematic root background */
          html, body {
            background: #F5F0E8;
          }
        `}</style>
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} font-sans antialiased text-foreground`}
        style={{ background: 'transparent' }}
      >
        <Providers>
          {children}
          <BackToTop />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: { toast: 'font-sans' },
            }}
          />
        </Providers>

        {/* Midtrans Snap.js */}
        <Script
          src={
            MIDTRANS_IS_PRODUCTION
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
