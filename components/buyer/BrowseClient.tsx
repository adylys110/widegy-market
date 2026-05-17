'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, Heart, Star, ShoppingCart,
  Package, TrendingDown, ChevronLeft, ChevronRight,
  Store, X, Check, Loader2, LayoutGrid, List,
  Zap, Filter
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Semua',
  TEMPLATE: 'Template',
  UI_KIT: 'UI Kit',
  ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack',
  FONT: 'Font',
  PLUGIN: 'Plugin',
  PRESET: 'Preset',
  EBOOK: 'E-Book',
  COURSE: 'Course',
  SOURCE_CODE: 'Source Code',
  MUSIC: 'Musik',
  VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto',
  THREE_D: '3D Asset',
  OTHER: 'Lainnya',
}

const CATEGORY_ICONS: Record<string, string> = {
  ALL: '🛍️', TEMPLATE: '📄', UI_KIT: '🎨', ILLUSTRATION: '🖼️',
  ICON_PACK: '✨', FONT: '🔤', PLUGIN: '🔌', PRESET: '🎛️',
  EBOOK: '📚', COURSE: '🎓', SOURCE_CODE: '💻', MUSIC: '🎵',
  VIDEO: '🎬', PHOTOGRAPHY: '📷', THREE_D: '🧊', OTHER: '📦',
}

const SORT_OPTIONS = [
  { label: 'Terpopuler', value: 'popular' },
  { label: 'Terbaru', value: 'newest' },
  { label: 'Rating Tertinggi', value: 'rating' },
  { label: 'Harga Terendah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
]

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
  seller: {
    storeName: string
    storeSlug: string
    isVerified: boolean
    storeLogo: string | null
  }
}

export function BrowseClient({
  products: initialProducts,
  categories,
  wishlistedIds: initialWishlisted,
  total,
  totalPages,
  currentPage,
  initialFilters,
}: {
  products: Product[]
  categories: { category: string; count: number }[]
  wishlistedIds: string[]
  total: number
  totalPages: number
  currentPage: number
  initialFilters: { category: string; sort: string; q: string }
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState(initialFilters.q)
  const [activeCategory, setActiveCategory] = useState(initialFilters.category)
  const [activeSort, setActiveSort] = useState(initialFilters.sort)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set(initialWishlisted))
  const [cartAdded, setCartAdded] = useState<Record<string, boolean>>({})
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null)
  const [cartLoading, setCartLoading] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  const updateURL = useCallback(
    (params: { category?: string; sort?: string; q?: string; page?: number }) => {
      const sp = new URLSearchParams()
      const c = params.category ?? activeCategory
      const s = params.sort ?? activeSort
      const q = params.q ?? search
      const p = params.page ?? 1
      if (c && c !== 'ALL') sp.set('category', c)
      if (s && s !== 'popular') sp.set('sort', s)
      if (q) sp.set('q', q)
      if (p > 1) sp.set('page', String(p))
      startTransition(() => {
        router.push(`${pathname}?${sp.toString()}`)
      })
    },
    [router, pathname, activeCategory, activeSort, search]
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL({ q: search, page: 1 })
  }

  const handleCategory = (cat: string) => {
    setActiveCategory(cat)
    updateURL({ category: cat, page: 1 })
  }

  const handleSort = (sort: string) => {
    setActiveSort(sort)
    updateURL({ sort, page: 1 })
  }

  const toggleWishlist = async (productId: string) => {
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

  const allCategories = [{ category: 'ALL', count: total }, ...categories]

  return (
    <div className="max-w-7xl space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Jelajahi Produk</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total.toLocaleString('id-ID')} produk digital tersedia
        </p>
      </motion.div>

      {/* Search + Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-border p-4 space-y-3"
      >
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari template, UI kit, font, plugin..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); updateURL({ q: '', page: 1 }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Cari
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors lg:hidden',
              showFilters ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </form>

        {/* Sort + View toggle */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1 scrollbar-hide">
            {SORT_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleSort(value)}
                className={cn(
                  'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeSort === value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-5">
        {/* Sidebar categories — desktop */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:flex flex-col w-56 flex-shrink-0 space-y-1"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">
            Kategori
          </p>
          {allCategories.map(({ category, count }) => (
            <button
              key={category}
              onClick={() => handleCategory(category)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all duration-200',
                activeCategory === category
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              <span className="text-base leading-none">{CATEGORY_ICONS[category] ?? '📦'}</span>
              <span className="flex-1">{CATEGORY_LABELS[category] ?? category}</span>
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                activeCategory === category ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          ))}
        </motion.aside>

        {/* Mobile filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden w-full bg-white rounded-2xl border border-border p-4 space-y-2 overflow-hidden"
            >
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Kategori</p>
              <div className="grid grid-cols-2 gap-1.5">
                {allCategories.map(({ category, count }) => (
                  <button
                    key={category}
                    onClick={() => { handleCategory(category); setShowFilters(false) }}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-all',
                      activeCategory === category
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    )}
                  >
                    <span>{CATEGORY_ICONS[category] ?? '📦'}</span>
                    <span className="truncate">{CATEGORY_LABELS[category] ?? category}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products grid/list */}
        <div className="flex-1 min-w-0">
          {isPending ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : initialProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">Produk tidak ditemukan</p>
              <p className="text-sm text-muted-foreground mb-4">
                Coba kata kunci lain atau pilih kategori berbeda
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setActiveCategory('ALL')
                  setActiveSort('popular')
                  router.push(pathname)
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Reset filter
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeCategory}-${activeSort}-${currentPage}`}
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              )}
            >
              {initialProducts.map((product) => {
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
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
                      }}
                      className="bg-white rounded-2xl border border-border p-4 flex gap-4 hover:shadow-card-hover transition-all duration-300 group"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                        {product.thumbnail ? (
                          <Image src={product.thumbnail} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        {hasDiscount && (
                          <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-md">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {product.seller.storeName && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-0.5">
                              <Store className="w-2.5 h-2.5" /> {product.seller.storeName}
                              {product.seller.isVerified && <span className="text-secondary">✓</span>}
                            </p>
                          )}
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {product.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {product.ratingCount > 0 && (
                              <div className="flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                                <span className="text-[10px] text-muted-foreground">({product.ratingCount})</span>
                              </div>
                            )}
                            {product.totalSales > 0 && (
                              <span className="text-[10px] text-muted-foreground">{product.totalSales} terjual</span>
                            )}
                            {product.fileType && (
                              <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase text-muted-foreground">
                                {product.fileType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display font-extrabold text-base text-foreground">{formatCurrency(price)}</span>
                            {hasDiscount && (
                              <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.price)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              {isWishlistLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                              ) : (
                                <Heart className={cn('w-3.5 h-3.5 transition-colors', isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400')} />
                              )}
                            </button>
                            <button
                              onClick={() => addToCart(product.id)}
                              disabled={isCartLoading || isCartAdded}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                                isCartAdded ? 'bg-success/10 text-success' : 'bg-primary text-white hover:bg-primary/90'
                              )}
                            >
                              {isCartLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isCartAdded ? <><Check className="w-3.5 h-3.5" /> Ditambahkan</> : <><ShoppingCart className="w-3.5 h-3.5" /> Tambah</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                }

                // Grid view
                return (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, scale: 0.95 },
                      show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-44 bg-muted overflow-hidden">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        {hasDiscount && (
                          <span className="flex items-center gap-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            <TrendingDown className="w-2.5 h-2.5" /> -{discountPercent}%
                          </span>
                        )}
                        <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                          {CATEGORY_LABELS[product.category] ?? product.category}
                        </span>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                      >
                        {isWishlistLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <Heart className={cn('w-3.5 h-3.5 transition-colors', isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                        )}
                      </button>

                      {/* Quick view overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Link
                          href={`/products/${product.slug}`}
                          className="bg-white text-foreground text-xs font-bold px-4 py-2 rounded-xl shadow-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {product.seller.storeName && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <Store className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{product.seller.storeName}</span>
                          {product.seller.isVerified && <span className="text-[10px] text-secondary font-semibold">✓</span>}
                        </div>
                      )}

                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                      >
                        {product.title}
                      </Link>

                      {/* Rating */}
                      {product.ratingCount > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({product.ratingCount})</span>
                          {product.totalSales > 0 && (
                            <>
                              <span className="text-muted-foreground text-[10px]">·</span>
                              <span className="text-[10px] text-muted-foreground">{product.totalSales} terjual</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="font-display font-extrabold text-base text-foreground">
                          {formatCurrency(price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs line-through text-muted-foreground">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                        {product.fileType && (
                          <span className="ml-auto text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase text-muted-foreground">
                            {product.fileType}
                          </span>
                        )}
                      </div>

                      {/* Add to cart */}
                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={isCartLoading || isCartAdded}
                        className={cn(
                          'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                          isCartAdded
                            ? 'bg-success/10 text-success border border-success/30'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-glow-primary'
                        )}
                      >
                        {isCartLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCartAdded ? (
                          <><Check className="w-4 h-4" /> Ditambahkan!</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <button
                onClick={() => updateURL({ page: currentPage - 1 })}
                disabled={currentPage <= 1}
                className="p-2 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number
                if (totalPages <= 7) page = i + 1
                else if (currentPage <= 4) page = i + 1
                else if (currentPage >= totalPages - 3) page = totalPages - 6 + i
                else page = currentPage - 3 + i
                return page
              }).map((page) => (
                <button
                  key={page}
                  onClick={() => updateURL({ page })}
                  className={cn(
                    'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
                    currentPage === page
                      ? 'bg-primary text-white shadow-glow-primary'
                      : 'border border-border hover:bg-muted text-foreground'
                  )}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => updateURL({ page: currentPage + 1 })}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-xl border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
