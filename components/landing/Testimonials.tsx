'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Rizky Firmansyah',
    role: 'UI/UX Designer',
    text: 'Widegy benar-benar game changer! Saya berhasil menjual UI kit saya ke 200+ buyer dalam bulan pertama. Platform-nya super mudah digunakan.',
    initial: 'R',
    color: '#FF6B35',
  },
  {
    name: 'Sari Dewi',
    role: 'Frontend Developer',
    text: 'Kualitas produk di Widegy jauh lebih premium dibanding marketplace lain. Template yang saya beli menghemat waktu pengerjaan hingga 60%!',
    initial: 'S',
    color: '#06B6D4',
  },
  {
    name: 'Ahmad Fauzi',
    role: 'Ilustrator Freelance',
    text: 'Program afiliasi Widegy luar biasa. Sudah dapat komisi Rp3 juta hanya dari share link ke komunitas desainer. Pasif income yang menjanjikan!',
    initial: 'A',
    color: '#8B5CF6',
  },
  {
    name: 'Maya Putri',
    role: 'Motion Designer',
    text: 'Proses upload produk sangat cepat dan pembayaran langsung masuk ke saldo. Withdraw ke BCA dalam hitungan jam. Recommended banget!',
    initial: 'M',
    color: '#10B981',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-[#f8f5f0]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold tracking-widest uppercase mb-4">
            ⭐ Dipercaya Ribuan Pengguna
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Apa Kata <span style={{ color: '#FF6B35' }}>Mereka?</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array(5).fill(0).map((_, si) => (
                  <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              {/* Quote mark */}
              <p className="text-4xl font-black leading-none mb-3" style={{ color: `${t.color}30` }}>"</p>
              <p className="text-gray-700 leading-relaxed mb-6 -mt-2">{t.text}</p>
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: t.color }}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
