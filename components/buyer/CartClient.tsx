'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Trash2, ArrowRight, ShoppingBag,
  Tag, AlertCircle, CheckCircle2, Loader2, Package,
  ChevronRight, X
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.25 } },
}

export function CartClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<null | { code: string; discount: number }>(null)
  const [couponError, setCouponError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price
    return sum + price * item.quantity
  }, 0)

  const discountAmount = couponApplied ? Math.min(couponApplied.discount * subtotal, subtotal) : 0
  const total = subtotal - discountAmount

  const removeItem = async (itemId: string) => {
    setRemoving(itemId)
    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId))
      }
    } finally {
      setRemoving(null)
    }
  }

  const clearCart = async () => {
    startTransition(async () => {
      await fetch('/api/cart', { method: 'DELETE' })
      setItems([])
      setCouponApplied(null)
    })
  }

  const applyCoupon = async () => {
    setCouponError('')
    if (!couponCode.trim()) return
    // Simulasi validasi kupon — implementasi sesungguhnya via /api/checkout/validate-coupon
    if (couponCode.toUpperCase() === 'WIDEGY10') {
      setCouponApplied({ code: couponCode.toUpperCase(), discount: 0.1 })
    } else {
      setCouponError('Kode kupon tidak valid atau sudah kadaluarsa.')
    }
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">Keranjang Kosong</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Belum ada produk di keranjangmu. Yuk temukan produk digital yang kamu butuhkan!
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
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} produk dipilih
          </p>
        </div>
        <button
          onClick={clearCart}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Kosongkan
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const price = item.product.discountPrice ?? item.product.price
                const hasDiscount = item.product.discountPrice != null
                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className="bg-white rounded-2xl border border-border p-4 flex gap-4 hover:shadow-card transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                      {item.product.thumbnail ? (
                        <Image
                          src={item.product.thumbnail}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {CATEGORY_LABELS[item.product.category] ?? item.product.category}
                            </span>
                            {item.product.seller?.storeName && (
                              <span className="text-[10px] text-muted-foreground">
                                oleh {item.product.seller.storeName}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={removing === item.id}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        >
                          {removing === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {item.product.fileType && (
                          <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground uppercase">
                            {item.product.fileType}
                          </span>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          {hasDiscount && (
                            <span className="text-xs line-through text-muted-foreground">
                              {formatCurrency(item.product.price)}
                            </span>
                          )}
                          <span className="text-base font-bold text-foreground">
                            {formatCurrency(price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" /> Kode Kupon
            </h3>
            {couponApplied ? (
              <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-2.5 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{couponApplied.code} — diskon {couponApplied.discount * 100}%</span>
                <button
                  onClick={() => { setCouponApplied(null); setCouponCode('') }}
                  className="ml-auto text-success/70 hover:text-success transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError('') }}
                    placeholder="Masukkan kode kupon"
                    className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:outline-none transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Pakai
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Ringkasan Pesanan</h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} item)</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Diskon Kupon ({couponApplied.code})</span>
                  <span className="text-success font-medium">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Layanan</span>
                <span className="text-success font-medium">Gratis</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-display font-extrabold text-xl text-primary">{formatCurrency(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-glow-primary group"
            >
              Lanjut ke Pembayaran
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <p className="text-[10px] text-center text-muted-foreground">
              🔒 Pembayaran aman via Midtrans. 100% terenkripsi.
            </p>
          </div>

          {/* Browse more */}
          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 w-full bg-white border border-border text-foreground py-3 rounded-2xl font-medium text-sm hover:bg-muted/50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            Tambah Produk Lagi
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
