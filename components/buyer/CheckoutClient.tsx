'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingBag, Tag, AlertCircle, CheckCircle2, Loader2,
  Package, ChevronRight, ArrowLeft, Lock, Zap,
  X, Check, CreditCard, Gift, Info
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

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: any) => void
        onPending?: (result: any) => void
        onError?: (result: any) => void
        onClose?: () => void
      }) => void
    }
  }
}

export function CheckoutClient({
  cartItems,
  user,
}: {
  cartItems: any[]
  user: any
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<null | { code: string; discount: number; type: string }>(null)
  const [couponError, setCouponError] = useState('')
  const [affiliateCode, setAffiliateCode] = useState('')
  const [affiliateApplied, setAffiliateApplied] = useState(false)
  const [error, setError] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [snapScriptLoaded, setSnapScriptLoaded] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price
    return sum + price
  }, 0)

  const discountAmount = couponApplied
    ? couponApplied.type === 'PERCENTAGE'
      ? Math.min((couponApplied.discount / 100) * subtotal, subtotal)
      : Math.min(couponApplied.discount, subtotal)
    : 0

  const total = subtotal - discountAmount

  // Load Midtrans Snap script
  const loadSnapScript = () => {
    if (snapScriptLoaded || document.getElementById('midtrans-snap')) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const script = document.createElement('script')
      script.id = 'midtrans-snap'
      script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
      script.onload = () => { setSnapScriptLoaded(true); resolve() }
      document.head.appendChild(script)
    })
  }

  const applyCoupon = async () => {
    setCouponError('')
    if (!couponCode.trim()) return

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error ?? 'Kode tidak valid')
      } else {
        setCouponApplied({
          code: data.code,
          discount: data.discountValue,
          type: data.discountType,
        })
      }
    } catch {
      setCouponError('Gagal memvalidasi kupon')
    }
  }

  const handlePlaceOrder = async () => {
    setError('')
    setPaymentLoading(true)

    try {
      // 1. Create order
      const orderRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponApplied?.code,
          affiliateCode: affiliateApplied ? affiliateCode : undefined,
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        setError(err.error ?? 'Gagal membuat pesanan')
        return
      }

      const { orderId } = await orderRes.json()

      // 2. Get Snap token
      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!payRes.ok) {
        setError('Gagal memproses pembayaran. Coba lagi.')
        return
      }

      const { snapToken } = await payRes.json()

      // 3. Load Snap and pay
      await loadSnapScript()

      if (!window.snap) {
        setError('Layanan pembayaran tidak tersedia. Refresh halaman.')
        return
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          router.push(`/orders/${orderId}?payment=success`)
        },
        onPending: (result) => {
          router.push(`/orders/${orderId}?payment=pending`)
        },
        onError: (result) => {
          setError('Pembayaran gagal. Coba lagi atau pilih metode lain.')
        },
        onClose: () => {
          // User closed popup, do nothing
        },
      })
    } catch (e) {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setPaymentLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Keranjang
        </Link>
        <h1 className="text-2xl font-display font-extrabold text-foreground">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">Periksa pesananmu sebelum membayar</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — order items + coupon */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <h2 className="font-display font-bold text-foreground">
                Produk ({cartItems.length})
              </h2>
            </div>

            <div className="divide-y divide-border">
              {cartItems.map((item) => {
                const price = item.product.discountPrice ?? item.product.price
                const hasDiscount = item.product.discountPrice != null
                return (
                  <div key={item.id} className="flex items-center gap-4 p-5">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                      {item.product.thumbnail ? (
                        <Image src={item.product.thumbnail} alt={item.product.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.product.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {CATEGORY_LABELS[item.product.category] ?? item.product.category}
                        </span>
                        {item.product.seller?.storeName && (
                          <span className="text-[10px] text-muted-foreground">
                            oleh {item.product.seller.storeName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(price)}</p>
                      {hasDiscount && (
                        <p className="text-[10px] line-through text-muted-foreground">
                          {formatCurrency(item.product.price)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Coupon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-border p-5"
          >
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-primary" /> Kode Kupon
            </h3>

            {couponApplied ? (
              <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-2.5 rounded-xl text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {couponApplied.code} — hemat {couponApplied.type === 'PERCENTAGE'
                    ? `${couponApplied.discount}%`
                    : formatCurrency(couponApplied.discount)}
                </span>
                <button
                  onClick={() => { setCouponApplied(null); setCouponCode('') }}
                  className="ml-auto hover:text-success/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                    placeholder="Masukkan kode kupon"
                    className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-border focus:border-primary/50 focus:outline-none transition-colors uppercase tracking-wider"
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                  >
                    Pakai
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Affiliate code */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border p-5"
          >
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Gift className="w-4 h-4 text-accent" style={{ color: '#F59E0B' }} /> Kode Affiliasi
              <span className="text-[10px] text-muted-foreground font-normal">(opsional)</span>
            </h3>

            {affiliateApplied ? (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2.5 rounded-xl text-sm font-semibold">
                <Check className="w-4 h-4" />
                Kode {affiliateCode} diterapkan
                <button onClick={() => { setAffiliateApplied(false); setAffiliateCode('') }} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                  placeholder="Kode referral (jika ada)"
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-border focus:border-amber-400/50 focus:outline-none transition-colors uppercase"
                />
                <button
                  onClick={() => { if (affiliateCode.trim()) setAffiliateApplied(true) }}
                  disabled={!affiliateCode.trim()}
                  className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-40"
                >
                  Terapkan
                </button>
              </div>
            )}
          </motion.div>

          {/* Digital goods info */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Semua produk adalah <strong>digital download</strong>. File tersedia langsung setelah pembayaran dikonfirmasi. Tidak ada pengiriman fisik.
            </p>
          </div>
        </div>

        {/* Right — summary + pay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-display font-bold text-foreground">Ringkasan Pembayaran</h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} produk)</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {couponApplied && discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-success">Diskon Kupon</span>
                  <span className="text-success font-semibold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Layanan</span>
                <span className="text-success font-medium">Gratis</span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-display font-extrabold text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 text-destructive px-3 py-2.5 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={paymentLoading || isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-glow-primary disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" fill="white" />
                  Bayar {formatCurrency(total)}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="w-3 h-3" />
              Pembayaran aman via Midtrans · SSL Terenkripsi
            </div>
          </div>

          {/* Payment methods preview */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'BCA', color: '#003087' },
                { name: 'Mandiri', color: '#003087' },
                { name: 'BNI', color: '#FF6200' },
                { name: 'GoPay', color: '#00AED6' },
                { name: 'DANA', color: '#118EEA' },
                { name: 'OVO', color: '#4C3494' },
              ].map(({ name, color }) => (
                <div
                  key={name}
                  className="h-8 rounded-lg bg-muted/50 flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold" style={{ color }}>{name}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">+50 metode pembayaran lainnya</p>
          </div>

          {/* Buyer info */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="text-xs font-semibold text-foreground mb-2">Pembelian untuk</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.slice(0, 1)?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name ?? 'Pengguna'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
