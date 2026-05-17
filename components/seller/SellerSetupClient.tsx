'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Store, Zap, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"

export function SellerSetupClient({ user }: { user: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    storeName: '',
    storeSlug: '',
    storeDescription: '',
    storeEmail: user?.email ?? '',
    storePhone: '',
    website: '',
  })

  const set = (k: string, v: string) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'storeName') next.storeSlug = slugify(v)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!form.storeName || !form.storeSlug) {
      toast.error('Nama toko wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/seller/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      toast.success('Toko berhasil dibuat!')
      router.push('/seller/dashboard')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal membuat toko')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Upload produk digital tanpa batas',
    'Dashboard analitik real-time',
    'Pembayaran otomatis via Midtrans',
    'Tarik saldo kapan saja',
    'Program affiliasi bawaan',
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-extrabold text-xl text-foreground">Widegy</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-foreground mb-3">
            Buka Toko Digitalmu 🚀
          </h1>
          <p className="text-muted-foreground mb-8">
            Mulai jual aset digital dan raih penghasilan dari passion-mu. Setup dalam 2 menit!
          </p>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl border border-border shadow-card p-8 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-foreground">Setup Toko</h2>
              <p className="text-xs text-muted-foreground">Isi detail toko kamu</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Nama Toko <span className="text-destructive">*</span>
            </label>
            <input value={form.storeName} onChange={e => set('storeName', e.target.value)}
              placeholder="Toko Desain Keren" className={inputCls} />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">URL Toko</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex-shrink-0">widegy.id/store/</span>
              <input value={form.storeSlug} onChange={e => set('storeSlug', e.target.value)}
                placeholder="toko-desain-keren" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Deskripsi Toko</label>
            <textarea value={form.storeDescription}
              onChange={e => set('storeDescription', e.target.value)} rows={3}
              placeholder="Ceritakan tentang tokomu, spesialisasi, dan produk yang kamu jual..."
              className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Email Toko</label>
              <input value={form.storeEmail} onChange={e => set('storeEmail', e.target.value)}
                type="email" placeholder="toko@email.com" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">WhatsApp/HP</label>
              <input value={form.storePhone} onChange={e => set('storePhone', e.target.value)}
                placeholder="08xxxxxxxxxx" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Website (Opsional)</label>
            <input value={form.website} onChange={e => set('website', e.target.value)}
              placeholder="https://portfoliomu.com" className={inputCls} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-glow-primary">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat toko...</>
              : <><Store className="w-4 h-4" /> Buat Toko Sekarang <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </motion.div>
      </div>
    </div>
  )
}
