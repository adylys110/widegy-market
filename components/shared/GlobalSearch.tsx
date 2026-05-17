'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, X, Loader2, TrendingUp, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  TEMPLATE: 'Template', UI_KIT: 'UI Kit', ILLUSTRATION: 'Ilustrasi',
  ICON_PACK: 'Icon Pack', FONT: 'Font', PLUGIN: 'Plugin',
  PRESET: 'Preset', EBOOK: 'E-Book', COURSE: 'Course',
  SOURCE_CODE: 'Source Code', MUSIC: 'Musik', VIDEO: 'Video',
  PHOTOGRAPHY: 'Foto', THREE_D: '3D Asset', OTHER: 'Lainnya',
}

const RECENT_SEARCHES_KEY = 'widegy_recent_searches'

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(q: string) {
  if (typeof window === 'undefined') return
  const prev = getRecentSearches().filter((s) => s !== q)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([q, ...prev].slice(0, 5)))
}

export function GlobalSearch({ className }: { className?: string }) {
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef  = useRef<HTMLDivElement>(null)

  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recent,  setRecent]  = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setRecent(getRecentSearches())
  }, [])

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSuggestions([]); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=6`)
      const data = await res.json()
      setResults(data.products ?? [])
      setSuggestions(data.suggestions ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    setRecent(getRecentSearches())
    setOpen(false)
    router.push(`/browse?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelect = (q: string) => {
    setQuery(q)
    saveRecentSearch(q)
    setRecent(getRecentSearches())
    setOpen(false)
    router.push(`/browse?q=${encodeURIComponent(q)}`)
  }

  const clearQuery = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
    inputRef.current?.focus()
  }

  const showDropdown = open && (query.length >= 2 ? true : recent.length > 0)

  return (
    <div className={cn('relative', className)} ref={dropRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            placeholder="Cari produk digital..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-muted/60 rounded-xl border border-transparent focus:border-primary/30 focus:outline-none focus:bg-white transition-all duration-200"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-card-hover border border-border overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* Recent searches — tampil saat query kosong */}
            {query.length < 2 && recent.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pencarian Terakhir
                </p>
                <div className="space-y-0.5">
                  {recent.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSelect(q)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted text-sm text-left transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag suggestions */}
            {query.length >= 2 && suggestions.length > 0 && (
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Saran Pencarian
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSelect(s)}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary font-medium transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product results */}
            {query.length >= 2 && (
              <div>
                {loading && results.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : results.length === 0 && !loading ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Package className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground">Tidak ditemukan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Coba kata kunci lain</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-5 py-2">
                      Produk
                    </p>
                    <div className="divide-y divide-border">
                      {results.map((product) => {
                        const price = product.discountPrice ?? product.price
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => {
                              saveRecentSearch(query)
                              setRecent(getRecentSearches())
                              setOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                              {product.thumbnail ? (
                                <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">
                                  {product.seller?.storeName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {CATEGORY_LABELS[product.category] ?? product.category}
                                </span>
                              </div>
                            </div>
                            <span className="font-display font-bold text-sm text-foreground flex-shrink-0">
                              {formatCurrency(price)}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                    <Link
                      href={`/browse?q=${encodeURIComponent(query)}`}
                      onClick={() => { saveRecentSearch(query); setOpen(false) }}
                      className="flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border"
                    >
                      Lihat semua hasil untuk &ldquo;{query}&rdquo; →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
