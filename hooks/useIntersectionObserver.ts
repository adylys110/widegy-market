'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    triggerOnce = true,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const elementRef = useRef<Element | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (!node) return

      elementRef.current = node

      observerRef.current = new IntersectionObserver(
        ([observerEntry]) => {
          setEntry(observerEntry)
          if (observerEntry.isIntersecting) {
            setIsVisible(true)
            if (triggerOnce) {
              observerRef.current?.disconnect()
            }
          } else if (!triggerOnce) {
            setIsVisible(false)
          }
        },
        { threshold, root, rootMargin }
      )

      observerRef.current.observe(node)
    },
    [threshold, root, rootMargin, triggerOnce]
  )

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return { ref, isVisible, entry }
}
