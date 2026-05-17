'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    role: 'Buyer',
    emoji: '🛒',
    desc: 'Untuk pembeli aset digital',
    price: 'Gratis',
    sub: 'Selamanya, tanpa biaya tersembunyi',
    features: [
      'Akses ribuan produk digital',
      'Download instan setelah bayar',
      '10+ metode pembayaran',
      'Riwayat pembelian lengkap',
      'Support via email',
    ],
    color: '#06B6D4',
    featured: false,
  },
  {
    role: 'Seller',
    emoji: '🏪',
    desc: 'Untuk penjual aset digital',
    price: 'Gratis',
    sub: 'Selamanya, tanpa biaya tersembunyi',
    features: [
      'Semua fitur Buyer',
      'Upload produk unlimited',
      'Dashboard analytics real-time',
      'Komisi 85% per transaksi',
      'Penarikan saldo otomatis',
      'Badge Seller Verified',
    ],
    color: '#FF6B35',
    featured: true,
  },
  {
    role: 'Affiliator',
    emoji: '🤝',
    desc: 'Untuk penghasil passive income',
    price: 'Gratis',
    sub: 'Selamanya, tanpa biaya tersembunyi',
    features: [
      'Semua fitur Buyer',
      'Link afiliasi unik per produk',
      'Komisi 10% per referral',
      'Dashboard komisi real-time',
      'Laporan klik & konversi',
    ],
    color: '#8B5CF6',
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold tracking-widest uppercase mb-4">
            Semua gratis, selalu
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            Pilih <span style={{ color: '#FF6B35' }}>Peranmu</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Widegy gratis untuk semua peran. Mulai sebagai buyer, upgrade ke seller atau affiliator kapan saja.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative rounded-3xl p-8 border-2 transition-all duration-300 ${
                plan.featured
                  ? 'bg-gradient-to-b from-orange-50 to-white shadow-2xl scale-105'
                  : 'bg-[#f8f5f0] border-transparent hover:shadow-lg'
              }`}
              style={{ borderColor: plan.featured ? plan.color : 'transparent' }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-5 py-1.5 rounded-full text-white text-xs font-bold shadow-lg"
                    style={{ background: plan.color }}>
                    Paling Populer
                  </span>
                </div>
              )}

              <div className="text-3xl mb-3">{plan.emoji}</div>
              <h3 className="font-extrabold text-2xl text-gray-900 mb-1">{plan.role}</h3>
              <p className="text-gray-400 text-sm mb-5">{plan.desc}</p>
              <p className="text-3xl font-black mb-1" style={{ color: plan.color }}>{plan.price}</p>
              <p className="text-xs text-gray-400 mb-7">{plan.sub}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block w-full py-3 rounded-2xl text-center font-bold text-sm transition-all duration-300 hover:scale-105"
                style={
                  plan.featured
                    ? { background: `linear-gradient(135deg, ${plan.color}, #F59E0B)`, color: 'white' }
                    : { background: 'white', color: plan.color, border: `1.5px solid ${plan.color}20` }
                }
              >
                Mulai Gratis
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Bergabung gratis, upgrade peranmu kapan saja dari dashboard. Tidak ada komitmen jangka panjang.
        </p>
      </div>
    </section>
  )
}
