'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  TrendingUp, CheckCircle, Loader2, ArrowRight,
  Link2, DollarSign, MousePointerClick, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const BENEFITS = [
  { icon: Link2, title: 'Buat Link Unik', desc: 'Generate link khusus untuk setiap produk yang ingin kamu promosikan' },
  { icon: MousePointerClick, title: 'Lacak Performa', desc: 'Pantau klik, konversi, dan pendapatan secara real-time' },
  { icon: DollarSign, title: 'Komisi 10%+', desc: 'Dapatkan komisi dari setiap penjualan melalui link kamu' },
  { icon: Shield, title: 'Pembayaran Aman', desc: 'Tarik komisi kapan saja langsung ke rekening bank kamu' },
]

export function AffiliatorSetupClient({ user }: { user: any }) {
  const router = useRouter()
  const { update } = useSession()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState({
    bankName: '',
    bankAccountName: user?.name?.toUpperCase() ?? '',
    bankAccountNo: '',
  })

  const BANKS = [
    'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata', 'Danamon',
    'Bukopin', 'BTN', 'Maybank', 'OCBC NISP', 'Panin', 'OVO', 'GoPay', 'Dana'
  ]

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.bankAccountName || !formData.bankAccountNo) {
      toast.error('Lengkapi semua data rekening bank')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal mendaftar sebagai affiliator')
      }
      const data = await res.json()
      // Update session dengan role baru (AFFILIATOR)
      if (data.role) await update({ role: data.role })
      toast.success('Pendaftaran berhasil! Selamat datang di program affiliator Widegy.')
      router.push('/affiliator/dashboard')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-border"
        >
          {/* Left panel */}
          <div className="bg-gradient-to-br from-secondary via-[#0ea5e9] to-primary p-8 lg:p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-32 -translate-y-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-24 translate-y-24" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-extrabold text-xl leading-none">Widegy</p>
                  <p className="text-xs text-white/70 font-semibold">Affiliator Program</p>
                </div>
              </div>

              <h1 className="font-display font-extrabold text-3xl lg:text-4xl leading-tight mb-4">
                Hasilkan Uang<br />
                <span className="text-white/80">dari Promosi</span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Bergabunglah dengan program affiliator Widegy dan dapatkan komisi dari setiap produk yang berhasil terjual melalui link kamu.
              </p>

              <div className="space-y-4">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-foreground">Daftar Sebagai Affiliator</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Halo, <strong>{user?.name}</strong>! Satu langkah lagi untuk mulai menghasilkan komisi.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">Proses Review</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Setelah mendaftar, akun kamu akan direview tim kami dalam 1-2 hari kerja. Kamu bisa mulai membuat link setelah disetujui.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Isi data rekening bank untuk pencairan komisi</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Tunggu verifikasi tim Widegy (1-2 hari kerja)</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Mulai buat link dan promosikan produk digital!</p>
                  </div>
                </div>

                <button onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-secondary to-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                  Mulai Daftar <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-foreground">Data Rekening Bank</h2>
                  <p className="text-sm text-muted-foreground mt-1">Untuk pencairan komisi affiliasi kamu</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Bank <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.bankName}
                      onChange={e => setFormData(p => ({ ...p, bankName: e.target.value }))}
                      className={cn('w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
                        !formData.bankName && 'text-muted-foreground/60')}>
                      <option value="" disabled>Pilih bank</option>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Nama Sesuai Rekening <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={formData.bankAccountName}
                      onChange={e => setFormData(p => ({ ...p, bankAccountName: e.target.value.toUpperCase() }))}
                      placeholder="NAMA LENGKAP"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase placeholder:normal-case placeholder:text-muted-foreground/60" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1.5">
                      Nomor Rekening <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={formData.bankAccountNo}
                      onChange={e => setFormData(p => ({ ...p, bankAccountNo: e.target.value }))}
                      placeholder="1234567890" type="text"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
                    Kembali
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-2.5 bg-gradient-to-r from-secondary to-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
