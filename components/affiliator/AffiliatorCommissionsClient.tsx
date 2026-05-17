'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Clock, CheckCircle2, XCircle, Filter,
  Search, TrendingUp, Package, ArrowUpRight
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { WithdrawStatus } from '@prisma/client'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  APPROVED:   { label: 'Disetujui',color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
  COMPLETED:  { label: 'Selesai',  color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  REJECTED:   { label: 'Ditolak', color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF', icon: Clock },
}

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

export function AffiliatorCommissionsClient({ data }: { data: any }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const filtered = data.commissions.filter((c: any) => {
    const matchSearch = c.product.title.toLowerCase().includes(search.toLowerCase()) ||
      c.order.orderNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const summaryStats = [
    { label: 'Pending', amount: data.summaryMap['PENDING']?.amount ?? 0, count: data.summaryMap['PENDING']?.count ?? 0, color: '#F59E0B' },
    { label: 'Disetujui', amount: data.summaryMap['APPROVED']?.amount ?? 0, count: data.summaryMap['APPROVED']?.count ?? 0, color: '#06B6D4' },
    { label: 'Selesai', amount: data.summaryMap['COMPLETED']?.amount ?? 0, count: data.summaryMap['COMPLETED']?.count ?? 0, color: '#10B981' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Komisi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Riwayat komisi dari semua link affiliasi kamu</p>
      </motion.div>

      {/* Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <DollarSign className="w-7 h-7 mb-2 text-white/70" />
          <p className="text-xs font-semibold text-white/80">Total Komisi</p>
          <p className="text-xl font-display font-extrabold mt-1">{formatCurrency(data.totalEarnings)}</p>
          <p className="text-[10px] text-white/60 mt-1">Saldo: {formatCurrency(data.balance)}</p>
        </div>
        {summaryStats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-display font-extrabold text-foreground mt-1">{formatCurrency(s.amount)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.count} transaksi</p>
            <div className="w-full h-1 rounded-full mt-2" style={{ backgroundColor: `${s.color}30` }}>
              <div className="h-full rounded-full" style={{ backgroundColor: s.color, width: `${Math.min((s.count / Math.max(data.commissions.length, 1)) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk atau order..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-3 py-2 rounded-xl text-xs font-bold transition-all',
                filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary')}>
              {s === 'ALL' ? 'Semua' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Commissions table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-foreground">Riwayat Komisi</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} transaksi</span>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground">Belum ada komisi</p>
              <p className="text-xs text-muted-foreground mt-1">Bagikan link affiliasi untuk mulai menghasilkan</p>
            </div>
          ) : filtered.map((c: any) => {
            const status = STATUS_CONFIG[c.status] ?? STATUS_CONFIG['PENDING']
            const StatusIcon = status.icon
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <img src={c.product.thumbnail} alt={c.product.title}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-muted hidden sm:block" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.product.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Order #{c.order.orderNumber} · {c.order.user?.name} · {formatDate(c.createdAt)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[c.product.category] ?? c.product.category} · Rate: {(c.rate * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-extrabold text-foreground">{formatCurrency(c.amount)}</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5"
                    style={{ color: status.color }}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{status.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
