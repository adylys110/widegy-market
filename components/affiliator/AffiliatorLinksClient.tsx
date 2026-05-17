'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2, Search, Plus, Copy, ExternalLink, Trash2,
  MousePointerClick, TrendingUp, DollarSign, ToggleLeft,
  ToggleRight, Loader2, X, CheckCircle2, Package, Filter
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Kursus',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D', OTHER: 'Lainnya',
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

function CreateLinkModal({ products, referralCode, onClose, onSuccess }: {
  products: any[]; referralCode: string; onClose: () => void; onSuccess: (link: any) => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (CATEGORY_LABELS[p.category] ?? p.category).toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!selected) { toast.error('Pilih produk terlebih dahulu'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/affiliates/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal membuat link')
      }
      const data = await res.json()
      toast.success('Link affiliasi berhasil dibuat!')
      onSuccess(data.link)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-foreground">Buat Link Affiliasi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pilih produk yang ingin kamu promosikan</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Package className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold">Tidak ada produk ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">Semua produk aktif sudah dibuat linknya</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id}
              onClick={() => setSelected(selected?.id === p.id ? null : p)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                selected?.id === p.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/20'
              )}>
              <img src={p.thumbnail} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                <p className="text-[10px] text-muted-foreground">{p.seller?.storeName} · {CATEGORY_LABELS[p.category] ?? p.category}</p>
                <p className="text-xs font-bold text-primary mt-0.5">{formatCurrency(p.price)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">Komisi</p>
                <p className="text-sm font-bold text-green-600">{((p.commissionRate ?? 0.1) * 100).toFixed(0)}%</p>
                {selected?.id === p.id && <CheckCircle2 className="w-4 h-4 text-primary mt-1 ml-auto" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
            Batal
          </button>
          <button onClick={handleCreate} disabled={!selected || loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Buat Link
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function LinkCard({ link, onToggle, onDelete, baseUrl }: {
  link: any; onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void; baseUrl: string
}) {
  const [copied, setCopied] = useState(false)
  const affLink = `${baseUrl}/go/${link.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(affLink)
    setCopied(true)
    toast.success('Link disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  const convRate = link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : '0'

  return (
    <motion.div variants={itemVariants}
      className="bg-white rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all hover:shadow-card group">
      <div className="flex items-start gap-4 p-5">
        <img src={link.product.thumbnail} alt={link.product.title}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-muted" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-foreground line-clamp-1">{link.product.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {CATEGORY_LABELS[link.product.category] ?? link.product.category} · {formatCurrency(link.product.price)}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onToggle(link.id, !link.isActive)}
                className={cn('p-1.5 rounded-lg transition-colors',
                  link.isActive ? 'text-green-500 hover:bg-green-50' : 'text-muted-foreground hover:bg-muted')}>
                {link.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => onDelete(link.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span className="font-semibold text-foreground">{link.clicks.toLocaleString()}</span> klik
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-semibold text-foreground">{link.conversions}</span> konversi
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3.5 h-3.5 text-green-500" />
              <span className="font-semibold text-green-600">{formatCurrency(link.earnings)}</span>
            </div>
            <span className={cn('ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
              link.isActive ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground')}>
              {link.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          {/* Link URL */}
          <div className="mt-3 flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
            <p className="text-[10px] font-mono text-muted-foreground flex-1 truncate">{affLink}</p>
            <button onClick={copyLink}
              className={cn('p-1 rounded transition-colors flex-shrink-0',
                copied ? 'text-green-500' : 'text-muted-foreground hover:text-primary')}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a href={affLink} target="_blank" rel="noopener noreferrer"
              className="p-1 rounded text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Conv rate */}
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.min(parseFloat(convRate), 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold">{convRate}% conv</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AffiliatorLinksClient({ data }: { data: any }) {
  const [links, setLinks] = useState<any[]>(data.links)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [availableProducts, setAvailableProducts] = useState<any[]>(data.availableProducts)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://widegy.com'

  const filtered = links.filter(l => {
    const matchSearch = l.product.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || (filter === 'active' ? l.isActive : !l.isActive)
    return matchSearch && matchFilter
  })

  const handleSuccess = (newLink: any) => {
    setLinks(prev => [newLink, ...prev])
    setAvailableProducts(prev => prev.filter(p => p.id !== newLink.productId))
  }

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/affiliates/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: active }),
      })
      if (!res.ok) throw new Error()
      setLinks(prev => prev.map(l => l.id === id ? { ...l, isActive: active } : l))
      toast.success(active ? 'Link diaktifkan' : 'Link dinonaktifkan')
    } catch {
      toast.error('Gagal mengubah status link')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus link ini?')) return
    try {
      const res = await fetch(`/api/affiliates/links/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      const deletedLink = links.find(l => l.id === id)
      setLinks(prev => prev.filter(l => l.id !== id))
      if (deletedLink) {
        setAvailableProducts(prev => [...prev, deletedLink.product])
      }
      toast.success('Link dihapus')
    } catch {
      toast.error('Gagal menghapus link')
    }
  }

  const totalStats = links.reduce((acc, l) => ({
    clicks: acc.clicks + l.clicks,
    conversions: acc.conversions + l.conversions,
    earnings: acc.earnings + l.earnings,
  }), { clicks: 0, conversions: 0, earnings: 0 })

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Link Affiliasi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola dan pantau performa link promosi kamu</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
          <Plus className="w-4 h-4" /> Buat Link
        </button>
      </motion.div>

      {/* Summary mini cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Klik', value: totalStats.clicks.toLocaleString(), icon: MousePointerClick, color: 'text-primary' },
          { label: 'Konversi', value: totalStats.conversions.toLocaleString(), icon: TrendingUp, color: 'text-secondary' },
          { label: 'Total Komisi', value: formatCurrency(totalStats.earnings), icon: DollarSign, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <Icon className={cn('w-5 h-5 mx-auto mb-1.5', color)} />
            <p className="text-lg font-display font-extrabold text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-2 rounded-xl text-xs font-bold transition-all',
                filter === f ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary')}>
              {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Links List */}
      {filtered.length === 0 ? (
        <motion.div variants={itemVariants}
          className="flex flex-col items-center py-16 text-center bg-white rounded-2xl border border-border">
          <Link2 className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-base font-bold text-foreground mb-1">Belum ada link</p>
          <p className="text-sm text-muted-foreground mb-4">Buat link affiliasi pertama kamu sekarang!</p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Buat Link Pertama
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map(link => (
            <LinkCard key={link.id} link={link} baseUrl={baseUrl}
              onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateLinkModal
            products={availableProducts}
            referralCode={data.referralCode}
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
