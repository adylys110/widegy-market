'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  TrendingUp, Link2, DollarSign, Wallet, MousePointerClick,
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, Copy,
  ExternalLink, ChevronRight, Star, Package
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  APPROVED: '#06B6D4',
  COMPLETED: '#10B981',
  REJECTED: '#EF4444',
}

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Kursus',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D', OTHER: 'Lainnya',
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
          <span className="text-muted-foreground">{p.name === 'earnings' ? 'Komisi' : 'Konversi'}:</span>
          <span className="font-semibold text-foreground">
            {p.name === 'earnings' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AffiliatorDashboardClient({ data, user }: { data: any; user: any }) {
  const [copiedCode, setCopiedCode] = useState(false)

  const copyReferralCode = () => {
    navigator.clipboard.writeText(data.affiliatorProfile.referralCode)
    setCopiedCode(true)
    toast.success('Kode referral disalin!')
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://widegy.com'
  const referralLink = `${baseUrl}?ref=${data.affiliatorProfile.referralCode}`

  const conversionRate = data.totalClicks > 0
    ? ((data.totalConversions / data.totalClicks) * 100).toFixed(1)
    : '0'

  const isPending = data.status === 'PENDING'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">
            Halo, {user?.name?.split(' ')[0] ?? 'Affiliator'}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lacak performa link afiliasi dan komisi kamu
          </p>
        </div>
        <Link href="/affiliator/links"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-secondary to-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
          <Link2 className="w-4 h-4" /> Buat Link Baru
        </Link>
      </motion.div>

      {/* Pending notice */}
      {isPending && (
        <motion.div variants={itemVariants}
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Akun sedang dalam review</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Tim kami sedang memverifikasi akun affiliator kamu. Proses ini biasanya memakan waktu 1-2 hari kerja.
            </p>
          </div>
        </motion.div>
      )}

      {/* Referral Code Card */}
      <motion.div variants={itemVariants}
        className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Kode Referral Kamu</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-display font-extrabold text-foreground tracking-widest">
                {data.affiliatorProfile.referralCode}
              </p>
              <button onClick={copyReferralCode}
                className={cn('p-2 rounded-xl transition-all', copiedCode ? 'bg-green-100 text-green-600' : 'bg-white hover:bg-muted text-muted-foreground')}>
                {copiedCode ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{referralLink}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Komisi Rate: <span className="text-primary font-bold">{(data.commissionRate * 100).toFixed(0)}%</span>
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink)
                toast.success('Link referral disalin!')
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-xl text-xs font-semibold hover:border-primary hover:text-primary transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Salin Link Utama
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Komisi"
          value={formatCurrency(data.totalEarnings)}
          sub={`${data.totalConversions} konversi`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-[#10B981] to-[#059669]"
        />
        <StatCard
          label="Saldo Tersedia"
          value={formatCurrency(data.balance)}
          sub="Siap ditarik"
          icon={Wallet}
          gradient="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]"
        />
        <StatCard
          label="Total Klik"
          value={data.totalClicks.toLocaleString('id-ID')}
          sub={`${data.clicksThisMonth} bulan ini`}
          icon={MousePointerClick}
          gradient="bg-gradient-to-br from-[#FF6B35] to-[#E85D04]"
        />
        <StatCard
          label="Konversi Rate"
          value={`${conversionRate}%`}
          sub={`${data.totalConversions} total`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-[#06B6D4] to-[#0284C7]"
        />
      </motion.div>

      {/* Commission summary mini */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Komisi Pending', amount: data.pendingEarnings, color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
          { label: 'Disetujui', amount: data.approvedEarnings, color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
          { label: 'Selesai', amount: data.completedEarnings, color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
        ].map(({ label, amount, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-display font-extrabold text-foreground">{formatCurrency(amount)}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Chart */}
      {data.monthlyEarnings.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-foreground">Performa 6 Bulan</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyEarnings} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earnings" name="earnings" stroke="#06B6D4" strokeWidth={2.5}
                fill="url(#earningsGrad)" dot={{ r: 3, fill: '#06B6D4' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Links */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Top Link Aktif</h2>
            <Link href="/affiliator/links" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.topLinks.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center px-4">
                <Link2 className="w-9 h-9 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold">Belum ada link</p>
                <p className="text-xs text-muted-foreground mt-1">Buat link afiliasi pertamamu</p>
                <Link href="/affiliator/links"
                  className="mt-3 text-xs font-bold text-primary hover:underline">Buat Link →</Link>
              </div>
            ) : data.topLinks.map((link: any) => (
              <div key={link.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <img src={link.product.thumbnail} alt={link.product.title}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{link.product.title}</p>
                  <p className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[link.product.category] ?? link.product.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-foreground">{link.clicks} klik</p>
                  <p className="text-[10px] text-secondary">{link.conversions} konversi</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Commissions */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display font-bold text-foreground">Komisi Terbaru</h2>
            <Link href="/affiliator/commissions" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentCommissions.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center px-4">
                <DollarSign className="w-9 h-9 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold">Belum ada komisi</p>
                <p className="text-xs text-muted-foreground mt-1">Bagikan link afiliasi untuk mulai menghasilkan</p>
              </div>
            ) : data.recentCommissions.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <img src={c.product.thumbnail} alt={c.product.title}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.product.title}</p>
                  <p className="text-[10px] text-muted-foreground">Order #{c.order.orderNumber}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(c.amount)}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: STATUS_COLORS[c.status] ?? '#94A3B8', backgroundColor: `${STATUS_COLORS[c.status] ?? '#94A3B8'}20` }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
