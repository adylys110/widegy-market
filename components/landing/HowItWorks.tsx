'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, ShoppingCart, Download } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Daftar Gratis',
    desc: 'Buat akun Widegy dalam hitungan detik. Tidak perlu kartu kredit — langsung bisa mulai eksplorasi.',
    color: '#FF6B35',
    bg: '#FFF4EF',
  },
  {
    num: '02',
    icon: Search,
    title: 'Temukan Produk',
    desc: 'Jelajahi ribuan aset digital premium. Filter by kategori, harga, rating, dan lebih banyak lagi.',
    color: '#06B6D4',
    bg: '#EFF9FB',
  },
  {
    num: '03',
    icon: ShoppingCart,
    title: 'Bayar Mudah',
    desc: 'Checkout aman dengan 10+ metode pembayaran — transfer bank, QRIS, GoPay, OVO, Dana, dan kartu kredit.',
    color: '#F59E0B',
    bg: '#FFFBEF',
  },
  {
    num: '04',
    icon: Download,
    title: 'Download Instan',
    desc: 'Pembayaran berhasil? Produkmu langsung bisa didownload. Tidak perlu menunggu konfirmasi manual.',
    color: '#10B981',
    bg: '#EFFBF6',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold tracking-widest uppercase mb-4">
            Cara Kerja
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Mulai dalam <span style={{ color: '#FF6B35' }}>4 Langkah</span>
          </h2>
          <p className="text-gray-500 mt-4">Proses yang sederhana dan cepat — dari daftar hingga download dalam hitungan menit.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="relative p-7 rounded-3xl border border-gray-100 bg-[#f8f5f0] hover:shadow-lg transition-all duration-300"
            >
              {/* Step number */}
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: step.color }}>
                LANGKAH {step.num}
              </p>
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: step.bg }}>
                <step.icon className="w-6 h-6" style={{ color: step.color }} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>

              {/* Connector arrow (except last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6 text-gray-300 text-xl z-10">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
