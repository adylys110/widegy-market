'use client'

import { useEffect, useRef, useState } from 'react'

let lenisInstance: any = null

export function useCinematicScroll() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let lenis: any = null

    const init = async () => {
      try {
        const { default: Lenis } = await import('lenis')

        lenis = new Lenis({
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.5,
        })

        lenisInstance = lenis

        lenis.on('scroll', ({ progress }: { progress: number }) => {
          setScrollProgress(progress)
        })

        function raf(time: number) {
          lenis.raf(time)
          rafRef.current = requestAnimationFrame(raf)
        }
        rafRef.current = requestAnimationFrame(raf)
      } catch (e) {
        console.warn('[useCinematicScroll] Lenis init failed, using native scroll:', e)

        // Fallback: native scroll listener
        const onScroll = () => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          if (docHeight > 0) {
            setScrollProgress(window.scrollY / docHeight)
          }
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        rafRef.current = -1 // flag: using native

        return () => window.removeEventListener('scroll', onScroll)
      }
    }

    init()

    return () => {
      if (rafRef.current > 0) cancelAnimationFrame(rafRef.current)
      if (lenis && lenis.destroy) {
        try { lenis.destroy() } catch {}
      }
      lenisInstance = null
    }
  }, [])

  return { scrollProgress }
}

export { lenisInstance }
