'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Twitter, Instagram, Youtube, Github, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  Marketplace: [
    { label: 'Jelajahi Produk', href: '/browse' },
    { label: 'UI Kit', href: '/browse?category=ui-kit' },
    { label: 'Template Web', href: '/browse?category=template' },
    { label: 'Font Premium', href: '/browse?category=font' },
    { label: 'Ilustrasi', href: '/browse?category=illustration' },
    { label: 'Icon Pack', href: '/browse?category=icon' },
  ],
  Seller: [
    { label: 'Mulai Berjualan', href: '/register?role=seller' },
    { label: 'Panduan Seller', href: '/docs/seller' },
    { label: 'Komisi & Pembayaran', href: '/docs/commission' },
    { label: 'Seller Dashboard', href: '/seller/dashboard' },
    { label: 'Badge Verified', href: '/docs/verified' },
  ],
  Afiliasi: [
    { label: 'Program Afiliasi', href: '/register?role=affiliator' },
    { label: 'Cara Kerja', href: '/docs/affiliator' },
    { label: 'Komisi Referral', href: '/docs/referral' },
    { label: 'Affiliator Dashboard', href: '/affiliator/dashboard' },
  ],
  Bantuan: [
    { label: 'Pusat Bantuan', href: '/help' },
    { label: 'Kebijakan Privasi', href: '/privacy' },
    { label: 'Syarat & Ketentuan', href: '/terms' },
    { label: 'Kebijakan Refund', href: '/refund' },
    { label: 'Hubungi Kami', href: '/contact' },
  ],
}

const socials = [
  { icon: Twitter, href: 'https://twitter.com/widegy', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/widegy', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@widegy', label: 'YouTube' },
  { icon: Github, href: 'https://github.com/widegy', label: 'GitHub' },
]

const paymentMethods = ['BCA', 'Mandiri', 'BNI', 'BRI', 'QRIS', 'GoPay', 'OVO', 'Dana']

export function Footer() {
  return (
    <footer className="bg-[#0F0F1A] text-white pt-20 pb-8 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-secondary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Widegy</span>
            </Link>

            <p className="text-sm text-white/50 leading-relaxed mb-6">
              Marketplace digital #1 Indonesia. Jual, beli, dan hasilkan passive income dari aset digital berkualitas.
            </p>

            {/* Contact info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>hello@widegy.id</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Jakarta, Indonesia 🇮🇩</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-white/50 group-hover:text-primary transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-sm font-bold text-white mb-4 tracking-wide">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Copyright */}
          <p className="text-xs text-white/35 text-center md:text-left">
            © {new Date().getFullYear()} Widegy. Semua hak dilindungi.{' '}
            <span className="text-white/20">Dibuat dengan ❤️ di Indonesia</span>
          </p>

          {/* Payment methods */}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-white/40 tracking-wide"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
