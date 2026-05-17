'use client'

import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Heart,
  Package,
  Search,
  FileText,
  Users,
  BarChart3,
  Star,
  Inbox,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateType =
  | 'cart'
  | 'wishlist'
  | 'orders'
  | 'search'
  | 'products'
  | 'users'
  | 'analytics'
  | 'reviews'
  | 'notifications'
  | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const defaultConfig: Record<
  EmptyStateType,
  { icon: LucideIcon; title: string; description: string; gradient: string }
> = {
  cart: {
    icon: ShoppingBag,
    title: 'Keranjang Kosong',
    description: 'Belum ada produk di keranjang. Yuk, mulai belanja!',
    gradient: 'from-primary/10 to-accent/10',
  },
  wishlist: {
    icon: Heart,
    title: 'Wishlist Kosong',
    description: 'Simpan produk favorit kamu di sini untuk dibeli nanti.',
    gradient: 'from-pink-100 to-rose-100',
  },
  orders: {
    icon: Package,
    title: 'Belum Ada Pesanan',
    description: 'Riwayat pesanan kamu akan muncul di sini.',
    gradient: 'from-blue-50 to-indigo-50',
  },
  search: {
    icon: Search,
    title: 'Tidak Ada Hasil',
    description: 'Coba kata kunci lain atau hapus filter yang aktif.',
    gradient: 'from-muted to-muted/50',
  },
  products: {
    icon: FileText,
    title: 'Belum Ada Produk',
    description: 'Mulai upload produk pertama kamu dan raih penjualan.',
    gradient: 'from-primary/5 to-secondary/5',
  },
  users: {
    icon: Users,
    title: 'Tidak Ada Pengguna',
    description: 'Data pengguna akan muncul di sini.',
    gradient: 'from-secondary/10 to-primary/5',
  },
  analytics: {
    icon: BarChart3,
    title: 'Belum Ada Data',
    description: 'Statistik akan muncul setelah ada aktivitas.',
    gradient: 'from-accent/10 to-primary/5',
  },
  reviews: {
    icon: Star,
    title: 'Belum Ada Review',
    description: 'Review dari pembeli akan muncul di sini.',
    gradient: 'from-amber-50 to-yellow-50',
  },
  notifications: {
    icon: Inbox,
    title: 'Tidak Ada Notifikasi',
    description: 'Semua notifikasi kamu sudah dibaca.',
    gradient: 'from-muted to-muted/50',
  },
  generic: {
    icon: Inbox,
    title: 'Tidak Ada Data',
    description: 'Data akan muncul di sini.',
    gradient: 'from-muted to-muted/50',
  },
}

const sizeConfig = {
  sm: { icon: 'w-10 h-10', container: 'w-16 h-16', padding: 'py-8', title: 'text-base', desc: 'text-xs' },
  md: { icon: 'w-12 h-12', container: 'w-20 h-20', padding: 'py-12', title: 'text-lg', desc: 'text-sm' },
  lg: { icon: 'w-14 h-14', container: 'w-24 h-24', padding: 'py-16', title: 'text-xl', desc: 'text-sm' },
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = defaultConfig[type]
  const s = sizeConfig[size]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center', s.padding, className)}
    >
      <div
        className={cn(
          `${s.container} rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-4`
        )}
      >
        <Icon className={cn(s.icon, 'text-muted-foreground/50')} />
      </div>
      <h3 className={cn('font-semibold text-foreground mb-1.5', s.title)}>
        {title ?? config.title}
      </h3>
      <p className={cn('text-muted-foreground max-w-xs leading-relaxed', s.desc)}>
        {description ?? config.description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
