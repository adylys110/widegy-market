'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Search, CheckCircle2, XCircle, ChevronLeft,
  ChevronRight, Star, AlertCircle, X
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:          { label: 'Draft',      color: '#94A3B8', bg: '#F1F5F9' },
  PENDING_REVIEW: { label: 'Pending',    color: '#F59E0B', bg: '#FFFBEB' },
  ACTIVE:         { label: 'Aktif',      color: '#10B981', bg: '#ECFDF5' },
  REJECTED:       { label: 'Ditolak',    color: '#EF4444', bg: '#FEF2F2' },
  ARCHIVED:       { label: 'Diarsipkan', color: '#64748B', bg: '#F8FAFC' },
}

type RejectModal = { productId: string; title: string } | null

export function AdminProductsClient({ data }: { data: any }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [, startTransition] = useTransition()
  const [products, setProducts] = useState(data.products)
  const [total, setTotal] = useState(data.total)
  const [rejectModal, setRejectModal] = useState<RejectModal>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  const perPage = 15
  const totalPages = Math.ceil(total / perPage)

  const fetchProducts = async (s: string, status: string, pg: number) => {
    const params = new URLSearchParams({ search: s, status, page: String(pg), perPage: String(perPage) })
    const res = await fetch(`/api/admin/products?${params}`)
    const d = await res.json()
    setProducts(d.products)
    setTotal(d.total)
  }

  const updateProductStatus = async (productId: string, status: string, reason?: string) => {
    const res = await fetch(`/api/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason }),
    })
    return res.ok
  }

  const handleApprove = async (productId: string) => {
    const ok = await updateProductStatus(productId, 'ACTIVE')
    if (ok) {
      setProducts((prev: any[]) => prev.map(p => p.id === productId ? { ...p, status: 'ACTIVE' } : p))
      toast.success('Produk disetujui! 🎉')
    } else {
      toast.error('Gagal menyetujui produk')
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    setRejectLoading(true)
    const ok = await updateProductStatus(rejectModal.productId, 'REJECTED', rejectReason)
    if (ok) {
      setProducts((prev: any[]) => prev.map(p =>
        p.id === rejectModal.productId ? { ...p, status: 'REJECTED' } : p
      ))
      toast.success('Produk ditolak')
      setRejectModal(null)
      setRejectReason('')
    } else {
      toast.error('Gagal menolak produk')
    }
    setRejectLoading(false)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" /> Kelola Produk
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Total {total.toLocaleString('id-ID')} produk</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value); setPage(1)
              startTransition(() => fetchProducts(e.target.value, statusFilter, 1))
            }}
            placeholder="Cari produk atau seller..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); startTransition(() => fetchProducts(search, e.target.value, 1)) }}
          className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Semua Status</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="ACTIVE">Aktif</option>
          <option value="REJECTED">Ditolak</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produk</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seller</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Harga</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : products.map((p: any) => {
                const st = STATUS_CONFIG[p.status] ?? STATUS_CONFIG['DRAFT']
                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt={p.title}
                            className="w-10 h-10 rounded-xl object-cover bg-muted flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground line-clamp-1 max-w-[200px]">{p.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[11px] text-muted-foreground">
                              {p.rating.toFixed(1)} · {p.totalSales} terjual
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{p.seller?.storeName ?? '-'}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {p.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              onClick={() => handleApprove(p.id)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Setujui">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectModal({ productId: p.id, title: p.title })}
                              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                              title="Tolak">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {p.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateProductStatus(p.id, 'ARCHIVED').then(ok => {
                              if (ok) {
                                setProducts((prev: any[]) => prev.map(pr => pr.id === p.id ? { ...pr, status: 'ARCHIVED' } : pr))
                                toast.success('Produk diarsipkan')
                              }
                            })}
                            className="text-xs font-semibold text-muted-foreground border border-border px-2.5 py-1 rounded-lg hover:bg-muted transition-colors">
                            Arsipkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { const pg = page - 1; setPage(pg); startTransition(() => fetchProducts(search, statusFilter, pg)) }}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i
                if (pg > totalPages) return null
                return (
                  <button key={pg}
                    onClick={() => { setPage(pg); startTransition(() => fetchProducts(search, statusFilter, pg)) }}
                    className={cn('w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                      pg === page ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground')}>
                    {pg}
                  </button>
                )
              })}
              <button
                onClick={() => { const pg = page + 1; setPage(pg); startTransition(() => fetchProducts(search, statusFilter, pg)) }}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Tolak Produk</h3>
                    <p className="text-xs text-muted-foreground">Seller akan mendapat notifikasi</p>
                  </div>
                </div>
                <button onClick={() => setRejectModal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Produk: <span className="font-semibold text-foreground">"{rejectModal.title}"</span>
                </p>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Alasan Penolakan <span className="text-muted-foreground font-normal">(opsional)</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Contoh: Konten tidak sesuai guidelines, gambar preview kurang jelas, deskripsi tidak lengkap..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRejectConfirm}
                    disabled={rejectLoading}
                    className="flex-1 py-2.5 bg-destructive text-white rounded-xl text-sm font-bold hover:bg-destructive/90 disabled:opacity-60 transition-colors">
                    {rejectLoading ? 'Memproses...' : 'Tolak Produk'}
                  </button>
                  <button
                    onClick={() => { setRejectModal(null); setRejectReason('') }}
                    className="px-5 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
