'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const EMPTY_FORM = {
  code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
  minPurchase: '', maxDiscount: '', usageLimit: '', expiresAt: '',
}

export function AdminCouponsClient({ data }: { data: any }) {
  const [coupons, setCoupons] = useState(data.coupons)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const createCoupon = async () => {
    if (!form.code || !form.discountValue) return toast.error('Isi kode dan nilai diskon')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountValue: parseFloat(form.discountValue),
          minPurchase: parseFloat(form.minPurchase) || 0,
          maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
          expiresAt: form.expiresAt || null,
        }),
      })
      if (res.ok) {
        const d = await res.json()
        setCoupons((prev: any[]) => [d.coupon, ...prev])
        setForm(EMPTY_FORM)
        setShowForm(false)
        toast.success('Kupon berhasil dibuat!')
      } else {
        const e = await res.json()
        toast.error(e.error ?? 'Gagal membuat kupon')
      }
    } finally { setLoading(false) }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) {
      setCoupons((prev: any[]) => prev.map(c => c.id === id ? { ...c, isActive: !isActive } : c))
      toast.success(isActive ? 'Kupon dinonaktifkan' : 'Kupon diaktifkan')
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Yakin hapus kupon ini?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCoupons((prev: any[]) => prev.filter(c => c.id !== id))
      toast.success('Kupon dihapus')
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> Kelola Kupon
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{coupons.length} kupon terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Buat Kupon
        </button>
      </motion.div>

      {/* Create form */}
      {showForm && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-display font-bold text-foreground">Buat Kupon Baru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k: 'code', l: 'Kode Kupon *', t: 'text', p: 'WELCOME10' },
              { k: 'description', l: 'Deskripsi', t: 'text', p: 'Diskon untuk member baru' },
              { k: 'discountValue', l: `Nilai Diskon ${form.discountType === 'PERCENTAGE' ? '(%)' : '(Rp)'} *`, t: 'number', p: '10' },
              { k: 'minPurchase', l: 'Minimum Pembelian (Rp)', t: 'number', p: '0' },
              { k: 'maxDiscount', l: 'Maksimum Diskon (Rp)', t: 'number', p: 'Opsional' },
              { k: 'usageLimit', l: 'Batas Penggunaan', t: 'number', p: 'Tidak terbatas' },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{f.l}</label>
                <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.p}
                  className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Tipe Diskon</label>
              <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Berlaku Hingga</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={createCoupon} disabled={loading}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {loading ? 'Membuat...' : 'Buat Kupon'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
              Batal
            </button>
          </div>
        </motion.div>
      )}

      {/* Coupons table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Diskon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Penggunaan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">Belum ada kupon</td></tr>
              ) : coupons.map((c: any) => (
                <tr key={c.id} className={cn('hover:bg-muted/20 transition-colors', !c.isActive && 'opacity-60')}>
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-foreground">{c.code}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-foreground">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                    </p>
                    {c.minPurchase > 0 && <p className="text-xs text-muted-foreground">Min: {formatCurrency(c.minPurchase)}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-foreground">{c.usageCount} / {c.usageLimit ?? '∞'}</p>
                    {c.expiresAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="w-3 h-3" /> {formatDate(c.expiresAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {c.isActive ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleActive(c.id, c.isActive)}
                        className={cn('p-1.5 rounded-lg transition-colors',
                          c.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50')}>
                        {c.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteCoupon(c.id)}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
