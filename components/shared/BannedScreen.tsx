'use client'

import { signOut } from 'next-auth/react'
import { Ban, LogOut } from 'lucide-react'

interface BannedScreenProps {
  reason?: string | null
  bannedUntil?: string | null  // tanggal string
}

export function BannedScreen({ reason, bannedUntil }: BannedScreenProps) {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <Ban className="w-12 h-12 text-destructive" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">
        Akun Ditangguhkan
      </h1>

      {/* Duration */}
      <p className="text-lg text-muted-foreground mb-4">
        {bannedUntil
          ? <>Akun kamu ditangguhkan hingga <span className="font-bold text-destructive">{bannedUntil}</span></>
          : <>Akun kamu ditangguhkan <span className="font-bold text-destructive">secara permanen</span></>
        }
      </p>

      {/* Reason */}
      {reason && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl px-6 py-4 max-w-md mb-8">
          <p className="text-sm font-semibold text-destructive mb-1">Alasan:</p>
          <p className="text-sm text-foreground">{reason}</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Jika kamu merasa ini adalah kesalahan, silakan hubungi tim support kami untuk mengajukan banding.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="mailto:support@widegy.com"
          className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          Hubungi Support
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </div>
  )
}
