'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, UserPlus, Check, X } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

const passwordRequirements = [
  { label: 'Minimal 8 karakter', test: (p: string) => p.length >= 8 },
  { label: 'Mengandung huruf kapital', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Mengandung angka', test: (p: string) => /[0-9]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch('password', '')

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Registrasi gagal. Coba lagi.')
        return
      }

      toast.success('Akun berhasil dibuat! Sedang masuk...')

      // Auto login setelah register
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.info('Akun dibuat. Silakan login manual.')
        router.push('/login')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      toast.error('Gagal masuk dengan Google.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Buat akun gratis</h1>
        <p className="text-muted-foreground text-sm">
          Bergabung dengan ribuan kreator dan pembeli di Widegy.
        </p>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
        className={cn(
          'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border',
          'bg-surface hover:bg-muted/50 transition-smooth font-medium text-foreground text-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isGoogleLoading ? 'Memuat...' : 'Daftar dengan Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-xs">atau</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nama lengkap
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Nama kamu"
            autoComplete="name"
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-surface text-foreground text-sm',
              'placeholder:text-muted-foreground/60',
              'transition-smooth focus:ring-2 focus:ring-primary/30 focus:border-primary',
              errors.name ? 'border-destructive focus:ring-destructive/30' : 'border-border'
            )}
          />
          {errors.name && (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password', {
                onChange: (e) => setPasswordValue(e.target.value),
              })}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(
                'w-full px-4 py-3 pr-11 rounded-xl border bg-surface text-foreground text-sm',
                'placeholder:text-muted-foreground/60',
                'transition-smooth focus:ring-2 focus:ring-primary/30 focus:border-primary',
                errors.password ? 'border-destructive focus:ring-destructive/30' : 'border-border'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password requirements */}
          {(passwordValue || watchedPassword) && (
            <div className="space-y-1.5 pt-1">
              {passwordRequirements.map((req) => {
                const passed = req.test(passwordValue || watchedPassword || '')
                return (
                  <div key={req.label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-smooth',
                        passed ? 'bg-success' : 'bg-muted'
                      )}
                    >
                      {passed ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <X className="w-2.5 h-2.5 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs transition-smooth',
                        passed ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      {req.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {errors.password && !passwordValue && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Konfirmasi password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className={cn(
                'w-full px-4 py-3 pr-11 rounded-xl border bg-surface text-foreground text-sm',
                'placeholder:text-muted-foreground/60',
                'transition-smooth focus:ring-2 focus:ring-primary/30 focus:border-primary',
                errors.confirmPassword
                  ? 'border-destructive focus:ring-destructive/30'
                  : 'border-border'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Dengan mendaftar, kamu menyetujui{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Kebijakan Privasi
          </Link>{' '}
          Widegy.
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
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
            <UserPlus className="w-4 h-4" />
          )}
          {isSubmitting ? 'Membuat akun...' : 'Buat akun gratis'}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Masuk sekarang
        </Link>
      </p>
    </div>
  )
}
