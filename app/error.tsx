'use client'

import { motion } from 'framer-motion'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center"
          >
            <AlertCircle className="w-8 h-8 text-destructive" />
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Halaman Error</h2>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </motion.div>
    </div>
  )
}
