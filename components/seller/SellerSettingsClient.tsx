'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Store, User, CreditCard, Save, Loader2,
  ArrowLeft, CheckCircle2, Building2
} from 'lucide-react'
import Link from 'next/link'
import { cn, slugify } from '@/lib/utils'
import { toast } from 'sonner'

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
const labelCls = "text-sm font-semibold text-foreground block mb-1.5"

const BANKS = [
  'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata', 'Danamon',
  'Bukopin', 'BTN', 'Maybank', 'OCBC NISP', 'Panin', 'OVO', 'GoPay', 'Dana'
]

type Tab = 'store' | 'personal' | 'bank'

export function SellerSettingsClient({ sellerProfile, user }: { sellerProfile: any; user: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('store')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const [storeForm, setStoreForm] = useState({
    storeName: sellerProfile.storeName ?? '',
    storeSlug: sellerProfile.storeSlug ?? '',
    storeDescription: sellerProfile.storeDescription ?? '',
    storeEmail: sellerProfile.storeEmail ?? '',
    storePhone: sellerProfile.storePhone ?? '',
    website: sellerProfile.website ?? '',
  })

  const [personalForm, setPersonalForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  })

  const [bankForm, setBankForm] = useState({
    bankName: sellerProfile.bankName ?? '',
    bankAccountName: sellerProfile.bankAccountName ?? '',
    bankAccountNo: sellerProfile.bankAccountNo ?? '',
  })

  const setStore = (k: string, v: string) => {
    setStoreForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'storeName') next.storeSlug = slugify(v)
      return next
    })
  }

  const handleSave = async () => {
    if (!storeForm.storeName.trim()) {
      toast.error('Nama toko wajib diisi')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...storeForm,
          ...personalForm,
          ...bankForm,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Gagal menyimpan pengaturan')
        return
      }
      setSaved(true)
      toast.success('Pengaturan berhasil disimpan!')
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'store', label: 'Info Toko', icon: Store },
    { id: 'personal', label: 'Profil Personal', icon: User },
    { id: 'bank', label: 'Rekening Bank', icon: CreditCard },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Pengaturan Toko</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola informasi toko dan profil seller kamu</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/60 p-1 rounded-2xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === id
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-border p-6 space-y-5"
      >
        {activeTab === 'store' && (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Informasi Toko</h2>
                <p className="text-xs text-muted-foreground">Detail yang tampil di halaman toko kamu</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Nama Toko <span className="text-destructive">*</span></label>
              <input value={storeForm.storeName} onChange={e => setStore('storeName', e.target.value)}
                placeholder="Nama Toko Kamu" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>URL Toko</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground flex-shrink-0">widegy.id/store/</span>
                <input value={storeForm.storeSlug} onChange={e => setStore('storeSlug', e.target.value)}
                  placeholder="nama-toko" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Deskripsi Toko</label>
              <textarea value={storeForm.storeDescription}
                onChange={e => setStore('storeDescription', e.target.value)}
                rows={3} placeholder="Ceritakan tentang toko kamu..."
                className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email Toko</label>
                <input value={storeForm.storeEmail} onChange={e => setStore('storeEmail', e.target.value)}
                  type="email" placeholder="toko@email.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp/HP</label>
                <input value={storeForm.storePhone} onChange={e => setStore('storePhone', e.target.value)}
                  placeholder="08xxxxxxxxxx" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Website</label>
              <input value={storeForm.website} onChange={e => setStore('website', e.target.value)}
                placeholder="https://portfoliomu.com" className={inputCls} />
            </div>
          </>
        )}

        {activeTab === 'personal' && (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Profil Personal</h2>
                <p className="text-xs text-muted-foreground">Data akun kamu di Widegy</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Nama Lengkap</label>
              <input value={personalForm.name}
                onChange={e => setPersonalForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>No. HP / WhatsApp</label>
              <input value={personalForm.phone}
                onChange={e => setPersonalForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Bio</label>
              <textarea value={personalForm.bio}
                onChange={e => setPersonalForm(p => ({ ...p, bio: e.target.value }))}
                rows={3} placeholder="Ceritakan tentang dirimu..."
                className={`${inputCls} resize-none`} />
            </div>

            <div className="p-3 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground">
                📧 Email: <strong className="text-foreground">{user?.email}</strong>
                <span className="ml-2 text-muted-foreground/70">(tidak bisa diubah)</span>
              </p>
            </div>
          </>
        )}

        {activeTab === 'bank' && (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground">Rekening Bank</h2>
                <p className="text-xs text-muted-foreground">Untuk pencairan saldo penjualan</p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Bank</label>
              <select value={bankForm.bankName}
                onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                className={cn(inputCls, !bankForm.bankName && 'text-muted-foreground/60')}>
                <option value="">Pilih bank</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Nama Sesuai Rekening</label>
              <input value={bankForm.bankAccountName}
                onChange={e => setBankForm(p => ({ ...p, bankAccountName: e.target.value.toUpperCase() }))}
                placeholder="NAMA LENGKAP" className={`${inputCls} uppercase`} />
            </div>

            <div>
              <label className={labelCls}>Nomor Rekening</label>
              <input value={bankForm.bankAccountNo}
                onChange={e => setBankForm(p => ({ ...p, bankAccountNo: e.target.value }))}
                placeholder="1234567890" type="text" className={inputCls} />
            </div>

            {sellerProfile.bankName && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-800 font-medium">Rekening bank sudah tersimpan</p>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={loading}
          className={cn(
            'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300',
            saved
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary/90 shadow-glow-primary',
            loading && 'opacity-70 cursor-not-allowed'
          )}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            : saved
            ? <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</>
            : <><Save className="w-4 h-4" /> Simpan Perubahan</>
          }
        </button>
      </div>
    </div>
  )
}
