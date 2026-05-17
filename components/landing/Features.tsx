'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, BarChart2, Link2, Shield, Zap, CreditCard } from 'lucide-react'

const features = [
  {
    icon: ShoppingBag,
    title: 'Marketplace Lengkap',
    desc: 'Beli ribuan produk digital — template, UI kit, font, icon pack, dan aset kreatif premium lainnya.',
    color: '#FF6B35',
  },
  {
    icon: BarChart2,
    title: 'Dashboard Seller Pro',
    desc: 'Analitik penjualan real-time, manajemen produk, dan penarikan saldo mudah ke rekening bank.',
    color: '#06B6D4',
  },
  {
    icon: Link2,
    title: 'Program Afiliasi',
    desc: 'Hasilkan komisi dari setiap referral. Bagikan link unikmu dan pantau komisi secara real-time.',
    color: '#8B5CF6',
  },
  {
    icon: Shield,
    title: 'Transaksi Aman',
    desc: 'Pembayaran diproses via Midtrans. Dana seller tersimpan aman dengan sistem escrow otomatis.',
    color: '#10B981',
  },
  {
    icon: Zap,
    title: 'Download Instan',
    desc: 'Setelah pembayaran berhasil, download produkmu langsung — tanpa antrian, tanpa delay.',
    color: '#F59E0B',
  },
  {
    icon: CreditCard,
    title: 'Banyak Metode Bayar',
    desc: 'Transfer bank, QRIS, GoPay, OVO, Dana, kartu kredit — semua tersedia dalam satu checkout.',
    color: '#EF4444',
  },
]

const stats = [
  { value: '12K+', label: 'Pengguna Aktif' },
  { value: '5K+', label: 'Produk Digital' },
  { value: '4.9', label: 'Rating Rata-rata' },
  { value: 'Rp2M+', label: 'Total Penjualan' },
]

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }
}

export function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20 p-8 rounded-3xl bg-[#f8f5f0]">
          {stats.map((s, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)} className="text-center">
              <p className="text-3xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold tracking-widest uppercase mb-4">
            Semua yang kamu butuhkan
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Fitur <span style={{ color: '#FF6B35' }}>Lengkap</span> untuk Semua
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Dari buyer hingga seller dan affiliator — Widegy hadir dengan fitur komprehensif yang dirancang untuk memaksimalkan pengalaman digitalmu.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.07)}
              className="group p-7 rounded-3xl bg-[#f8f5f0] hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-100 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${f.color}18` }}
              >
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
