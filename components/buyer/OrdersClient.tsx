'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, Package,
  ArrowRight, Filter, Search, Eye, Download
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'Menunggu Bayar', color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  PAID:       { label: 'Sudah Dibayar',  color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
  PROCESSING: { label: 'Diproses',       color: '#8B5CF6', bg: '#F5F3FF', icon: Package },
  COMPLETED:  { label: 'Selesai',        color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  CANCELLED:  { label: 'Dibatalkan',     color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  REFUNDED:   { label: 'Direfund',       color: '#64748B', bg: '#F1F5F9', icon: XCircle },
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Dibayar', value: 'PAID' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
]

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

export function OrdersClient({ orders }: { orders: any[] }) {
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = orders.filter((o) => {
    const matchStatus = activeFilter === 'ALL' || o.status === activeFilter
    const matchSearch = search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.orderItems.some((i: any) => i.product.title.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Pesanan Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} total pesanan</p>
      </motion.div>

      {/* Filter & Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-border p-4 space-y-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor order atau nama produk..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none focus:bg-white transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={cn(
                'flex-shrink-0 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                activeFilter === value
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {label}
              {value !== 'ALL' && (
                <span className="ml-1.5 opacity-70">
                  ({orders.filter(o => o.status === value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Tidak ada pesanan</p>
          <p className="text-sm text-muted-foreground mb-4">
            {activeFilter !== 'ALL' ? 'Tidak ada pesanan dengan status ini.' : 'Kamu belum pernah berbelanja.'}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Mulai Belanja <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        >
          {filtered.map((order) => {
            const status = STATUS_CONFIG[order.status as OrderStatus]
            const StatusIcon = status.icon
            const firstProduct = order.orderItems[0]?.product

            return (
              <motion.div
                key={order.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="bg-white rounded-2xl border border-border hover:shadow-card-hover transition-all duration-300"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: status.bg }}
                    >
                      <StatusIcon className="w-4.5 h-4.5" style={{ color: status.color, width: '1.125rem', height: '1.125rem' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">#{order.orderNumber}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ color: status.color, backgroundColor: status.bg }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Products */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {firstProduct?.thumbnail ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                        <Image src={firstProduct.thumbnail} alt={firstProduct.title} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{firstProduct?.title}</p>
                      {order.orderItems.length > 1 && (
                        <p className="text-xs text-muted-foreground">+{order.orderItems.length - 1} produk lainnya</p>
                      )}
                      {firstProduct?.category && (
                        <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
                          {CATEGORY_LABELS[firstProduct.category] ?? firstProduct.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 rounded-b-2xl">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Total Pembayaran</p>
                    <p className="text-base font-display font-extrabold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'COMPLETED' && (
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-secondary bg-secondary/10 px-3 py-2 rounded-xl hover:bg-secondary/20 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detail
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
