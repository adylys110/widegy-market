'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Star, Heart, ShoppingCart, Shield, Package,
  Store, Users, TrendingUp, Calendar, Loader2,
  Check, LayoutGrid, List, Search, ChevronRight, TrendingDown
} from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

type Product = {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  price: number
  discountPrice: number | null
  category: string
  rating: number
  ratingCount: number
  totalSales: number
  fileType: string | null
  tags: string[]
  createdAt: string
}

type SellerProfile = {
  id: string
  storeName: string
  storeSlug: string
  storeDescription: string | null
  storeLogo: string | null
  storeBanner: string | null
  isVerified: boolean
  totalSales: number
  totalRevenue: number
  totalProducts: number
  rating: number
  ratingCount: number
  user: { createdAt: string }
  products: Product[]
}

export function SellerStoreClient({
  seller,
  wishlistedIds: initialWishlisted,
  user,
}: {
  seller: SellerProfile
  wishlistedIds: string[]
  user: any
}) {
  const router = useRouter()
  const [wishlistedIds, setWishlistedIds] = useState(new Set(initialWishlisted))
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const [cartLoading, setCartLoading] = useState<string | null>(null)
  const [cartAdded, setCartAdded] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  const toggleWishlist = async (productId: string) => {
    if (!user) { router.push('/login'); return }
    setWishlistLoading(productId)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setWishlistedIds((prev) => {
          const next = new Set(prev)
          if (next.has(productId)) next.delete(productId)
          else next.add(productId)
          return next
        })
      }
    } finally {
      setWishlistLoading(null)
    }
  }

  const addToCart = async (productId: string) => {
    if (!user) { router.push('/login'); return }
    setCartLoading(productId)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setCartAdded((prev) => ({ ...prev, [productId]: true }))
        setTimeout(() => setCartAdded((prev) => ({ ...prev, [productId]: false })), 2500)
      }
    } finally {
      setCartLoading(null)
    }
  }

  // Filter produk
  const categories = Array.from(new Set(seller.products.map((p) => p.category)))
  const filteredProducts = seller.products.filter((p) => {
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'ALL' || p.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-6xl space-y-6">
      {/* Store Banner + Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-border overflow-hidden"
      >
        {/* Banner */}
        <div className="relative h-40 sm:h-56 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
          {seller.storeBanner && (
            <Image src={seller.storeBanner} alt="Banner" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-muted overflow-hidden flex-shrink-0 -mt-12 relative">
              {seller.storeLogo ? (
                <Image src={seller.storeLogo} alt={seller.storeName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                  <span className="text-2xl font-display font-extrabold text-white">
                    {seller.storeName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 sm:mt-0 -mt-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-display font-extrabold text-foreground">
                      {seller.storeName}
                    </h1>
                    {seller.isVerified && (
                      <span className="flex items-center gap-1 text-xs font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {seller.storeDescription && (
                    <p className="text-sm text-muted-foreground mt-1 max-w-lg line-clamp-2">
                      {seller.storeDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-5 mt-4">
                {[
                  { icon: Package, label: 'Produk', value: seller.totalProducts },
                  { icon: Users, label: 'Penjualan', value: seller.totalSales.toLocaleString('id-ID') },
                  seller.rating > 0
                    ? { icon: Star, label: 'Rating', value: `${seller.rating.toFixed(1)} (${seller.ratingCount})` }
                    : null,
                  { icon: Calendar, label: 'Bergabung', value: new Date(seller.user.createdAt).getFullYear().toString() },
                ].filter(Boolean).map((stat: any) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <stat.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search + View mode */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk di toko ini..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {['ALL', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat === 'ALL' ? 'Semua' : CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">Tidak ada produk ditemukan</p>
          <p className="text-sm text-muted-foreground">Coba kata kunci lain</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          )}
        >
          {filteredProducts.map((product) => {
            const price = product.discountPrice ?? product.price
            const hasDiscount = product.discountPrice != null
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
              : 0
            const isWishlisted = wishlistedIds.has(product.id)
            const isCartLoading = cartLoading === product.id
            const isCartAdded = cartAdded[product.id]
            const isWishlistLoading = wishlistLoading === product.id

            if (viewMode === 'list') {
              return (
                <motion.div
                  key={product.id}
                  variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { duration: 0.3 } } }}
                  className="bg-white rounded-2xl border border-border p-4 flex gap-4 hover:shadow-card-hover transition-all group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                    {product.thumbnail ? (
                      <Image src={product.thumbnail} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-md">-{discountPercent}%</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {product.ratingCount > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[product.category] ?? product.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-extrabold text-base">{formatCurrency(price)}</span>
                        {hasDiscount && <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.price)}</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => toggleWishlist(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                          {isWishlistLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" /> : <Heart className={cn('w-3.5 h-3.5', isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />}
                        </button>
                        <button onClick={() => addToCart(product.id)} disabled={isCartLoading || isCartAdded}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all', isCartAdded ? 'bg-success/10 text-success' : 'bg-primary text-white hover:bg-primary/90')}>
                          {isCartLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isCartAdded ? <><Check className="w-3.5 h-3.5" /> OK</> : <><ShoppingCart className="w-3.5 h-3.5" /> Tambah</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={product.id}
                variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.35 } } }}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
              >
                <div className="relative h-44 bg-muted overflow-hidden">
                  {product.thumbnail ? (
                    <Image src={product.thumbnail} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground" /></div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    {hasDiscount && (
                      <span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        <TrendingDown className="w-2.5 h-2.5" /> -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <button onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors">
                    {isWishlistLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className={cn('w-3.5 h-3.5', isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />}
                  </button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link href={`/products/${product.slug}`}
                      className="bg-white text-foreground text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-primary hover:text-white transition-colors">
                      Lihat Detail
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {product.title}
                  </Link>
                  {product.ratingCount > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({product.ratingCount})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="font-display font-extrabold text-base">{formatCurrency(price)}</span>
                    {hasDiscount && <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.price)}</span>}
                    {product.fileType && (
                      <span className="ml-auto text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase text-muted-foreground">{product.fileType}</span>
                    )}
                  </div>
                  <button onClick={() => addToCart(product.id)} disabled={isCartLoading || isCartAdded}
                    className={cn('mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all',
                      isCartAdded ? 'bg-success/10 text-success border border-success/30' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-glow-primary')}>
                    {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isCartAdded ? <><Check className="w-4 h-4" /> Ditambahkan!</> : <><ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang</>}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Browse more CTA */}
      <div className="text-center py-4">
        <Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          Jelajahi semua produk <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
