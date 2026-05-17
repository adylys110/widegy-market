'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Package, Star, BarChart3, Clock, CheckCircle2, XCircle, ArrowUpRight
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Kursus',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Fotografi', THREE_D: '3D', OTHER: 'Lainnya',
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Menunggu', color: '#F59E0B', bg: '#FFFBEB' },
  PAID:       { label: 'Dibayar',  color: '#06B6D4', bg: '#ECFEFF' },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF' },
  COMPLETED:  { label: 'Selesai', color: '#10B981', bg: '#ECFDF5' },
  CANCELLED:  { label: 'Dibatal', color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED:   { label: 'Refund',  color: '#64748B', bg: '#F1F5F9' },
}

function RevenueChart({ data }: { data: { month: string; revenue: number; orders: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-2 h-36">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ height: 0 }} animate={{ height: `${Math.max((d.revenue / max) * 100, 4)}%` }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-primary/20 hover:bg-primary/50 rounded-t-md transition-colors cursor-pointer relative group"
          >
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              {formatCurrency(d.revenue)}<br />
              <span className="text-background/70">{d.orders} order</span>
            </div>
          </motion.div>
          <span className="text-[9px] text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export function SellerAnalyticsClient({ data }: { data: any }) {
  const [activeOrderTab, setActiveOrderTab] = useState<'all' | 'completed' | 'pending'>('all')

  const filteredOrders = data.recentOrders.filter((o: any) => {
    if (activeOrderTab === 'completed') return ['COMPLETED', 'PAID'].includes(o.status)
    if (activeOrderTab === 'pending') return ['PENDING', 'PROCESSING'].includes(o.status)
    return true
  })

  const totalViews = data.productPerformance.reduce((s: number, p: any) => s + p.totalViews, 0)
  const conversionRate = totalViews > 0 ? ((data.totalOrders / totalViews) * 100).toFixed(1) : '0.0'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Analitik Penjualan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pantau performa toko dan produkmu</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue', value: formatCurrency(data.totalRevenue),
            icon: DollarSign, color: '#10B981', bg: '#ECFDF5',
            sub: data.revenueGrowth !== 0 ? `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth.toFixed(1)}% bulan ini` : null,
            trend: data.revenueGrowth >= 0,
          },
          {
            label: 'Bulan Ini', value: formatCurrency(data.currMonthRevenue),
            icon: TrendingUp, color: '#FF6B35', bg: '#FFF4F0',
            sub: null, trend: true,
          },
          {
            label: 'Total Orders', value: data.totalOrders,
            icon: ShoppingBag, color: '#06B6D4', bg: '#ECFEFF',
            sub: null, trend: true,
          },
          {
            label: 'Konversi', value: `${conversionRate}%`,
            icon: BarChart3, color: '#8B5CF6', bg: '#F5F3FF',
            sub: `${totalViews} views total`, trend: true,
          },
        ].map(({ label, value, icon: Icon, color, bg, sub, trend }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              {sub && (
                <span className={cn('flex items-center gap-0.5 text-[10px] font-semibold',
                  trend ? 'text-green-600' : 'text-red-500')}>
                  {trend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {sub}
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-foreground">Revenue 12 Bulan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Hover bar untuk detail</p>
            </div>
          </div>
          {data.monthlySales.length > 0 ? (
            <RevenueChart data={data.monthlySales} />
          ) : (
            <div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
              Belum ada data penjualan
            </div>
          )}
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-5">
          <h3 className="font-display font-bold text-sm text-foreground mb-4">Revenue per Kategori</h3>
          {data.categoryRevenue.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-muted-foreground text-xs text-center">
              Belum ada data
            </div>
          ) : (
            <div className="space-y-3">
              {data.categoryRevenue.slice(0, 6).map((c: any) => {
                const total = data.categoryRevenue.reduce((s: number, x: any) => s + x.revenue, 0)
                const pct = total > 0 ? Math.round((c.revenue / total) * 100) : 0
                return (
                  <div key={c.category}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">
                        {CATEGORY_LABELS[c.category] ?? c.category}
                      </span>
                      <span className="text-xs font-bold text-foreground">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(c.revenue)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Product performance */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground">Performa Produk</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Produk</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Views</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Terjual</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.productPerformance.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">Belum ada produk</td></tr>
              ) : data.productPerformance.map((p: any, i: number) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3.5 text-sm font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.thumbnail
                        ? <img src={p.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                      }
                      <div>
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[p.category] ?? p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-right font-medium">{p.totalViews.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-bold text-foreground">{p.totalSales}</td>
                  <td className="px-4 py-3.5 text-sm text-right font-bold text-foreground">
                    {formatCurrency(p.totalSales * p.price)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-foreground">{p.rating > 0 ? p.rating.toFixed(1) : '-'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent orders */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground">Riwayat Transaksi</h2>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'completed', label: 'Selesai' },
              { key: 'pending', label: 'Pending' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveOrderTab(key as any)}
                className={cn('px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                  activeOrderTab === key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-semibold text-foreground">Belum ada transaksi</p>
            </div>
          ) : filteredOrders.map((order: any) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING']
            const item = order.orderItems[0]
            return (
              <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item?.product?.thumbnail
                    ? <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <Package className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item?.product?.title ?? 'Produk'}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.user?.name ?? order.user?.email}</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: status.color, backgroundColor: status.bg }}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
