'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 px-6 bg-[#f8f5f0]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl overflow-hidden text-center p-16"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 60%, #FBBF24 100%)' }}
        >
          <p className="text-white/80 text-sm font-bold tracking-widest uppercase mb-4">✨ Daftar gratis, no kartu kredit</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            Siap Memulai Perjalanan<br />Digitalmu?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Bergabung bersama 12.000+ pengguna yang sudah mempercayai Widegy. Beli, jual, dan hasilkan lebih banyak dari aset digitalmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white font-bold text-base shadow-xl hover:scale-105 transition-all duration-300"
              style={{ color: '#FF6B35' }}
            >
              Daftar Sekarang — Gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all duration-300"
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
