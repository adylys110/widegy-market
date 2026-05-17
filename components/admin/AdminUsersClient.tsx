'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Store, Link2, Ban, CheckCircle2,
  ChevronLeft, ChevronRight, Shield, X, Clock, AlertTriangle
} from 'lucide-react'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { toast } from 'sonner'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  BUYER:      { label: 'Buyer',      color: '#FF6B35', bg: '#FFF4EF', icon: Users },
  SELLER:     { label: 'Seller',     color: '#10B981', bg: '#ECFDF5', icon: Store },
  AFFILIATOR: { label: 'Affiliator', color: '#8B5CF6', bg: '#F5F3FF', icon: Link2 },
  ADMIN:      { label: 'Admin',      color: '#EF4444', bg: '#FEF2F2', icon: Shield },
}

const BAN_DURATION_OPTIONS = [
  { label: '1 Hari',    value: 1 },
  { label: '3 Hari',    value: 3 },
  { label: '7 Hari',    value: 7 },
  { label: '14 Hari',   value: 14 },
  { label: '30 Hari',   value: 30 },
  { label: 'Permanen',  value: 0 },
]

// ── Ban Modal ─────────────────────────────────────────────────────
function BanModal({
  user, onClose, onConfirm,
}: {
  user: any; onClose: () => void; onConfirm: (reason: string, days: number) => void
}) {
  const [reason, setReason] = useState('')
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!reason.trim()) { toast.error('Masukkan alasan penangguhan'); return }
    setLoading(true)
    await onConfirm(reason.trim(), days)
    setLoading(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Tangguhkan Akun</h3>
                <p className="text-xs text-muted-foreground">{user?.name} · {user?.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Durasi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Durasi Penangguhan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BAN_DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className={cn(
                      'py-2 rounded-xl text-xs font-semibold border-2 transition-all',
                      days === opt.value
                        ? 'border-destructive bg-destructive text-white'
                        : 'border-border text-muted-foreground hover:border-destructive/40'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {days > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Akun akan aktif kembali otomatis setelah {days} hari
                </p>
              )}
              {days === 0 && (
                <p className="text-[11px] text-destructive font-semibold">
                  ⚠️ Akun tidak akan aktif sampai admin membuka ban secara manual
                </p>
              )}
            </div>

            {/* Alasan */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Alasan Penangguhan</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Jelaskan alasan penangguhan akun ini..."
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-destructive/50 focus:outline-none text-sm resize-none bg-muted/30"
                rows={3}
                maxLength={300}
              />
              <p className="text-[10px] text-muted-foreground text-right">{reason.length}/300</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
              Batal
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Tangguhkan'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Component ─────────────────────────────────────────────────
export function AdminUsersClient({ data }: { data: any }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [users, setUsers] = useState(data.users)
  const [total, setTotal] = useState(data.total)
  const [banTarget, setBanTarget] = useState<any>(null) // user yang mau di-ban

  const perPage = 15
  const totalPages = Math.ceil(total / perPage)

  const fetchUsers = async (s: string, role: string, status: string, pg: number) => {
    const params = new URLSearchParams({ search: s, role, status, page: String(pg), perPage: String(perPage) })
    const res = await fetch(`/api/admin/users?${params}`)
    const d = await res.json()
    setUsers(d.users)
    setTotal(d.total)
  }

  const handleSearch = (v: string) => {
    setSearch(v); setPage(1)
    startTransition(() => fetchUsers(v, roleFilter, statusFilter, 1))
  }
  const handleRole = (v: string) => {
    setRoleFilter(v); setPage(1)
    startTransition(() => fetchUsers(search, v, statusFilter, 1))
  }
  const handleStatus = (v: string) => {
    setStatusFilter(v); setPage(1)
    startTransition(() => fetchUsers(search, roleFilter, v, 1))
  }
  const handlePage = (pg: number) => {
    setPage(pg)
    startTransition(() => fetchUsers(search, roleFilter, statusFilter, pg))
  }

  // Ban dengan alasan & durasi
  const handleBanConfirm = async (reason: string, days: number) => {
    const userId = banTarget.id
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: true, banReason: reason, banDurationDays: days }),
    })
    if (res.ok) {
      setUsers((prev: any[]) => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u))
      toast.success(`Akun ${banTarget.name} berhasil ditangguhkan`)
      setBanTarget(null)
    } else {
      toast.error('Gagal menangguhkan akun')
    }
  }

  // Unban langsung tanpa modal
  const handleUnban = async (userId: string, userName: string) => {
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: false }),
    })
    if (res.ok) {
      setUsers((prev: any[]) => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u))
      toast.success(`Akun ${userName} dipulihkan`)
    } else {
      toast.error('Gagal memulihkan akun')
    }
  }

  return (
    <>
      {/* Ban modal */}
      {banTarget && (
        <BanModal
          user={banTarget}
          onClose={() => setBanTarget(null)}
          onConfirm={handleBanConfirm}
        />
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Manajemen Pengguna
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Total {total.toLocaleString('id-ID')} pengguna terdaftar</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select value={roleFilter} onChange={e => handleRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="ALL">Semua Role</option>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="AFFILIATOR">Affiliator</option>
          </select>
          <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="BANNED">Ditangguhkan</option>
          </select>
        </motion.div>

        {/* Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Pengguna</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Bergabung</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u: any) => {
                  const role = ROLE_CONFIG[u.role] ?? ROLE_CONFIG['BUYER']
                  const isAdmin = u.role === 'ADMIN'
                  return (
                    <tr key={u.id} className={cn('hover:bg-muted/20 transition-colors', u.isBanned && 'opacity-60 bg-destructive/5')}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name ? getInitials(u.name) : '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {u.name ?? '(no name)'}
                              {isAdmin && <Shield className="w-3 h-3 text-destructive" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ color: role.color, backgroundColor: role.bg }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                            <Ban className="w-3 h-3" /> Ditangguhkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        {isAdmin ? (
                          <span className="text-xs text-muted-foreground italic">–</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnban(u.id, u.name)}
                                title="Pulihkan akun"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Pulihkan
                              </button>
                            ) : (
                              <button
                                onClick={() => setBanTarget(u)}
                                title="Tangguhkan akun"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20">
                                <Ban className="w-3.5 h-3.5" /> Tangguhkan
                              </button>
                            )}
                          </div>
                        )}
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
                <button onClick={() => handlePage(page - 1)} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page - 2 + i
                  if (pg > totalPages) return null
                  return (
                    <button key={pg} onClick={() => handlePage(pg)}
                      className={cn('w-8 h-8 rounded-lg text-xs font-semibold transition-colors',
                        pg === page ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground')}>
                      {pg}
                    </button>
                  )
                })}
                <button onClick={() => handlePage(page + 1)} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}
