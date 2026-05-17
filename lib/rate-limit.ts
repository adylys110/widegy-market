import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  limit: number
  windowMs: number
}

// In-memory store (use Redis for production)
const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit(config: RateLimitConfig) {
  const { limit, windowMs } = config

  return function rateLimitMiddleware(
    req: NextRequest,
    identifier?: string
  ): { success: boolean; remaining: number; resetAt: number } | NextResponse {
    const ip =
      identifier ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anonymous'

    const key = `${req.nextUrl.pathname}:${ip}`
    const now = Date.now()

    const existing = store.get(key)

    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs
      store.set(key, { count: 1, resetAt })
      return { success: true, remaining: limit - 1, resetAt }
    }

    if (existing.count >= limit) {
      return NextResponse.json(
        {
          error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
          retryAfter: Math.ceil((existing.resetAt - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': existing.resetAt.toString(),
            'Retry-After': Math.ceil((existing.resetAt - now) / 1000).toString(),
          },
        }
      )
    }

    existing.count++
    return {
      success: true,
      remaining: limit - existing.count,
      resetAt: existing.resetAt,
    }
  }
}

// Preset rate limiters
export const authRateLimit = rateLimit({ limit: 10, windowMs: 60 * 1000 })          // 10/min
export const apiRateLimit = rateLimit({ limit: 100, windowMs: 60 * 1000 })           // 100/min
export const uploadRateLimit = rateLimit({ limit: 5, windowMs: 60 * 1000 })          // 5/min
export const checkoutRateLimit = rateLimit({ limit: 3, windowMs: 60 * 1000 })        // 3/min
export const searchRateLimit = rateLimit({ limit: 30, windowMs: 60 * 1000 })         // 30/min
export const reviewRateLimit = rateLimit({ limit: 5, windowMs: 10 * 60 * 1000 })     // 5/10min
