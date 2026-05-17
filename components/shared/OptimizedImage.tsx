'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  quality?: number
  fallback?: 'product' | 'avatar' | 'banner'
  sizes?: string
}

const fallbackStyles = {
  product: 'bg-gradient-to-br from-primary/5 to-secondary/5',
  avatar: 'bg-gradient-to-br from-primary/10 to-accent/10',
  banner: 'bg-gradient-mesh',
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  objectFit = 'cover',
  quality = 85,
  fallback = 'product',
  sizes,
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const validSrc = src && !error ? src : null

  if (!validSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          fallbackStyles[fallback],
          className
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!loaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse',
            fallbackStyles[fallback]
          )}
        />
      )}

      <Image
        src={validSrc}
        alt={alt}
        width={!fill ? (width ?? 400) : undefined}
        height={!fill ? (height ?? 300) : undefined}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes ?? (fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined)}
        className={cn(
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}

// Avatar component
export function UserAvatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const colors = [
    'from-primary to-accent',
    'from-secondary to-primary',
    'from-accent to-secondary',
    'from-primary/70 to-secondary/70',
  ]
  const colorIndex = name.charCodeAt(0) % colors.length

  if (!src || error) {
    return (
      <div
        className={cn(
          `bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center rounded-full text-white font-bold flex-shrink-0`,
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn('rounded-full object-cover flex-shrink-0', className)}
      onError={() => setError(true)}
    />
  )
}
