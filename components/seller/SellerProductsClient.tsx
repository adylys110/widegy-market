'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle, Search, Package, Edit2, Trash2, Eye, Star,
  TrendingUp, Filter, CheckCircle2, Clock, XCircle, AlertTriangle,
  MoreVertical, Copy, Archive, ArrowUpRight
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { ProductStatus, ProductCategory } from '@prisma/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string; icon: any }> = {
  ACTIVE:         { label: 'Aktif',          color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  DRAFT:          { label: 'Draft',          color: '#94A3B8', bg: '#F1F5F9', icon: Edit2 },
  PENDING_REVIEW: { label: 'Pending Review', color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  REJECTED:       { label: 'Ditolak',        color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  ARCHIVED:       { label: 'Diarsip',        color: '#64748B', bg: '#F8FAFC', icon: Archive },
}

const CATEGORY_LABELS: Partial<Record<ProductCategory, string>> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Kursus',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Fotografi', THREE_D: '3D', OTHER: 'Lainnya',
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

type Product = {
  id: string; title: string; slug: string; thumbnail: string; price: number;
  discountPrice: number | null; category: ProductCategory; status: ProductStatus;
  totalSales: number; totalViews: number; rating: number; ratingCount: number; createdAt: Date
}

function ProductRow({ product, onDelete }: { product: Product; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_CONFIG[product.status]
  const StatusIcon = status.icon

  const handleDelete = async () => {
    if (!confirm('Hapus produk ini? Tindakan tidak bisa dibatalkan.')) return
    try {
      const res = await fetch(`/api/seller/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Produk dihapus')
      onDelete(product.id)
    } catch {
      toast.error('Gagal menghapus produk')
    }
    setMenuOpen(false)
  }

  return (
    <motion.div variants={itemVariants}
      className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
          <span className="hidden sm:block text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md flex-shrink-0">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{product.totalSales}</p>
          <p className="text-[10px] text-muted-foreground">Terjual</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">{product.totalViews}</p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <p className="text-sm font-bold text-foreground">{product.rating > 0 ? product.rating.toFixed(1) : '-'}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">{product.ratingCount} ulasan</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ color: status.color, backgroundColor: status.bg }}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link href={`/seller/products/${product.id}/edit`}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100">
          <Edit2 className="w-4 h-4" />
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }} transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-card-hover border border-border z-20 overflow-hidden">
                <Link href={`/seller/products/${product.id}/edit`} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Produk
                </Link>
                <Link href={`/products/${product.slug}`} target="_blank" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Lihat Halaman
                </Link>
                <button onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export function SellerProductsClient({ data }: { data: any }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'ALL'>('ALL')
  const [products, setProducts] = useState<Product[]>(data.products)

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'ALL' || p.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [products, search, filterStatus])

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const statusCounts = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [products])

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Produk Saya</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{products.length} produk total</p>
        </div>
        <Link href="/seller/products/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-glow-primary">
          <PlusCircle className="w-4 h-4" /> Upload Produk
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'Semua', count: products.length },
          ...Object.entries(STATUS_CONFIG).map(([key, v]) => ({ key, label: v.label, count: statusCounts[key] ?? 0 }))
        ].map(({ key, label, count }) => (
          <button key={key}
            onClick={() => setFilterStatus(key as any)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
              filterStatus === key
                ? 'bg-primary text-white'
                : 'bg-white text-muted-foreground border border-border hover:text-foreground hover:border-foreground/20'
            )}>
            {label}
            <span className={cn('text-[10px] font-bold px-1 py-0.5 rounded-md',
              filterStatus === key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground')}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Product list */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-base font-bold text-foreground mb-1">
              {search || filterStatus !== 'ALL' ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {search || filterStatus !== 'ALL'
                ? 'Coba ubah filter pencarian'
                : 'Upload produk pertamamu dan mulai berjualan!'}
            </p>
            {!search && filterStatus === 'ALL' && (
              <Link href="/seller/products/new"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                <PlusCircle className="w-4 h-4" /> Upload Produk
              </Link>
            )}
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            {filtered.map(product => (
              <ProductRow key={product.id} product={product} onDelete={handleDelete} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
