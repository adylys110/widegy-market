'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  once?: boolean
  threshold?: number
}

const directionMap = {
  up:    { y: 30, x: 0 },
  down:  { y: -30, x: 0 },
  left:  { y: 0, x: 30 },
  right: { y: 0, x: -30 },
  none:  { y: 0, x: 0 },
}

export function ScrollReveal({
  children, className, delay = 0, duration = 0.5,
  direction = 'up', distance, once = true, threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // margin must be a valid CSS margin string e.g. "0px 0px -100px 0px"
  const marginPx = `-${Math.round(threshold * 100)}px`
  const isInView = useInView(ref, {
    once,
    margin: `0px 0px ${marginPx} 0px` as any,
  })

  const initial = distance
    ? {
        opacity: 0,
        x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
        y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      }
    : { opacity: 0, ...directionMap[direction] }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

// Stagger children reveal
interface StaggerRevealProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
}

export function StaggerReveal({
  children, className, staggerDelay = 0.1, initialDelay = 0,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' as any })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: { transition: { delayChildren: initialDelay, staggerChildren: staggerDelay } },
        hidden: {},
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
