'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Package, ShoppingBag, DollarSign, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, XCircle, Wallet,
  AlertTriangle, Shield, ChevronRight, Star, Eye,
  Store, Link2, ShoppingCart, Heart, ExternalLink, Loader2,
  ChevronDown
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pending',   color: '#F59E0B', bg: '#FFFBEB' },
  PAID:       { label: 'Dibayar',   color: '#06B6D4', bg: '#ECFEFF' },
  PROCESSING: { label: 'Diproses', color: '#8B5CF6', bg: '#F5F3FF' },
  COMPLETED:  { label: 'Selesai',  color: '#10B981', bg: '#ECFDF5' },
  CANCELLED:  { label: 'Dibatal',  color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED:   { label: 'Refund',   color: '#64748B', bg: '#F1F5F9' },
}

const WITHDRAW_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Pending',    color: '#F59E0B' },
  APPROVED:   { label: 'Disetujui', color: '#06B6D4' },
  PROCESSING: { label: 'Diproses',  color: '#8B5CF6' },
  COMPLETED:  { label: 'Selesai',   color: '#10B981' },
  REJECTED:   { label: 'Ditolak',   color: '#EF4444' },
}

function StatCard({ label, value, sub, icon: Icon, gradient, trend }: any) {
  return (
    <motion.div variants={itemVariants}
      className={cn('rounded-2xl p-5 text-white relative overflow-hidden', gradient)}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white" />
      </div>
      <div className="relative">
        <Icon className="w-7 h-7 mb-3 text-white/70" />
        <p className="text-sm font-semibold text-white/80">{label}</p>
        <p className="text-2xl font-display font-extrabold mt-1">{value}</p>
        {sub && <p className="text-xs text-white/60 mt-1">{sub}</p>}
        {trend != null && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs font-semibold',
            trend >= 0 ? 'text-green-300' : 'text-red-300')}>
            <ArrowUpRight className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
            {Math.abs(trend).toFixed(1)}% vs bulan lalu
          </div>
        )}
      </div>
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-card-hover border border-border p-3 text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.name === 'revenue' ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Role View Panel ───────────────────────────────────────────────
type RoleTab = 'BUYER' | 'SELLER' | 'AFFILIATOR'

function RoleViewPanel() {
  const [activeTab, setActiveTab] = useState<RoleTab>('BUYER')
  const [loading, setLoading] = useState(false)
  const [roleData, setRoleData] = useState<Record<RoleTab, any | null>>({
    BUYER: null, SELLER: null, AFFILIATOR: null,
  })

  const fetchRoleData = async (role: RoleTab) => {
    if (roleData[role]) return // already fetched
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?role=${role}&limit=8&stats=true`)
      if (res.ok) {
        const data = await res.json()
        setRoleData(prev => ({ ...prev, [role]: data }))
      }
    } catch {}
    finally { setLoading(false) }
  }

  const handleTab = (tab: RoleTab) => {
    setActiveTab(tab)
    fetchRoleData(tab)
  }

  // Fetch initial tab on mount
  useEffect(() => { fetchRoleData('BUYER') }, [])

  const TABS: { role: RoleTab; label: string; icon: React.ElementType; color: string; bg: string }[] = [
    { role: 'BUYER', label: 'Buyer', icon: ShoppingCart, color: '#FF6B35', bg: '#FFF4F0' },
    { role: 'SELLER', label: 'Seller', icon: Store, color: '#10B981', bg: '#ECFDF5' },
    { role: 'AFFILIATOR', label: 'Affiliator', icon: Link2, color: '#8B5CF6', bg: '#F5F3FF' },
  ]

  const current = roleData[activeTab]

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-display font-bold text-foreground flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" /> Lihat Data Per Role
        </h2>
        <Link href="/admin/users" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
          Manajemen User <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 border-b border-border bg-muted/30">
        {TABS.map(({ role, label, icon: Icon, color, bg }) => (
          <button
            key={role}
            onClick={() => handleTab(role)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === role
                ? 'text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white'
            )}
            style={activeTab === role ? { backgroundColor: color } : {}}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !current ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Tidak ada data
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Stats row */}
              {current.stats && (
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  {activeTab === 'BUYER' && (
                    <>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Buyer</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.newThisMonth ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Baru Bulan Ini</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{formatCurrency(current.stats.totalSpent ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Belanja</p>
                      </div>
                    </>
                  )}
                  {activeTab === 'SELLER' && (
                    <>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Seller</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.activeProducts ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Produk Aktif</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{formatCurrency(current.stats.totalRevenue ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Revenue</p>
                      </div>
                    </>
                  )}
                  {activeTab === 'AFFILIATOR' && (
                    <>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Affiliator</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{current.stats.totalClicks ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Klik</p>
                      </div>
                      <div className="p-4 text-center">
                        <p className="text-xl font-display font-extrabold text-foreground">{formatCurrency(current.stats.totalCommission ?? 0)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Total Komisi</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* User list */}
              <div className="divide-y divide-border">
                {(current.users ?? []).slice(0, 8).map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.image
                        ? <img src={u.image} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-bold">{(u.name ?? 'U').charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{u.name ?? '—'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {/* Role-specific info */}
                    {activeTab === 'BUYER' && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-foreground">{u._count?.orders ?? 0} pesanan</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(u.stats?.totalSpent ?? 0)}</p>
                      </div>
                    )}
                    {activeTab === 'SELLER' && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-foreground">{u.sellerProfile?.storeName ?? '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{u.sellerProfile?.totalProducts ?? 0} produk</p>
                      </div>
                    )}
                    {activeTab === 'AFFILIATOR' && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-foreground">{u.affiliatorProfile?.totalClicks ?? 0} klik</p>
                        <p className="text-[10px] text-muted-foreground">{formatCurrency(u.affiliatorProfile?.totalEarnings ?? 0)}</p>
                      </div>
                    )}
                    {/* Ban badge */}
                    {u.isBanned && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive flex-shrink-0">
                        Banned
                      </span>
                    )}
                  </div>
                ))}
                {(current.users ?? []).length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">Belum ada data</div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border">
                <Link
                  href={`/admin/users?role=${activeTab}`}
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Lihat semua {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}

export function AdminDashboardClient({ data }: { data: any }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-destructive" /> Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kontrol penuh platform Widegy</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white border border-border px-3 py-2 rounded-xl">
          <Clock className="w-3.5 h-3.5" />
          Update: {new Date().toLocaleString('id-ID')}
        </div>
      </motion.div>

      {/* Alert: pending actions */}
      {(data.pendingWithdrawals > 0 || data.pendingProducts > 0) && (
        <motion.div variants={itemVariants}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Aksi diperlukan</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {data.pendingWithdrawals > 0 && `${data.pendingWithdrawals} penarikan menunggu persetujuan. `}
              {data.pendingProducts > 0 && `${data.pendingProducts} produk menunggu review.`}
            </p>
          </div>
          <div className="flex gap-2">
            {data.pendingWithdrawals > 0 && (
              <Link href="/admin/withdrawals" className="text-xs font-bold text-amber-700 border border-amber-300 px-2 py-1 rounded-lg hover:bg-amber-100">Penarikan →</Link>
            )}
            {data.pendingProducts > 0 && (
              <Link href="/admin/products" className="text-xs font-bold text-amber-700 border border-amber-300 px-2 py-1 rounded-lg hover:bg-amber-100">Produk →</Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} sub={`${data.totalOrders} pesanan`} icon={DollarSign} gradient="bg-gradient-to-br from-[#10B981] to-[#059669]" trend={data.revenueTrend} />
        <StatCard label="Total Pengguna" value={data.totalUsers.toLocaleString('id-ID')} sub={`+${data.newUsersThisMonth} bulan ini`} icon={Users} gradient="bg-gradient-to-br from-[#FF6B35] to-[#E85D04]" />
        <StatCard label="Total Produk" value={data.totalProducts.toLocaleString('id-ID')} sub={`${data.pendingProducts} pending`} icon={Package} gradient="bg-gradient-to-br from-[#06B6D4] to-[#0284C7]" />
        <StatCard label="Pending Tarik" value={formatCurrency(data.pendingWithdrawalAmount)} sub={`${data.pendingWithdrawals} request`} icon={Wallet} gradient="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Buyer', value: data.totalBuyers, icon: '🛒', color: '#FF6B35' },
          { label: 'Seller', value: data.totalSellers, icon: '🏪', color: '#10B981' },
          { label: 'Affiliator', value: data.totalAffiliators, icon: '🔗', color: '#8B5CF6' },
          { label: 'Admin', value: data.totalAdmins, icon: '🛡️', color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-display font-extrabold" style={{ color: s.color }}>{s.value.toLocaleString('id-ID')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Role View Panel — admin lihat data buyer/seller/affiliator tanpa pindah mode */}
      <RoleViewPanel />

      {/* Revenue Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-foreground">Revenue & Pesanan (6 Bulan)</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.monthlyStats} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#10B981" strokeWidth={2.5}
              fill="url(#revGrad)" dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Belum ada pesanan</div>
            ) : data.recentOrders.map((o: any) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">#{o.orderNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{o.user.name} · {o.orderItems.length} item</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(o.totalAmount)}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: ORDER_STATUS[o.status]?.color, backgroundColor: ORDER_STATUS[o.status]?.bg }}>
                    {ORDER_STATUS[o.status]?.label ?? o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Pending Withdrawals */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Penarikan Pending</h2>
            <Link href="/admin/withdrawals" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Kelola <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentWithdrawals.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Tidak ada penarikan pending</div>
            ) : data.recentWithdrawals.map((w: any) => (
              <div key={w.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {w.seller?.storeName ?? w.affiliator?.user?.name ?? 'Unknown'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{w.bankName} · {w.bankAccountNo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(w.amount)}</p>
                  <span className="text-[9px] font-bold" style={{ color: WITHDRAW_STATUS[w.status]?.color }}>
                    {WITHDRAW_STATUS[w.status]?.label ?? w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Sellers & Products */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Top Seller</h2>
          </div>
          <div className="divide-y divide-border">
            {data.topSellers.map((s: any, i: number) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{s.storeName}</p>
                  <p className="text-[11px] text-muted-foreground">{s.totalProducts} produk · {s.totalSales} terjual</p>
                </div>
                <p className="text-sm font-bold text-foreground flex-shrink-0">{formatCurrency(s.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Produk Terlaris</h2>
          </div>
          <div className="divide-y divide-border">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                  {i + 1}
                </div>
                <img src={p.thumbnail} alt={p.title} className="w-10 h-10 rounded-xl object-cover bg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground">{p.totalSales} terjual</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <p className="text-xs font-semibold">{p.rating.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
