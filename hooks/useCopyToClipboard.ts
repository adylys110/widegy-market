'use client'

import { useState, useCallback } from 'react'

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setCopiedText(text)

        setTimeout(() => {
          setCopied(false)
          setCopiedText(null)
        }, resetDelay)

        return true
      } catch {
        // Fallback for older browsers
        try {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          const success = document.execCommand('copy')
          document.body.removeChild(textArea)

          if (success) {
            setCopied(true)
            setCopiedText(text)
            setTimeout(() => {
              setCopied(false)
              setCopiedText(null)
            }, resetDelay)
          }

          return success
        } catch {
          return false
        }
      }
    },
    [resetDelay]
  )

  return { copy, copied, copiedText }
}
