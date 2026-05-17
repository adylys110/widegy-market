import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Masuk ke Widegy',
    template: '%s | Widegy',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero bg-gradient-mesh flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-primary relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-primary text-lg">
              W
            </div>
            <span className="text-white font-bold text-2xl">Widegy</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
              Digital Marketplace
            </p>
            <h2 className="text-white font-bold text-4xl leading-tight">
              Satu platform,<br />
              ribuan aset digital<br />
              berkualitas tinggi.
            </h2>
          </div>
          <p className="text-white/70 text-base max-w-sm">
            Temukan template, UI kit, ilustrasi, dan aset kreatif terbaik dari seller terpercaya seluruh Indonesia.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-4">
            {[
              { value: '10K+', label: 'Produk' },
              { value: '5K+', label: 'Seller' },
              { value: '50K+', label: 'Pembeli' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-white font-bold text-2xl">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Widegy. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-base">
                W
              </div>
              <span className="text-foreground font-bold text-xl">Widegy</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
