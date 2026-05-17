'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingCart, Trash2, Star, ShoppingBag,
  ArrowRight, Package, Loader2, Check, TrendingDown,
  Store, Search, SlidersHorizontal, X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Harga Terendah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
  { label: 'Rating Tertinggi', value: 'rating' },
]

export function WishlistClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [removing, setRemoving] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [cartAdded, setCartAdded] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  const removeFromWishlist = async (productId: string) => {
    setRemoving(productId)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId))
      }
    } finally {
      setRemoving(null)
    }
  }

  const addToCart = async (productId: string) => {
    setAddingToCart(productId)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setCartAdded((prev) => ({ ...prev, [productId]: true }))
        setTimeout(() => {
          setCartAdded((prev) => ({ ...prev, [productId]: false }))
        }, 2500)
      }
    } finally {
      setAddingToCart(null)
    }
  }

  const clearAll = () => {
    startTransition(async () => {
      for (const item of items) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.product.id }),
        })
      }
      setItems([])
    })
  }

  const filtered = items
    .filter((item) => {
      if (!search) return true
      return item.product.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.product.seller?.storeName ?? '').toLowerCase().includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const pa = a.product.discountPrice ?? a.product.price
      const pb = b.product.discountPrice ?? b.product.price
      if (sortBy === 'price_asc') return pa - pb
      if (sortBy === 'price_desc') return pb - pa
      if (sortBy === 'rating') return b.product.rating - a.product.rating
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5">
          <Heart className="w-10 h-10 text-red-300" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Wishlist Kosong</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Simpan produk yang kamu suka ke wishlist, biar gampang ditemukan lagi nanti!
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Jelajahi Produk
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            Wishlist Saya
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} produk tersimpan</p>
        </div>
        <button
          onClick={clearAll}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Hapus Semua
        </button>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk di wishlist..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-muted/50 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-muted/50 rounded-xl border border-transparent px-3 py-2.5 focus:border-primary/30 focus:outline-none focus:bg-white transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-sm">Tidak ada produk yang sesuai pencarian.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => {
              const product = item.product
              const price = product.discountPrice ?? product.price
              const hasDiscount = product.discountPrice != null
              const discountPercent = hasDiscount
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0
              const isRemoving = removing === product.id
              const isAddingCart = addingToCart === product.id
              const isCartAdded = cartAdded[product.id]

              return (
                <motion.div
                  key={item.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
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

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      disabled={isRemoving}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground"
                    >
                      {isRemoving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Seller */}
                    {product.seller?.storeName && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Store className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{product.seller.storeName}</span>
                        {product.seller.isVerified && (
                          <span className="text-[10px] text-secondary font-semibold">✓</span>
                        )}
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
                        <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
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
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={isAddingCart || isCartAdded}
                      className={cn(
                        'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                        isCartAdded
                          ? 'bg-success/10 text-success border border-success/30'
                          : 'bg-primary text-white hover:bg-primary/90 hover:shadow-glow-primary'
                      )}
                    >
                      {isAddingCart ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCartAdded ? (
                        <>
                          <Check className="w-4 h-4" /> Ditambahkan!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Browse more CTA */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-2"
        >
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Temukan lebih banyak produk <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  )
}
