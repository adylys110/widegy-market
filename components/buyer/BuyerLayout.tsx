'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Heart, ShoppingCart,
  User, Bell, Zap, Store, CheckCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlobalSearch } from '@/components/shared/GlobalSearch'
import { TopNavDropdown } from '@/components/shared/TopNavDropdown'

const navGroups = [
  {
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/browse', icon: ShoppingBag, label: 'Jelajahi' },
      { href: '/orders', icon: ShoppingBag, label: 'Pesanan' },
      { href: '/wishlist', icon: Heart, label: 'Wishlist' },
      { href: '/cart', icon: ShoppingCart, label: 'Keranjang' },
      { href: '/profile', icon: User, label: 'Profil' },
    ],
  },
  {
    label: 'Upgrade',
    items: [
      { href: '/dashboard', icon: Store, label: 'Seller / Affiliator', badge: 'Upgrade', badgeColor: '#FF6B35' },
    ],
  },
]

type Notification = {
  id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string
}

function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {}
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const NOTIF_ICONS: Record<string, string> = {
    PAYMENT: '💳', ORDER: '📦', PRODUCT: '🛍️', SYSTEM: '🔔', REVIEW: '⭐', AFFILIATE: '🔗',
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card-hover border border-border overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="font-display font-bold text-sm">Notifikasi</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80">
                  <CheckCheck className="w-3 h-3" /> Tandai semua dibaca
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold mb-0.5">Tidak ada notifikasi</p>
                  <p className="text-xs text-muted-foreground">Kamu sudah up to date!</p>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} className={cn('flex gap-3 px-4 py-3', n.isRead ? '' : 'bg-primary/5')}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base flex-shrink-0">
                    {NOTIF_ICONS[n.type] ?? '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center px-4 sm:px-6 gap-4 shadow-sm">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 group mr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="hidden sm:block font-display font-bold text-lg text-foreground">Widegy</span>
        </Link>

        {/* Global Search */}
        <GlobalSearch className="flex-1 max-w-md" />

        <div className="flex items-center gap-2 ml-auto">
          <NotificationDropdown />
          <TopNavDropdown
            user={user}
            navGroups={navGroups}
            accentFrom="#FF6B35"
            accentTo="#F59E0B"
            roleBadge="Buyer"
            roleBadgeColor="#06B6D4"
          />
        </div>
      </header>

      {/* Page content — full width */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
