'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseDebounceOptions {
  delay: number
  immediate?: boolean
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  { delay, immediate = false }: UseDebounceOptions
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout>()
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerRef.current)

      if (immediate && !timerRef.current) {
        callbackRef.current(...args)
      }

      timerRef.current = setTimeout(() => {
        if (!immediate) {
          callbackRef.current(...args)
        }
        timerRef.current = undefined
      }, delay)
    },
    [delay, immediate]
  )
}
