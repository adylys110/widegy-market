'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Package, Clock, CheckCircle2, XCircle,
  Download, CreditCard, Calendar,
  Copy, Check, AlertCircle, Loader2,
  FileText, Star, X, MessageSquare, ThumbsUp
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any; step: number }> = {
  PENDING:    { label: 'Menunggu Pembayaran', color: '#F59E0B', bg: '#FFFBEB', icon: Clock,         step: 1 },
  PAID:       { label: 'Pembayaran Diterima', color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2, step: 2 },
  PROCESSING: { label: 'Sedang Diproses',     color: '#8B5CF6', bg: '#F5F3FF', icon: Package,      step: 3 },
  COMPLETED:  { label: 'Pesanan Selesai',     color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2, step: 4 },
  CANCELLED:  { label: 'Pesanan Dibatalkan',  color: '#EF4444', bg: '#FEF2F2', icon: XCircle,      step: 0 },
  REFUNDED:   { label: 'Dana Dikembalikan',   color: '#64748B', bg: '#F1F5F9', icon: XCircle,      step: 0 },
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu', SETTLEMENT: 'Lunas', CAPTURE: 'Lunas',
  DENY: 'Ditolak', CANCEL: 'Dibatalkan', EXPIRE: 'Kadaluarsa',
  FAILURE: 'Gagal', REFUND: 'Direfund',
}

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

const ORDER_STEPS = [
  { label: 'Pesanan Dibuat', step: 1 },
  { label: 'Pembayaran',     step: 2 },
  { label: 'Diproses',       step: 3 },
  { label: 'Selesai',        step: 4 },
]

// ─── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({
  product,
  onClose,
  onSubmitted,
}: {
  product: { id: string; title: string; thumbnail: string | null }
  onClose: () => void
  onSubmitted: (productId: string) => void
}) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  const submit = async () => {
    if (rating === 0) { setError('Pilih rating terlebih dahulu'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Gagal mengirim ulasan')
        return
      }
      setDone(true)
      setTimeout(() => { onSubmitted(product.id); onClose() }, 1500)
    } finally {
      setLoading(false)
    }
  }

  const STARS_LABEL = ['', 'Sangat Buruk', 'Buruk', 'Biasa Saja', 'Bagus', 'Sangat Bagus']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {done ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <ThumbsUp className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-display font-bold text-foreground mb-1">Ulasan Terkirim!</h3>
            <p className="text-sm text-muted-foreground">Terima kasih sudah memberikan ulasan.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-display font-bold text-foreground mb-4 pr-8">
              Beri Ulasan Produk
            </h3>

            {/* Product mini card */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl mb-5">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                {product.thumbnail ? (
                  <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground line-clamp-2">{product.title}</p>
            </div>

            {/* Star rating */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        'w-9 h-9 transition-colors',
                        s <= (hovered || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
              <span className={cn(
                'text-sm font-semibold transition-colors',
                rating > 0 ? 'text-amber-500' : 'text-muted-foreground'
              )}>
                {hovered > 0 ? STARS_LABEL[hovered] : rating > 0 ? STARS_LABEL[rating] : 'Pilih rating'}
              </span>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Komentar (opsional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan pengalamanmu menggunakan produk ini..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-muted/50 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none resize-none transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-4">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={loading || rating === 0}
              className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {loading ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function OrderDetailClient({ order }: { order: any }) {
  const [copied, setCopied]       = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [reviewProduct, setReviewProduct] = useState<any>(null)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set())

  const status = STATUS_CONFIG[order.status as OrderStatus]
  const StatusIcon = status.icon
  const isCancelledOrRefunded = ['CANCELLED', 'REFUNDED'].includes(order.status)
  const isCompleted = order.status === 'COMPLETED'

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async (itemId: string, productTitle: string) => {
    setDownloading(itemId)
    try {
      const res = await fetch(`/api/orders/${order.id}/download/${itemId}`)
      if (res.ok) {
        const blob = await res.blob()
        const url  = window.URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = productTitle
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } finally {
      setDownloading(null)
    }
  }

  const handlePayNow = async () => {
    try {
      const res  = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (data.snapToken && typeof window !== 'undefined') {
        // @ts-ignore
        window.snap?.pay(data.snapToken, {
          onSuccess: () => window.location.reload(),
          onPending: () => window.location.reload(),
          onError:   () => alert('Pembayaran gagal'),
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {/* Review Modal */}
      <AnimatePresence>
        {reviewProduct && (
          <ReviewModal
            product={reviewProduct}
            onClose={() => setReviewProduct(null)}
            onSubmitted={(id) => setReviewedIds((p) => new Set([...p, id]))}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl space-y-6"
      >
        {/* Back + Header */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-display font-extrabold text-foreground">Detail Pesanan</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground font-mono">#{order.orderNumber}</span>
                <button onClick={copyOrderNumber} className="p-1 rounded-md hover:bg-muted transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ color: status.color, backgroundColor: status.bg }}
            >
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </div>
          </div>
        </div>

        {/* Progress stepper */}
        {!isCancelledOrRefunded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between relative">
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" style={{ marginLeft: 20, marginRight: 20 }} />
              <div
                className="absolute top-5 h-0.5 bg-primary transition-all duration-700"
                style={{
                  left: 20,
                  width: `calc(${Math.max(0, (status.step - 1) / 3) * 100}% - 40px)`,
                }}
              />
              {ORDER_STEPS.map(({ label, step }) => {
                const done   = status.step >= step
                const active = status.step === step
                return (
                  <div key={step} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                      done ? 'bg-primary text-white shadow-glow-primary' : 'bg-white border-2 border-border text-muted-foreground'
                    )}>
                      {done ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className={cn(
                      'text-[11px] font-medium text-center max-w-[64px]',
                      active ? 'text-primary font-bold' : done ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Cancelled/Refunded banner */}
        {isCancelledOrRefunded && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ backgroundColor: status.bg, borderColor: status.color + '30' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: status.color }} />
            <div>
              <p className="text-sm font-bold" style={{ color: status.color }}>{status.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {order.status === 'CANCELLED'
                  ? 'Pesanan ini telah dibatalkan. Dana akan dikembalikan dalam 3-5 hari kerja jika sudah dibayar.'
                  : 'Dana telah dikembalikan ke metode pembayaran asalmu.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left col — items + payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order items */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Produk ({order.orderItems?.length ?? 0})
                </h2>
              </div>

              <div className="divide-y divide-border">
                {order.orderItems?.map((item: any) => {
                  const isDownloading = downloading === item.id
                  const hasDownload   = !!item.downloadUrl
                  const isReviewed    = reviewedIds.has(item.productId)

                  return (
                    <div key={item.id} className="p-5 flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 relative">
                        {item.product?.thumbnail ? (
                          <Image src={item.product.thumbnail} alt={item.product.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.product?.slug}`}
                              className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                            >
                              {item.product?.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                {CATEGORY_LABELS[item.product?.category] ?? item.product?.category}
                              </span>
                              {item.product?.fileType && (
                                <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase text-muted-foreground">
                                  {item.product.fileType}
                                </span>
                              )}
                              {item.downloaded && (
                                <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Didownload
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-display font-bold text-sm text-foreground flex-shrink-0">
                            {formatCurrency(item.price)}
                          </span>
                        </div>

                        {/* Actions — download + review */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {/* Download button */}
                          {isCompleted && hasDownload && (
                            <button
                              onClick={() => handleDownload(item.id, item.product?.title)}
                              disabled={isDownloading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white text-xs font-bold transition-all"
                            >
                              {isDownloading
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Download className="w-3.5 h-3.5" />
                              }
                              {isDownloading ? 'Mengunduh...' : 'Download'}
                            </button>
                          )}

                          {/* Review button — hanya untuk order COMPLETED */}
                          {isCompleted && (
                            isReviewed ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                Sudah diulas
                              </span>
                            ) : (
                              <button
                                onClick={() => setReviewProduct({
                                  id: item.productId,
                                  title: item.product?.title,
                                  thumbnail: item.product?.thumbnail,
                                })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 text-xs font-semibold transition-all"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Beri Ulasan
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment info */}
            {order.payment && (
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Informasi Pembayaran
                </h2>

                <div className="space-y-3">
                  {[
                    { label: 'Status Pembayaran', value: PAYMENT_STATUS_LABEL[order.payment.status] ?? order.payment.status, highlight: ['SETTLEMENT','CAPTURE'].includes(order.payment.status) },
                    order.payment.paymentMethod && { label: 'Metode Pembayaran', value: order.payment.paymentMethod.replace(/_/g, ' ').toUpperCase() },
                    order.payment.transactionId && { label: 'Transaction ID', value: order.payment.transactionId, mono: true },
                    order.payment.paidAt && { label: 'Waktu Bayar', value: formatDate(order.payment.paidAt) },
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={cn(
                        'text-right font-medium max-w-[200px] break-all',
                        row.highlight ? 'text-success font-bold' : 'text-foreground',
                        row.mono && 'font-mono text-xs'
                      )}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {order.status === 'PENDING' && (
                  <button
                    onClick={handlePayNow}
                    className="w-full mt-2 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all hover:shadow-glow-primary"
                  >
                    Bayar Sekarang →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right col — summary */}
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Ringkasan
              </h2>

              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-success font-medium">-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kupon</span>
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md">{order.couponCode}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-display font-extrabold text-lg text-primary">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Order info */}
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Info Pesanan
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pesan</span>
                  <span className="font-medium text-foreground text-right">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Pesanan</span>
                  <span className="font-mono text-xs text-foreground">#{order.orderNumber}</span>
                </div>
                {order.affiliateCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kode Afiliasi</span>
                    <span className="font-mono text-xs text-foreground">{order.affiliateCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="bg-muted/50 rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">Ada masalah dengan pesanan ini?</p>
              <Link href="/support" className="text-xs font-semibold text-primary hover:underline">
                Hubungi Support →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
