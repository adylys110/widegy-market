'use client'

import { motion } from 'framer-motion'

const categories = [
  { icon: '🎨', label: 'UI Kit', count: '1.2K+ produk' },
  { icon: '🌐', label: 'Template Web', count: '840+ produk' },
  { icon: '✏️', label: 'Font Premium', count: '650+ produk' },
  { icon: '🖼️', label: 'Ilustrasi', count: '980+ produk' },
  { icon: '⚡', label: 'Icon Pack', count: '420+ produk' },
  { icon: '🔌', label: 'Plugin & Add-on', count: '310+ produk' },
]

export function Categories() {
  return (
    <section id="categories" className="py-24 px-6 bg-[#f8f5f0]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Jelajahi <span style={{ color: '#06B6D4' }}>Kategori</span>
          </h2>
          <p className="text-gray-500">Ribuan produk digital berkualitas tinggi dari seller terpercaya.</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="group bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <p className="font-bold text-gray-900 text-sm mb-1">{cat.label}</p>
              <p className="text-xs text-gray-400">{cat.count}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
