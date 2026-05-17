import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Search, Home, ShoppingBag, Compass } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan — 404',
  description: 'Halaman yang kamu cari tidak ditemukan.',
  robots: { index: false, follow: false },
}

const suggestions = [
  { icon: Home, label: 'Beranda', href: '/' },
  { icon: ShoppingBag, label: 'Browse Produk', href: '/browse' },
  { icon: Compass, label: 'Jelajahi', href: '/browse?sort=popular' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 visual */}
        <div className="relative">
          <div className="text-[120px] sm:text-[160px] font-black text-gradient-primary leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-card flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            Sepertinya halaman yang kamu cari sudah dipindahkan, dihapus, atau belum pernah ada.
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-3 gap-3">
          {suggestions.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  )
}
