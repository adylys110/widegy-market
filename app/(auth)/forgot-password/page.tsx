'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      // TODO: Hubungkan ke API reset password saat email service aktif
      // const res = await fetch('/api/auth/forgot-password', { ... })

      // Simulasi delay untuk UX (ganti dengan API call nyata)
      await new Promise((resolve) => setTimeout(resolve, 1200))

      setSubmittedEmail(data.email)
      setIsSubmitted(true)
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Cek email kamu</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Kami telah mengirim link reset password ke{' '}
            <span className="font-semibold text-foreground">{submittedEmail}</span>.
            Link berlaku selama 1 jam.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-muted/60 rounded-xl px-4 py-3.5 text-left space-y-1.5">
          <p className="text-xs font-semibold text-foreground">Tidak menerima email?</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Cek folder spam atau junk</li>
            <li>Pastikan email yang dimasukkan benar</li>
            <li>Tunggu beberapa menit lalu coba lagi</li>
          </ul>
        </div>

        {/* Resend */}
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className="text-primary text-sm font-semibold hover:underline"
        >
          Kirim ulang email
        </button>

        {/* Back to login */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke login
      </Link>

      {/* Icon */}
      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
        <Mail className="w-6 h-6 text-primary" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Lupa password?</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Masukkan email yang terdaftar. Kami akan kirim link untuk reset password kamu.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="kamu@email.com"
            autoComplete="email"
            autoFocus
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-surface text-foreground text-sm',
              'placeholder:text-muted-foreground/60',
              'transition-smooth focus:ring-2 focus:ring-primary/30 focus:border-primary',
              errors.email ? 'border-destructive focus:ring-destructive/30' : 'border-border'
            )}
          />
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'bg-primary hover:bg-primary-600 text-white font-semibold text-sm',
            'transition-smooth shadow-glow-primary/30',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {isSubmitting ? 'Mengirim...' : 'Kirim link reset password'}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Ingat password kamu?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Masuk sekarang
        </Link>
      </p>
    </div>
  )
}
