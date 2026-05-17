'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  const [showSplash, setShowSplash] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Cek apakah bukan fullscreen (window width < document width atau bukan full viewport)
    const isNotFullscreen =
      window.innerWidth < window.screen.width * 0.95 ||
      window.innerHeight < window.screen.height * 0.95

    if (isNotFullscreen) {
      setShowSplash(true)
      const timer = setTimeout(() => {
        setSplashDone(true)
        // fade out splash setelah 3 detik
        setTimeout(() => setShowSplash(false), 600)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {/* ── Splash Screen (3 detik, hanya saat bukan fullscreen) ── */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: splashDone ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          >
            <video
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/video1.mp4" type="video/mp4" />
            </video>
            {/* subtle logo overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #F59E0B)' }}>
                <span className="text-white font-black text-sm">⚡</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Widegy</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/video1.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,10,30,0.72) 0%, rgba(20,10,40,0.60) 50%, rgba(10,20,40,0.75) 100%)',
            zIndex: 1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-28 pb-16 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showSplash ? 3.2 : 0 }}
            className="mb-6 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-orange-400/40 bg-white/10 backdrop-blur-md text-sm font-semibold text-orange-300">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Digital Marketplace #1 Indonesia 🇮🇩
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: showSplash ? 3.3 : 0.1 }}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight text-white mb-6"
          >
            Jual & Beli{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Aset Digital
            </span>
            <br />
            Tanpa Batas
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showSplash ? 3.45 : 0.25 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Platform marketplace digital terlengkap — template, UI kit, ilustrasi, plugin,
            dan lebih banyak lagi. Daftar gratis, mulai berjualan dalam hitungan menit.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: showSplash ? 3.6 : 0.38 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%)' }}
            >
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300"
            >
              Lihat Fitur
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: showSplash ? 3.75 : 0.55 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {['#FF6B35', '#06B6D4', '#F59E0B', '#10B981'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs"
                  style={{ background: c }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-white/70 text-sm font-medium">12.000+ pengguna sudah bergabung</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showSplash ? 4 : 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40 font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-orange-400" />
          </motion.div>
        </motion.div>
      </section>
    </>
  )
}
