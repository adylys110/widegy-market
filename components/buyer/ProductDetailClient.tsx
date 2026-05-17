'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Star, Heart, ShoppingCart, Download, Shield,
  Check, Loader2, Package, Tag, Store, ChevronRight,
  ExternalLink, Clock, Users, Globe, File,
  Zap, TrendingDown, ArrowLeft, Share2, Copy
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

export function ProductDetailClient({
  product,
  hasPurchased,
  isWishlisted: initialWishlisted,
  inCart: initialInCart,
  relatedProducts,
  user,
}: {
  product: any
  hasPurchased: boolean
  isWishlisted: boolean
  inCart: boolean
  relatedProducts: any[]
  user: any
}) {
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)
  const [inCart, setInCart] = useState(initialInCart)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartAdded, setCartAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'seller'>('description')
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(product.thumbnail)

  const price = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice != null
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const toggleWishlist = async () => {
    setWishlistLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (res.ok) setIsWishlisted((p) => !p)
    } finally {
      setWishlistLoading(false)
    }
  }

  const addToCart = async () => {
    if (inCart) {
      router.push('/cart')
      return
    }
    setCartLoading(true)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      if (res.ok) {
        setInCart(true)
        setCartAdded(true)
        setTimeout(() => setCartAdded(false), 2500)
      }
    } finally {
      setCartLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const images = product.previewImages?.length
    ? [product.thumbnail, ...product.previewImages].filter(Boolean)
    : [product.thumbnail].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl space-y-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Jelajahi
        </Link>
        <span>/</span>
        <Link
          href={`/browse?category=${product.category}`}
          className="hover:text-foreground transition-colors"
        >
          {CATEGORY_LABELS[product.category] ?? product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — images + tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main image */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="relative h-72 sm:h-96 bg-muted">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                  <TrendingDown className="w-3.5 h-3.5" /> -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 border-t border-border overflow-x-auto">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                      'w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                      selectedImage === img ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    <Image src={img} alt={`Preview ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex border-b border-border">
              {[
                { id: 'description', label: 'Deskripsi' },
                { id: 'reviews', label: `Review (${product.reviews?.length ?? 0})` },
                { id: 'seller', label: 'Tentang Seller' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    'flex-1 py-3.5 text-sm font-semibold transition-all border-b-2',
                    activeTab === id
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm max-w-none text-foreground"
                >
                  {product.description ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tidak ada deskripsi</p>
                  )}

                  {/* Tags */}
                  {product.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {product.tags.map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/browse?q=${encodeURIComponent(tag)}`}
                          className="flex items-center gap-1 text-xs bg-muted hover:bg-primary/10 hover:text-primary px-2.5 py-1 rounded-full transition-colors"
                        >
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Product specs */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      product.fileType && { icon: File, label: 'Format', value: product.fileType.toUpperCase() },
                      product.fileSize && { icon: Package, label: 'Ukuran File', value: `${(product.fileSize / 1024 / 1024).toFixed(1)} MB` },
                      { icon: Globe, label: 'Lisensi', value: 'Komersial' },
                      { icon: Download, label: 'Download', value: 'Setelah bayar' },
                    ].filter(Boolean).map((spec: any) => (
                      <div key={spec.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50">
                        <spec.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{spec.label}</p>
                          <p className="text-xs font-semibold text-foreground">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  id="review"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Rating summary */}
                  <div className="flex items-center gap-5 p-4 bg-muted/40 rounded-2xl">
                    <div className="text-center">
                      <p className="text-4xl font-display font-extrabold text-foreground">
                        {product.rating?.toFixed(1) ?? '0.0'}
                      </p>
                      <div className="flex items-center gap-0.5 justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={cn(
                              'w-3.5 h-3.5',
                              s <= Math.round(product.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{product.ratingCount} ulasan</p>
                    </div>
                  </div>

                  {product.reviews?.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">Belum ada ulasan</p>
                      <p className="text-xs text-muted-foreground">Jadilah yang pertama memberikan ulasan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {review.user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">{review.user.name ?? 'Anonim'}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</p>
                              </div>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={cn(
                                      'w-3 h-3',
                                      s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                                    )}
                                  />
                                ))}
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'seller' && (
                <motion.div
                  key="seller"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden flex-shrink-0 relative">
                      {product.seller.storeLogo ? (
                        <Image src={product.seller.storeLogo} alt={product.seller.storeName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-7 h-7 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold text-foreground">{product.seller.storeName}</h3>
                        {product.seller.isVerified && (
                          <span className="text-xs bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {product.seller.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.seller.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {product.seller.totalSales > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{product.seller.totalSales} penjualan</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Bergabung {formatDate(product.seller.user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {product.seller.storeDescription && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.seller.storeDescription}
                    </p>
                  )}

                  <Link
                    href={`/sellers/${product.seller.storeSlug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Lihat Toko <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right — price + action */}
        <div className="space-y-4">
          {/* Price card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border p-5 space-y-4 sticky top-20"
          >
            {/* Category badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3" />
              {CATEGORY_LABELS[product.category] ?? product.category}
            </span>

            {/* Title */}
            <h1 className="text-lg font-display font-extrabold text-foreground leading-snug">
              {product.title}
            </h1>

            {/* Seller */}
            {product.seller.storeName && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                  {product.seller.storeName.charAt(0)}
                </div>
                <Link
                  href={`/sellers/${product.seller.storeSlug}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {product.seller.storeName}
                  {product.seller.isVerified && <span className="ml-1 text-secondary">✓</span>}
                </Link>
              </div>
            )}

            {/* Rating */}
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        'w-3.5 h-3.5',
                        s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({product.ratingCount} ulasan)</span>
                {product.totalSales > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{product.totalSales} terjual</span>
                  </>
                )}
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-display font-extrabold text-3xl text-foreground">
                  {formatCurrency(price)}
                </span>
                {hasDiscount && (
                  <span className="text-base line-through text-muted-foreground">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <TrendingDown className="w-3 h-3" /> Hemat {discountPercent}%
                </span>
              )}
            </div>

            {/* Actions */}
            {hasPurchased ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-success font-semibold bg-success/10 px-3 py-2 rounded-xl">
                  <Check className="w-4 h-4" /> Sudah dimiliki
                </div>
                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-secondary text-white font-bold text-sm hover:bg-secondary/90 transition-all"
                >
                  <Download className="w-4 h-4" /> Download di Pesanan
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={addToCart}
                  disabled={cartLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300',
                    inCart
                      ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-glow-primary'
                      : cartAdded
                      ? 'bg-success/10 text-success border border-success/30'
                      : 'bg-primary text-white hover:bg-primary/90 hover:shadow-glow-primary'
                  )}
                >
                  {cartLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : inCart || cartAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      {inCart ? 'Lihat Keranjang →' : 'Ditambahkan!'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Tambah ke Keranjang
                    </>
                  )}
                </button>

                {inCart && (
                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-foreground text-white font-bold text-sm hover:bg-foreground/90 transition-all"
                  >
                    <Zap className="w-4 h-4" fill="white" /> Beli Sekarang
                  </Link>
                )}
              </div>
            )}

            {/* Wishlist + Share */}
            <div className="flex gap-2">
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                  isWishlisted
                    ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Heart className={cn('w-3.5 h-3.5', isWishlisted && 'fill-red-500')} />
                )}
                {isWishlisted ? 'Disimpan' : 'Simpan'}
              </button>
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Tersalin</> : <><Share2 className="w-3.5 h-3.5" /> Bagikan</>}
              </button>
            </div>

            {/* Trust badges */}
            <div className="space-y-2 pt-2 border-t border-border">
              {[
                { icon: Shield, text: 'Pembayaran aman & terenkripsi' },
                { icon: Download, text: 'Download langsung setelah bayar' },
                { icon: Globe, text: 'Lisensi komersial termasuk' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Produk Serupa</h2>
            <Link
              href={`/browse?category=${product.category}`}
              className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((related) => {
              const rPrice = related.discountPrice ?? related.price
              const rHasDiscount = related.discountPrice != null
              return (
                <Link
                  key={related.id}
                  href={`/products/${related.slug}`}
                  className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="relative h-32 bg-muted overflow-hidden">
                    {related.thumbnail ? (
                      <Image
                        src={related.thumbnail}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    {rHasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        -{Math.round(((related.price - related.discountPrice) / related.price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {related.title}
                    </p>
                    {related.ratingCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] text-muted-foreground">{related.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <p className="text-sm font-extrabold text-foreground mt-1.5">{formatCurrency(rPrice)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
