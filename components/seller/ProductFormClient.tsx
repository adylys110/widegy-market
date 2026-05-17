'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Upload, X, Image as ImageIcon, Link2,
  Package, DollarSign, Tag, FileText, Save, Loader2,
  FolderOpen, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { cn, slugify } from '@/lib/utils'
import { ProductCategory } from '@prisma/client'
import { toast } from 'sonner'

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'TEMPLATE', label: 'Template' }, { value: 'UI_KIT', label: 'UI Kit' },
  { value: 'ILLUSTRATION', label: 'Ilustrasi' }, { value: 'ICON_PACK', label: 'Icon Pack' },
  { value: 'FONT', label: 'Font' }, { value: 'PLUGIN', label: 'Plugin' },
  { value: 'PRESET', label: 'Preset' }, { value: 'EBOOK', label: 'E-Book' },
  { value: 'COURSE', label: 'Kursus Online' }, { value: 'SOURCE_CODE', label: 'Source Code' },
  { value: 'MUSIC', label: 'Musik' }, { value: 'VIDEO', label: 'Video' },
  { value: 'PHOTOGRAPHY', label: 'Fotografi' }, { value: 'THREE_D', label: '3D Asset' },
  { value: 'OTHER', label: 'Lainnya' },
]

type FormData = {
  title: string; slug: string; description: string; shortDescription: string
  price: string; discountPrice: string; category: ProductCategory | ''
  tags: string; thumbnail: string; previewUrl: string; downloadUrl: string
  fileSize: string; fileType: string; commissionRate: string; metaTitle: string; metaDescription: string
}

type ThumbnailMode = 'url' | 'upload'
type DownloadMode = 'url' | 'upload'

function InputField({ label, id, required, children, hint }: {
  label: string; id: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-foreground flex items-center gap-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"

// ── File Upload Component ──────────────────────────────────────────
function FileUploadZone({ label, accept, onFile, preview, hint }: {
  label: string; accept: string; onFile: (url: string, name?: string) => void
  preview?: string; hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFile = async (file: File) => {
    setUploading(true)
    setFileName(file.name)
    try {
      // Upload ke API endpoint
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload gagal')
      const { url } = await res.json()
      onFile(url, file.name)
      toast.success('File berhasil diupload!')
    } catch {
      // Fallback: buat object URL lokal untuk preview (akan hilang saat reload)
      const localUrl = URL.createObjectURL(file)
      onFile(localUrl, file.name)
      toast.warning('Upload ke server gagal, menggunakan preview lokal')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group min-h-[140px]',
        dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30'
      )}
    >
      <input
        ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Mengupload...</p>
        </div>
      ) : preview ? (
        <div className="w-full">
          {accept.includes('image') ? (
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl mb-2" />
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{fileName || 'File dipilih'}</p>
                <p className="text-xs text-muted-foreground">Klik untuk ganti</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground">Klik atau drag untuk ganti</p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground text-center">{hint ?? 'Drag & drop atau klik untuk pilih'}</p>
        </>
      )}
    </div>
  )
}

// ── Mode Selector ──────────────────────────────────────────────────
function ModeSelector({ mode, onChange, label }: {
  mode: 'url' | 'upload'; onChange: (m: 'url' | 'upload') => void; label: string
}) {
  return (
    <div className="flex gap-2 mb-3">
      <p className="text-sm font-semibold text-foreground mr-auto self-center">{label}</p>
      {(['url', 'upload'] as const).map(m => (
        <button key={m} type="button" onClick={() => onChange(m)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
            mode === m
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
          )}>
          {m === 'url' ? <Link2 className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
          {m === 'url' ? 'Link URL' : 'Upload File'}
        </button>
      ))}
    </div>
  )
}

export function ProductFormClient({ mode, sellerProfile, product }: {
  mode: 'create' | 'edit'; sellerProfile: any; product?: any
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'pricing' | 'seo'>('basic')
  const [thumbnailMode, setThumbnailMode] = useState<ThumbnailMode>('url')
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('url')
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(product?.thumbnail ?? '')

  const [form, setForm] = useState<FormData>({
    title: product?.title ?? '', slug: product?.slug ?? '',
    description: product?.description ?? '', shortDescription: product?.shortDescription ?? '',
    price: product?.price?.toString() ?? '', discountPrice: product?.discountPrice?.toString() ?? '',
    category: product?.category ?? '', tags: product?.tags?.join(', ') ?? '',
    thumbnail: product?.thumbnail ?? '', previewUrl: product?.previewUrl ?? '',
    downloadUrl: product?.downloadUrl ?? '', fileSize: product?.fileSize ?? '',
    fileType: product?.fileType ?? '', commissionRate: product?.commissionRate?.toString() ?? '10',
    metaTitle: product?.metaTitle ?? '', metaDescription: product?.metaDescription ?? '',
  })

  const set = (key: keyof FormData, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'title' && mode === 'create') next.slug = slugify(val)
      return next
    })
  }

  const handleSubmit = async (status: 'DRAFT' | 'PENDING_REVIEW') => {
    if (!form.title || !form.category || !form.price || !form.description) {
      toast.error('Lengkapi field yang wajib diisi'); return
    }
    if (!form.thumbnail) {
      toast.error('Thumbnail produk wajib diisi'); return
    }
    setLoading(true)
    try {
      const payload = {
        ...form, price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        commissionRate: parseFloat(form.commissionRate) / 100, status,
      }
      const url = mode === 'edit' ? `/api/seller/products/${product.id}` : '/api/seller/products'
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Terjadi kesalahan') }
      toast.success(mode === 'edit' ? 'Produk diperbarui!' : status === 'DRAFT' ? 'Disimpan sebagai draft' : 'Produk dikirim untuk review!')
      router.push('/seller/products'); router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Gagal menyimpan produk')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'basic', label: 'Info Dasar', icon: Package },
    { id: 'media', label: 'Media & File', icon: ImageIcon },
    { id: 'pricing', label: 'Harga', icon: DollarSign },
    { id: 'seo', label: 'SEO', icon: Tag },
  ] as const

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/seller/products" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">
            {mode === 'edit' ? 'Edit Produk' : 'Upload Produk Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sellerProfile.storeName} · {mode === 'edit' ? 'Perbarui detail produk' : 'Isi detail produk dengan lengkap'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeTab === id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          {activeTab === 'basic' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-display font-bold text-foreground">Informasi Produk</h2>
              <InputField label="Judul Produk" id="title" required>
                <input id="title" value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="Nama produk yang menarik..." className={inputCls} />
              </InputField>
              <InputField label="Slug URL" id="slug" hint="Otomatis dibuat dari judul">
                <input id="slug" value={form.slug} onChange={e => set('slug', e.target.value)}
                  placeholder="nama-produk-saya" className={inputCls} />
              </InputField>
              <InputField label="Deskripsi Singkat" id="shortDescription">
                <input id="shortDescription" value={form.shortDescription}
                  onChange={e => set('shortDescription', e.target.value)}
                  placeholder="Rangkuman 1-2 kalimat tentang produk..." className={inputCls} />
              </InputField>
              <InputField label="Deskripsi Lengkap" id="description" required>
                <textarea id="description" value={form.description}
                  onChange={e => set('description', e.target.value)} rows={6}
                  placeholder="Jelaskan fitur, spesifikasi, dan keunggulan produkmu..."
                  className={cn(inputCls, 'resize-y min-h-[120px]')} />
              </InputField>
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField label="Kategori" id="category" required>
                  <select id="category" value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}
                    className={cn(inputCls, !form.category && 'text-muted-foreground/60')}>
                    <option value="" disabled>Pilih kategori</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </InputField>
                <InputField label="Tags" id="tags" hint="Pisah dengan koma">
                  <input id="tags" value={form.tags} onChange={e => set('tags', e.target.value)}
                    placeholder="figma, dark mode, ui..." className={inputCls} />
                </InputField>
              </div>
            </motion.div>
          )}

          {/* Media & Files */}
          {activeTab === 'media' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 space-y-6">
              <h2 className="font-display font-bold text-foreground">Media & File</h2>

              {/* Thumbnail section */}
              <div className="space-y-3">
                <ModeSelector
                  mode={thumbnailMode}
                  onChange={m => { setThumbnailMode(m); set('thumbnail', ''); setThumbnailPreview('') }}
                  label="Thumbnail / Foto Produk *"
                />
                {thumbnailMode === 'url' ? (
                  <div className="space-y-2">
                    <input value={form.thumbnail} onChange={e => { set('thumbnail', e.target.value); setThumbnailPreview(e.target.value) }}
                      placeholder="https://..." className={inputCls} />
                    {thumbnailPreview && (
                      <div className="rounded-xl overflow-hidden border border-border h-40">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover"
                          onError={() => setThumbnailPreview('')} />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Gambar utama produk (rasio 16:9 direkomendasikan)</p>
                  </div>
                ) : (
                  <FileUploadZone
                    label="Upload Foto Produk"
                    accept="image/*"
                    preview={thumbnailPreview}
                    hint="PNG, JPG, WebP · Maks 10MB · Rasio 16:9 direkomendasikan"
                    onFile={(url, name) => { set('thumbnail', url); setThumbnailPreview(url) }}
                  />
                )}
              </div>

              <div className="border-t border-border pt-4">
                <InputField label="URL Preview / Demo" id="previewUrl"
                  hint="Link demo, Behance, Figma, atau halaman preview">
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input id="previewUrl" value={form.previewUrl} onChange={e => set('previewUrl', e.target.value)}
                      placeholder="https://figma.com/..." className={cn(inputCls, 'pl-9')} />
                  </div>
                </InputField>
              </div>

              {/* Download section */}
              <div className="space-y-3 border-t border-border pt-4">
                <ModeSelector
                  mode={downloadMode}
                  onChange={m => { setDownloadMode(m); set('downloadUrl', '') }}
                  label="File Download Produk *"
                />
                {downloadMode === 'url' ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input id="downloadUrl" value={form.downloadUrl} onChange={e => set('downloadUrl', e.target.value)}
                        placeholder="https://drive.google.com/..." className={cn(inputCls, 'pl-9')} />
                    </div>
                    <p className="text-xs text-muted-foreground">Google Drive, Dropbox, atau CDN (hanya buyer yang sudah bayar bisa download)</p>
                  </div>
                ) : (
                  <FileUploadZone
                    label="Upload File Produk"
                    accept="*/*"
                    preview={form.downloadUrl}
                    hint="Semua format diperbolehkan · Maks 500MB"
                    onFile={(url, name) => {
                      set('downloadUrl', url)
                      if (name) {
                        const ext = name.split('.').pop() ?? ''
                        if (!form.fileType) set('fileType', '.' + ext)
                      }
                    }}
                  />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 border-t border-border pt-4">
                <InputField label="Ukuran File" id="fileSize" hint='Contoh: "45 MB"'>
                  <input id="fileSize" value={form.fileSize} onChange={e => set('fileSize', e.target.value)}
                    placeholder="45 MB" className={inputCls} />
                </InputField>
                <InputField label="Tipe File" id="fileType" hint='Contoh: ".fig, .zip"'>
                  <input id="fileType" value={form.fileType} onChange={e => set('fileType', e.target.value)}
                    placeholder=".fig, .zip" className={inputCls} />
                </InputField>
              </div>
            </motion.div>
          )}

          {/* Pricing */}
          {activeTab === 'pricing' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-display font-bold text-foreground">Harga & Komisi</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField label="Harga Normal (Rp)" id="price" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                    <input id="price" type="number" value={form.price}
                      onChange={e => set('price', e.target.value)} placeholder="150000" className={cn(inputCls, 'pl-9')} />
                  </div>
                </InputField>
                <InputField label="Harga Diskon (Rp)" id="discountPrice" hint="Opsional">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                    <input id="discountPrice" type="number" value={form.discountPrice}
                      onChange={e => set('discountPrice', e.target.value)} placeholder="99000" className={cn(inputCls, 'pl-9')} />
                  </div>
                </InputField>
              </div>
              <InputField label="Komisi Affiliator (%)" id="commissionRate"
                hint="Persentase yang diberikan ke affiliator (default 10%)">
                <div className="relative">
                  <input id="commissionRate" type="number" min="0" max="50" value={form.commissionRate}
                    onChange={e => set('commissionRate', e.target.value)} className={cn(inputCls, 'pr-8')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
              </InputField>
              {form.price && form.discountPrice && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm font-semibold text-green-700">
                    Diskon: {Math.round((1 - parseFloat(form.discountPrice) / parseFloat(form.price)) * 100)}%
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Hemat Rp {(parseFloat(form.price) - parseFloat(form.discountPrice)).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 space-y-5">
              <h2 className="font-display font-bold text-foreground">SEO & Metadata</h2>
              <InputField label="Meta Title" id="metaTitle" hint="Maks 60 karakter">
                <input id="metaTitle" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)}
                  maxLength={60} placeholder={form.title || "Judul untuk SEO"} className={inputCls} />
              </InputField>
              <InputField label="Meta Description" id="metaDescription" hint="Maks 160 karakter">
                <textarea id="metaDescription" value={form.metaDescription}
                  onChange={e => set('metaDescription', e.target.value)} rows={3} maxLength={160}
                  placeholder={form.shortDescription || "Deskripsi singkat untuk SEO..."}
                  className={cn(inputCls, 'resize-none')} />
              </InputField>
              <div className="p-4 bg-muted/40 rounded-xl border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Preview Google</p>
                <p className="text-base font-semibold text-blue-700 truncate">{form.metaTitle || form.title || 'Judul Produk'}</p>
                <p className="text-[11px] text-green-700">widegy.id/products/{form.slug || 'slug-produk'}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.metaDescription || form.shortDescription || 'Deskripsi produk akan muncul di sini...'}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <h3 className="font-display font-bold text-sm text-foreground">Publikasi</h3>
            <button onClick={() => handleSubmit('PENDING_REVIEW')} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {mode === 'edit' ? 'Simpan & Submit Review' : 'Submit untuk Review'}
            </button>
            <button onClick={() => handleSubmit('DRAFT')} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-muted/80 transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> Simpan Draft
            </button>
          </div>
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">💡 Tips Produk Terlaris</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Thumbnail berkualitas tinggi</li>
              <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Deskripsi detail dan informatif</li>
              <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Harga kompetitif dengan diskon</li>
              <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Tags relevan untuk pencarian</li>
              <li className="flex gap-2"><span className="text-primary font-bold">✓</span> Preview/demo yang menarik</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">Status Review</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Setelah submit, admin akan review produkmu dalam <strong className="text-foreground">1×24 jam</strong>.</p>
              <p>Produk yang disetujui akan langsung aktif di marketplace.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
