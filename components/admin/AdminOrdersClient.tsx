'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB' },
  PAID:       { label: 'Dibayar',   color: '#06B6D4', bg: '#ECFEFF' },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF' },
  COMPLETED:  { label: 'Selesai',  color: '#10B981', bg: '#ECFDF5' },
  CANCELLED:  { label: 'Dibatal',  color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED:   { label: 'Refund',   color: '#64748B', bg: '#F1F5F9' },
}

export function AdminOrdersClient({ data }: { data: any }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const [orders, setOrders] = useState(data.orders)
  const [total, setTotal] = useState(data.total)
  const perPage = 15
  const totalPages = Math.ceil(total / perPage)

  const fetchOrders = async (s: string, status: string, pg: number) => {
    const params = new URLSearchParams({ search: s, status, page: String(pg), perPage: String(perPage) })
    const res = await fetch(`/api/admin/orders?${params}`)
    const d = await res.json()
    setOrders(d.orders)
    setTotal(d.total)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Kelola Pesanan
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Total {total.toLocaleString('id-ID')} pesanan</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); startTransition(() => fetchOrders(e.target.value, statusFilter, 1)) }}
            placeholder="Cari nomor order atau nama..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); startTransition(() => fetchOrders(search, e.target.value, 1)) }}
          className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="ALL">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pembeli</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o: any) => {
                const st = STATUS_CONFIG[o.status] ?? STATUS_CONFIG['PENDING']
                return (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">#{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{o.orderItems.length} item</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-foreground">{o.user?.name ?? '-'}</p>
                      <p className="text-xs text-muted-foreground">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => { const pg = page - 1; setPage(pg); startTransition(() => fetchOrders(search, statusFilter, pg)) }} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => { const pg = page + 1; setPage(pg); startTransition(() => fetchOrders(search, statusFilter, pg)) }} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
