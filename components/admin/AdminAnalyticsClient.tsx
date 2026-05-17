'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const itemVariants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Kursus',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D', OTHER: 'Lainnya',
}

const COLORS = ['#FF6B35', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316']

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border p-3 text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.name === 'Revenue' || p.name === 'revenue' ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AdminAnalyticsClient({ data }: { data: any }) {
  const categoryData = data.categoryStats.map((c: any) => ({
    name: CATEGORY_LABELS[c.category] ?? c.category,
    produk: c._count.id,
    terjual: c._sum.totalSales ?? 0,
  }))

  const paymentData = data.paymentMethodStats.map((p: any) => ({
    name: p.paymentMethod ?? 'Lainnya',
    value: p._count.id,
  }))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Analitik Platform
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Data performa 12 bulan terakhir</p>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-display font-bold text-foreground mb-5">Revenue Bulanan</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.monthlyRevenue} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2.5}
              fill="url(#revAreaGrad)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-display font-bold text-foreground mb-5">Pertumbuhan Pengguna</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" name="Pengguna" fill="#FF6B35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Methods */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
          <h2 className="font-display font-bold text-foreground mb-5">Metode Pembayaran</h2>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {paymentData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">Belum ada data</div>
          )}
        </motion.div>
      </div>

      {/* Category Stats */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-display font-bold text-foreground mb-5">Penjualan per Kategori</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={categoryData} margin={{ top: 5, right: 5, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="produk" name="Produk" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="terjual" name="Terjual" fill="#FF6B35" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  )
}
