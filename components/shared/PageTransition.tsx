'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
  mode?: 'fade' | 'slide' | 'scale'
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
}

export function PageTransition({ children, mode = 'fade' }: PageTransitionProps) {
  const pathname = usePathname()
  const v = variants[mode]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Simple fade wrapper for components
export function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Slide in from side
export function SlideIn({
  children,
  from = 'left',
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  from?: 'left' | 'right' | 'top' | 'bottom'
  delay?: number
  className?: string
}) {
  const initialMap = {
    left: { x: -24, opacity: 0 },
    right: { x: 24, opacity: 0 },
    top: { y: -24, opacity: 0 },
    bottom: { y: 24, opacity: 0 },
  }

  return (
    <motion.div
      initial={initialMap[from]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
