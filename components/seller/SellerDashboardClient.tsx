'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp, Package, Wallet, BarChart3, ArrowRight,
  Star, ShoppingBag, PlusCircle, ArrowUpRight, DollarSign,
  Eye, CheckCircle2, Clock, XCircle, AlertCircle, Link2, Loader2, ExternalLink
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'Menunggu',  color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  PAID:       { label: 'Dibayar',   color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF', icon: Package },
  COMPLETED:  { label: 'Selesai',  color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  CANCELLED:  { label: 'Dibatal',  color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  REFUNDED:   { label: 'Refund',   color: '#64748B', bg: '#F1F5F9', icon: XCircle },
}

function MiniBarChart({ data }: { data: { month: string; total: number }[] }) {
  if (!data.length) return (
    <div className="flex items-end gap-1 h-20">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-1 bg-muted rounded-t-sm" style={{ height: '20%' }} />
      ))}
    </div>
  )
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.total / max) * 100, 5)}%` }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors cursor-pointer relative group"
          >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {formatCurrency(d.total)}
            </div>
          </motion.div>
          <span className="text-[9px] text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export function SellerDashboardClient({ data, user }: { data: any; user: any }) {
  const router = useRouter()
  const { update } = useSession()
  const [affLoading, setAffLoading] = useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam'

  const handleJoinAffiliate = async () => {
    setAffLoading(true)
    try {
      const res = await fetch('/api/users/upgrade-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'AFFILIATOR' }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Gagal mendaftar'); return }
      toast.success('Silakan setup profil affiliator kamu!')
      router.push('/affiliator/setup')
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setAffLoading(false)
    }
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: '#10B981',
      bg: '#ECFDF5',
      sub: `${data.totalSales} transaksi`,
      href: '/seller/analytics',
    },
    {
      label: 'Saldo',
      value: formatCurrency(data.balance),
      icon: Wallet,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      sub: 'Siap ditarik',
      href: '/seller/withdrawals',
    },
    {
      label: 'Produk Aktif',
      value: data.activeProducts,
      icon: Package,
      color: '#FF6B35',
      bg: '#FFF4F0',
      sub: `${data.pendingProducts} pending review`,
      href: '/seller/products',
    },
    {
      label: 'Rating Toko',
      value: data.sellerProfile.rating > 0 ? data.sellerProfile.rating.toFixed(1) : '-',
      icon: Star,
      color: '#F59E0B',
      bg: '#FFFBEB',
      sub: `${data.sellerProfile.ratingCount} ulasan`,
      href: '/seller/products',
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Seller'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola toko <span className="font-semibold text-foreground">{data.sellerProfile.storeName}</span> kamu
          </p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-glow-primary"
        >
          <PlusCircle className="w-4 h-4" /> Upload Produk
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-display font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
          </Link>
        ))}
      </motion.div>

      {/* Chart + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-foreground">Revenue 6 Bulan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Pendapatan bersih dari penjualan</p>
            </div>
            <Link href="/seller/analytics" className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              Detail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <MiniBarChart data={data.salesData} />
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-display font-extrabold text-foreground">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Penjualan</p>
              <p className="text-lg font-display font-extrabold text-foreground">{data.totalSales}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick info */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Product status */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-4">Status Produk</h3>
            <div className="space-y-3">
              {[
                { label: 'Aktif', count: data.activeProducts, color: '#10B981', bg: '#ECFDF5' },
                { label: 'Pending Review', count: data.pendingProducts, color: '#F59E0B', bg: '#FFFBEB' },
                { label: 'Draft', count: data.draftProducts, color: '#94A3B8', bg: '#F1F5F9' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/seller/products" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              Kelola Produk <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Withdrawal CTA */}
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
            <Wallet className="w-7 h-7 mb-3 text-white/80 relative" />
            <p className="font-display font-bold text-sm mb-0.5 relative">Saldo Tersedia</p>
            <p className="text-2xl font-display font-extrabold mb-3 relative">{formatCurrency(data.balance)}</p>
            <Link href="/seller/withdrawals"
              className="relative inline-flex items-center gap-1.5 bg-white text-[#8B5CF6] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors">
              Tarik Saldo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Affiliate Panel */}
          {data.isAffiliate ? (
            <Link href="/affiliator/dashboard"
              className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Link2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700">Affiliator Dashboard</p>
                <p className="text-[11px] text-muted-foreground">Lihat komisi & link referral</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
            </Link>
          ) : (
            <div className="bg-white rounded-2xl border border-amber-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-foreground">Tambah Passive Income</p>
              </div>
              <p className="text-xs text-muted-foreground">Daftar sebagai affiliator dan dapatkan komisi dari setiap referral.</p>
              <button
                onClick={handleJoinAffiliate}
                disabled={affLoading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border-2 border-amber-400 text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50"
              >
                {affLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                {affLoading ? 'Memproses...' : 'Daftar Affiliator →'}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground text-sm">Pesanan Terbaru</h2>
            <Link href="/seller/analytics" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground mb-0.5">Belum ada pesanan</p>
                <p className="text-xs text-muted-foreground">Upload produkmu dan mulai berjualan</p>
              </div>
            ) : data.recentOrders.map((order: any) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING']
              const StatusIcon = status.icon
              const item = order.orderItems[0]
              return (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                  {item?.product?.thumbnail ? (
                    <img src={item.product.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item?.product?.title ?? 'Produk'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {order.user?.name ?? order.user?.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: status.color, backgroundColor: status.bg }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Top products */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground text-sm">Produk Terlaris</h2>
            <Link href="/seller/products" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Semua Produk <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.topProducts.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Package className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold text-foreground mb-1">Belum ada produk</p>
                <Link href="/seller/products/new" className="text-xs font-semibold text-primary hover:underline">
                  Upload produk pertama
                </Link>
              </div>
            ) : data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4 text-center">{i + 1}</span>
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{p.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-muted-foreground">{p.rating > 0 ? p.rating.toFixed(1) : '-'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{p.totalSales} terjual</p>
                  <p className="text-[10px] text-muted-foreground">{formatCurrency(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
