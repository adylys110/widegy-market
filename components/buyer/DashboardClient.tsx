'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  ShoppingBag, Heart, ShoppingCart, TrendingUp,
  ArrowRight, Clock, CheckCircle2, XCircle, Package, Loader2,
  Store, Link2, ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'Menunggu',  color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  PAID:       { label: 'Dibayar',   color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF', icon: Package },
  COMPLETED:  { label: 'Selesai',  color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  CANCELLED:  { label: 'Dibatal',  color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  REFUNDED:   { label: 'Refund',   color: '#64748B', bg: '#F1F5F9', icon: XCircle },
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export function DashboardClient({ data, user }: { data: any; user: any }) {
  const router = useRouter()
  const { update } = useSession()
  const [sellerLoading, setSellerLoading] = useState(false)
  const [affLoading, setAffLoading] = useState(false)

  const isSeller   = data.isSeller   ?? (user?.role === 'SELLER')
  const isAffiliate = data.isAffiliate ?? (user?.role === 'AFFILIATOR')

  const handleUpgrade = async (role: 'SELLER' | 'AFFILIATOR') => {
    if (role === 'SELLER') setSellerLoading(true)
    else setAffLoading(true)

    try {
      const res = await fetch('/api/users/upgrade-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Gagal upgrade role')
        return
      }

      // Untuk affiliator: langsung ke setup page (role diupdate setelah setup selesai)
      if (role === 'AFFILIATOR') {
        toast.success('Silakan lengkapi profil affiliator kamu!')
        router.push('/affiliator/setup')
        return
      }

      // Untuk seller: update session jika role berubah
      if (json.role) await update({ role: json.role })

      toast.success('Berhasil! Silakan setup profil toko kamu.')
      const redirectTo = json.redirectTo ?? '/seller/setup'
      router.push(redirectTo)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    } finally {
      setSellerLoading(false)
      setAffLoading(false)
    }
  }

  const stats = [
    { label: 'Total Pesanan',  value: data.totalOrders,                icon: ShoppingBag, color: '#FF6B35', bg: '#FFF4F0', href: '/orders' },
    { label: 'Total Belanja',  value: formatCurrency(data.totalSpent), icon: TrendingUp,  color: '#06B6D4', bg: '#ECFEFF', href: '/orders' },
    { label: 'Wishlist',       value: data.wishlistCount,              icon: Heart,       color: '#EF4444', bg: '#FEF2F2', href: '/wishlist' },
    { label: 'Keranjang',      value: data.cartCount,                  icon: ShoppingCart,color: '#F59E0B', bg: '#FFFBEB', href: '/cart' },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground">
          {greeting}, {user?.name?.split(' ')[0] ?? 'Pengguna'} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Selamat datang di dashboard Widegy kamu.</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-2xl p-5 border border-border hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-display font-extrabold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors">{label}</p>
          </Link>
        ))}
      </motion.div>

      {/* Recent orders + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Pesanan Terbaru</h2>
            <Link href="/orders" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Belum ada pesanan" desc="Mulai jelajahi produk digital kami" href="/browse" cta="Jelajahi Produk" />
            ) : data.recentOrders.map((order: any) => {
              const status = STATUS_CONFIG[order.status as OrderStatus]
              const StatusIcon = status.icon
              return (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: status.bg }}>
                    <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.orderItems.map((i: any) => i.product?.title ?? 'Produk').join(', ')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: status.color, backgroundColor: status.bg }}>
                      {status.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Browse card */}
          <div className="bg-gradient-to-br from-primary to-[#FF8E53] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-2 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative">
              <Package className="w-8 h-8 mb-3 text-white/80" />
              <p className="font-display font-bold text-lg leading-tight mb-1">Jelajahi Produk</p>
              <p className="text-sm text-white/70 mb-4">5.000+ aset digital siap download</p>
              <Link href="/browse"
                className="inline-flex items-center gap-1.5 bg-white text-primary text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors">
                Mulai Jelajahi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Role switch / upgrade panel */}
          <RolePanel
            isSeller={isSeller}
            isAffiliate={isAffiliate}
            sellerLoading={sellerLoading}
            affLoading={affLoading}
            onUpgrade={handleUpgrade}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Role Panel Component ────────────────────────────────────────────
function RolePanel({ isSeller, isAffiliate, sellerLoading, affLoading, onUpgrade }: {
  isSeller: boolean; isAffiliate: boolean
  sellerLoading: boolean; affLoading: boolean
  onUpgrade: (role: 'SELLER' | 'AFFILIATOR') => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
      <h3 className="font-display font-bold text-foreground text-sm">Akun Saya</h3>

      {/* Seller row */}
      {isSeller ? (
        <Link href="/seller/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary">Seller Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Kelola produk & penjualan</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary transition-colors" />
        </Link>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground px-1">Ingin berjualan?</p>
          <button
            onClick={() => onUpgrade('SELLER')}
            disabled={sellerLoading || affLoading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sellerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
            {sellerLoading ? 'Memproses...' : 'Jadi Seller →'}
          </button>
        </div>
      )}

      <div className="border-t border-border" />

      {/* Affiliator row */}
      {isAffiliate ? (
        <Link href="/affiliator/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-700">Affiliator Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Lihat komisi & link affiliasi</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
        </Link>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground px-1">Mau passive income?</p>
          <button
            onClick={() => onUpgrade('AFFILIATOR')}
            disabled={sellerLoading || affLoading}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
          >
            {affLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {affLoading ? 'Memproses...' : 'Jadi Affiliator →'}
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, href, cta }: {
  icon: any; title: string; desc: string; href: string; cta: string
}) {
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{desc}</p>
      <Link href={href} className="text-sm font-semibold text-primary hover:underline">{cta}</Link>
    </div>
  )
}
