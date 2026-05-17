'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('[Global Error]', error)
  }, [error])

  return (
    <html lang="id">
      <body className="bg-background font-sans antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-md w-full text-center space-y-6"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Terjadi Kesalahan</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ada sesuatu yang tidak beres. Tim kami sudah diberitahu dan sedang memperbaikinya.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground/60 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                Ke Beranda
              </Link>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  )
}
