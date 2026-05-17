'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Camera, Loader2,
  Shield, Bell, Lock,
  Edit3, X, Check, ChevronRight,
  Eye, EyeOff, CheckCircle2, AlertCircle,
  LogOut, Settings
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────
type OverlayType = 'profile' | 'security' | 'notifications' | null

// ── Overlay Wrapper ───────────────────────────────────────────────
function OverlayPanel({
  open, onClose, title, children
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white sticky top-0 z-10">
              <h2 className="font-display font-bold text-lg text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Edit Profile Overlay ──────────────────────────────────────────
function EditProfileOverlay({ user, onClose }: { user: any; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>(user?.image ?? '')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = () => {
    setError('')
    startTransition(async () => {
      try {
        let photoUrl = user?.image ?? ''
        if (photoFile) {
          const fd = new FormData()
          fd.append('file', photoFile)
          const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
          if (upRes.ok) {
            const { url } = await upRes.json()
            photoUrl = url
          }
        }
        const res = await fetch('/api/users/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, image: photoUrl }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Gagal menyimpan profil')
          return
        }
        setSaved(true)
        setTimeout(() => { setSaved(false); onClose() }, 1500)
      } catch {
        setError('Terjadi kesalahan. Coba lagi.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-border bg-gradient-primary flex items-center justify-center">
            {photoPreview ? (
              <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{getInitials(form.name || 'U')}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <p className="text-xs text-muted-foreground">Klik ikon kamera untuk ganti foto</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-2.5 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2.5 rounded-xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Profil berhasil disimpan!
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" /> Nama Lengkap
          </label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:outline-none text-sm bg-muted/30 focus:bg-white transition-colors"
            placeholder="Nama lengkap kamu"
          />
        </div>

        {/* Email readonly */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email
          </label>
          <div className="relative">
            <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-xl">{user?.email}</p>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-md">Terverifikasi</span>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Nomor Telepon
          </label>
          <input
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:outline-none text-sm bg-muted/30 focus:bg-white transition-colors"
            placeholder="08xxxxxxxxxx" type="tel"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:outline-none text-sm bg-muted/30 focus:bg-white transition-colors resize-none"
            placeholder="Ceritakan sedikit tentang dirimu..." rows={3} maxLength={200}
          />
          <p className="text-[10px] text-muted-foreground text-right">{form.bio.length}/200</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )
}

// ── Security Overlay ──────────────────────────────────────────────
function SecurityOverlay({ onClose }: { onClose: () => void }) {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwPending, setPwPending] = useState(false)

  const handlePasswordChange = async () => {
    setPwError('')
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('Semua field harus diisi'); return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Password baru tidak cocok'); return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password minimal 8 karakter'); return
    }
    setPwPending(true)
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        setPwError(data.error ?? 'Gagal mengubah password')
        return
      }
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => { setPwSuccess(false); onClose() }, 2000)
    } catch {
      setPwError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPwPending(false)
    }
  }

  return (
    <div className="space-y-5">
      {pwError && (
        <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-2.5 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
        </div>
      )}
      {pwSuccess && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2.5 rounded-xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Password berhasil diubah!
        </div>
      )}
      {([
        { key: 'current', label: 'Password Saat Ini', field: 'currentPassword' },
        { key: 'new', label: 'Password Baru', field: 'newPassword' },
        { key: 'confirm', label: 'Konfirmasi Password Baru', field: 'confirmPassword' },
      ] as const).map(({ key, label, field }) => (
        <div key={field} className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">{label}</label>
          <div className="relative">
            <input
              type={showPw[key] ? 'text' : 'password'}
              value={pwForm[field]}
              onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border focus:border-primary/50 focus:outline-none text-sm transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={handlePasswordChange}
        disabled={pwPending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {pwPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
        Ubah Password
      </button>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-bold text-destructive mb-2">Zona Berbahaya</h4>
        <p className="text-xs text-muted-foreground mb-3">Tindakan ini tidak dapat dibatalkan.</p>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-sm font-semibold text-destructive border border-destructive/30 px-4 py-2.5 rounded-xl hover:bg-destructive hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" /> Keluar dari Semua Perangkat
        </button>
      </div>
    </div>
  )
}

// ── Notifications Overlay ─────────────────────────────────────────
function NotificationsOverlay({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState({
    orderUpdates: true, promotions: false, newProducts: true, newsletter: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800)) // simulate save
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Pilih jenis notifikasi yang ingin kamu terima.</p>
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2.5 rounded-xl text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Preferensi disimpan!
        </div>
      )}
      <div className="space-y-3">
        {([
          { key: 'orderUpdates', label: 'Update Pesanan', desc: 'Notif pembayaran, pengiriman, dan selesai' },
          { key: 'promotions', label: 'Promo & Diskon', desc: 'Penawaran eksklusif dan kode kupon' },
          { key: 'newProducts', label: 'Produk Baru', desc: 'Notif produk baru dari seller yang kamu ikuti' },
          { key: 'newsletter', label: 'Newsletter', desc: 'Tips, tutorial, dan update dari Widegy' },
        ] as const).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => setSettings(p => ({ ...p, [key]: !p[key] }))}
              className={cn('w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0', settings[key] ? 'bg-primary' : 'bg-muted')}
            >
              <div className={cn('w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm', settings[key] ? 'left-6' : 'left-1')} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
      </button>
    </div>
  )
}

// ── Menu Item Row ─────────────────────────────────────────────────
function MenuRow({ icon: Icon, label, desc, color, onClick }: {
  icon: React.ElementType; label: string; desc: string; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}

// ── Main Profile Client ───────────────────────────────────────────
export function ProfileClient({ user, profile }: { user: any; profile: any }) {
  const [overlay, setOverlay] = useState<OverlayType>(null)

  return (
    <>
      {/* Overlays */}
      <OverlayPanel open={overlay === 'profile'} onClose={() => setOverlay(null)} title="Edit Profil">
        <EditProfileOverlay user={user} onClose={() => setOverlay(null)} />
      </OverlayPanel>
      <OverlayPanel open={overlay === 'security'} onClose={() => setOverlay(null)} title="Keamanan Akun">
        <SecurityOverlay onClose={() => setOverlay(null)} />
      </OverlayPanel>
      <OverlayPanel open={overlay === 'notifications'} onClose={() => setOverlay(null)} title="Notifikasi">
        <NotificationsOverlay onClose={() => setOverlay(null)} />
      </OverlayPanel>

      {/* Main content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-br from-primary via-[#FF8E53] to-secondary" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-primary flex items-center justify-center shadow-md overflow-hidden">
                  {user?.image ? (
                    <Image src={user.image} alt={user.name ?? ''} fill className="object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{getInitials(user?.name ?? 'U')}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOverlay('profile')}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-colors mb-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profil
              </button>
            </div>

            <div>
              <h2 className="text-lg font-display font-bold text-foreground">{user?.name ?? 'Pengguna'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {profile && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-base font-display font-extrabold text-foreground">{profile.totalOrders}</p>
                    <p className="text-[10px] text-muted-foreground">Pesanan</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-base font-display font-extrabold text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(profile.totalSpent)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Total Belanja</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-base font-display font-extrabold text-foreground">{profile.loyaltyPoints}</p>
                    <p className="text-[10px] text-muted-foreground">Poin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu list */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Pengaturan Akun</h3>
          <MenuRow
            icon={User} label="Edit Profil" color="#FF6B35"
            desc="Ubah nama, foto, nomor telepon, dan bio"
            onClick={() => setOverlay('profile')}
          />
          <MenuRow
            icon={Lock} label="Keamanan" color="#8B5CF6"
            desc="Ubah password dan keamanan akun"
            onClick={() => setOverlay('security')}
          />
          <MenuRow
            icon={Bell} label="Notifikasi" color="#06B6D4"
            desc="Kelola preferensi notifikasi kamu"
            onClick={() => setOverlay('notifications')}
          />
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl border border-destructive/20 p-5">
          <h4 className="text-sm font-bold text-destructive mb-1">Zona Berbahaya</h4>
          <p className="text-xs text-muted-foreground mb-4">Tindakan ini akan mengakhiri sesi kamu.</p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-sm font-semibold text-destructive border border-destructive/30 px-4 py-2.5 rounded-xl hover:bg-destructive hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </motion.div>
    </>
  )
}
