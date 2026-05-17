'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, CheckCircle2, XCircle, Clock, AlertCircle, X } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',    color: '#F59E0B', bg: '#FFFBEB' },
  APPROVED:   { label: 'Disetujui', color: '#06B6D4', bg: '#ECFEFF' },
  PROCESSING: { label: 'Diproses',  color: '#8B5CF6', bg: '#F5F3FF' },
  COMPLETED:  { label: 'Selesai',   color: '#10B981', bg: '#ECFDF5' },
  REJECTED:   { label: 'Ditolak',   color: '#EF4444', bg: '#FEF2F2' },
}

type RejectModal = { id: string; amount: number; name: string } | null

export function AdminWithdrawalsClient({ data }: { data: any }) {
  const [withdrawals, setWithdrawals] = useState(data.withdrawals)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [rejectModal, setRejectModal] = useState<RejectModal>(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setLoading(id)
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
    setLoading(null)
    if (res.ok) {
      setWithdrawals((prev: any[]) => prev.map(w => w.id === id ? { ...w, status } : w))
      toast.success(`Status diperbarui: ${STATUS_CONFIG[status]?.label ?? status}`)
      return true
    } else {
      toast.error('Gagal memperbarui status')
      return false
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectModal) return
    const ok = await updateStatus(rejectModal.id, 'REJECTED', rejectNotes)
    if (ok) {
      setRejectModal(null)
      setRejectNotes('')
    }
  }

  const filtered = statusFilter === 'ALL'
    ? withdrawals
    : withdrawals.filter((w: any) => w.status === statusFilter)

  const totalPending = withdrawals
    .filter((w: any) => w.status === 'PENDING')
    .reduce((s: number, w: any) => s + w.amount, 0)

  const pendingCount = withdrawals.filter((w: any) => w.status === 'PENDING').length

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Kelola Penarikan
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pendingCount} pending · Total: {formatCurrency(totalPending)}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="ALL">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = withdrawals.filter((w: any) => w.status === status).length
          const total = withdrawals.filter((w: any) => w.status === status).reduce((s: number, w: any) => s + w.amount, 0)
          return (
            <motion.div key={status} variants={itemVariants}
              className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-xl font-display font-extrabold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(total)}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pemohon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jumlah</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rekening</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    Tidak ada penarikan ditemukan
                  </td>
                </tr>
              ) : filtered.map((w: any) => {
                const st = STATUS_CONFIG[w.status] ?? STATUS_CONFIG['PENDING']
                const name = w.seller?.storeName ?? w.affiliator?.user?.name ?? 'Unknown'
                const type = w.sellerId ? 'Seller' : 'Affiliator'
                const isLoading = loading === w.id
                return (
                  <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{name}</p>
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              color: type === 'Seller' ? '#10B981' : '#8B5CF6',
                              backgroundColor: type === 'Seller' ? '#ECFDF5' : '#F5F3FF'
                            }}>
                            {type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-lg text-foreground">{formatCurrency(w.amount)}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-foreground">{w.bankName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{w.bankAccountNo}</p>
                      <p className="text-xs text-muted-foreground">{w.bankAccountName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(w.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {w.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateStatus(w.id, 'APPROVED')}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                              title="Setujui">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRejectModal({ id: w.id, amount: w.amount, name })}
                              disabled={isLoading}
                              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                              title="Tolak">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {w.status === 'APPROVED' && (
                          <button
                            onClick={() => updateStatus(w.id, 'COMPLETED')}
                            disabled={isLoading}
                            className="text-xs font-bold text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg hover:bg-secondary/10 disabled:opacity-50 transition-colors">
                            {isLoading ? '...' : '✓ Selesai'}
                          </button>
                        )}
                        {w.adminNote && (
                          <span className="text-[11px] text-muted-foreground italic max-w-[120px] truncate" title={w.adminNote}>
                            {w.adminNote}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">Tolak Penarikan</h3>
                    <p className="text-xs text-muted-foreground">Dana akan dikembalikan ke saldo</p>
                  </div>
                </div>
                <button onClick={() => setRejectModal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Pemohon</p>
                  <p className="font-semibold text-foreground">{rejectModal.name}</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(rejectModal.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Alasan Penolakan <span className="text-muted-foreground font-normal">(opsional)</span>
                  </label>
                  <textarea
                    value={rejectNotes}
                    onChange={e => setRejectNotes(e.target.value)}
                    placeholder="Contoh: Rekening tidak valid, data tidak sesuai..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRejectConfirm}
                    disabled={loading === rejectModal.id}
                    className="flex-1 py-2.5 bg-destructive text-white rounded-xl text-sm font-bold hover:bg-destructive/90 disabled:opacity-60 transition-colors">
                    {loading === rejectModal.id ? 'Memproses...' : 'Tolak & Kembalikan Dana'}
                  </button>
                  <button
                    onClick={() => { setRejectModal(null); setRejectNotes('') }}
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
