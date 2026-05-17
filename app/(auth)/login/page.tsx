'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.startsWith('AccountBanned:')) {
          // Format: AccountBanned:tanggal:alasan
          const parts = result.error.split(':')
          const until = parts[1] ?? 'permanen'
          const reason = parts.slice(2).join(':') || 'Melanggar ketentuan layanan'
          toast.error(
            `Akun kamu ditangguhkan hingga ${until}. Alasan: ${reason}`,
            { duration: 8000 }
          )
        } else if (result.error === 'AccountBanned') {
          toast.error('Akun kamu telah ditangguhkan. Hubungi support.', { duration: 6000 })
        } else if (result.error === 'AccountInactive') {
          toast.error('Akun kamu belum aktif.')
        } else {
          toast.error('Email atau password salah.')
        }
        return
      }

      toast.success('Berhasil masuk!')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Terjadi kesalahan. Coba lagi.')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch {
      toast.error('Gagal masuk dengan Google.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Selamat datang kembali</h1>
        <p className="text-muted-foreground text-sm">
          Masuk ke akun Widegy kamu untuk melanjutkan.
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
        {isGoogleLoading ? 'Memuat...' : 'Masuk dengan Google'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-xs">atau</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-primary text-xs hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

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
            <LogIn className="w-4 h-4" />
          )}
          {isSubmitting ? 'Memuat...' : 'Masuk'}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  )
}
