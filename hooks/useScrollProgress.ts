'use client'

import { useEffect, useState, useCallback } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down'>('down')
  const [isAtTop, setIsAtTop] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)

  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight

    // Progress (0-100)
    const currentProgress = documentHeight > 0
      ? Math.min((currentScrollY / documentHeight) * 100, 100)
      : 0

    setProgress(currentProgress)
    setScrollY(currentScrollY)
    setIsAtTop(currentScrollY < 10)
    setIsAtBottom(currentProgress > 99)

    // Direction
    if (currentScrollY > lastScrollY.current + 5) {
      setDirection('down')
    } else if (currentScrollY < lastScrollY.current - 5) {
      setDirection('up')
    }

    lastScrollY.current = currentScrollY
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { progress, scrollY, direction, isAtTop, isAtBottom }
}

// Helper ref for lastScrollY that persists without re-render
function useRef<T>(initialValue: T) {
  const [ref] = useState({ current: initialValue })
  return ref
}
