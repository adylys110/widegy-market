'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Link2, DollarSign, Wallet, Zap, Bell, CheckCheck, ShoppingBag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopNavDropdown } from '@/components/shared/TopNavDropdown'

const navGroups = [
  {
    label: 'Affiliator',
    items: [
      { href: '/affiliator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/affiliator/links', icon: Link2, label: 'Link Affiliasi' },
      { href: '/affiliator/commissions', icon: DollarSign, label: 'Komisi' },
      { href: '/affiliator/withdrawals', icon: Wallet, label: 'Penarikan' },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { href: '/dashboard', icon: ShoppingBag, label: 'Mode Buyer' },
    ],
  },
]

type Notification = {
  id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string
}

function NotifDropdown() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifs(d.notifications ?? [])
      setUnread(d.unreadCount ?? 0)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAll = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifs(p => p.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-0.5">
            {unread > 9 ? '9+' : unread}
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
              {unread > 0 && (
                <button onClick={markAll} className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80">
                  <CheckCheck className="w-3 h-3" /> Baca semua
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold mb-0.5">Tidak ada notifikasi</p>
                </div>
              ) : notifs.map(n => (
                <div key={n.id} className={cn('flex gap-3 px-4 py-3 border-b border-border last:border-0', n.isRead ? '' : 'bg-primary/5')}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base flex-shrink-0">
                    {n.type === 'AFFILIATE' ? '🔗' : n.type === 'PAYMENT' ? '💳' : '🔔'}
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

export function AffiliatorLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Topbar */}
      <header className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center px-4 sm:px-6 gap-4 shadow-sm">
        {/* Logo */}
        <Link href="/affiliator/dashboard" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display font-bold text-sm leading-none">Widegy</p>
            <p className="text-[9px] text-amber-500 font-semibold leading-none">Affiliator</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 ml-auto">
          <NotifDropdown />
          <TopNavDropdown
            user={user}
            navGroups={navGroups}
            accentFrom="#F59E0B"
            accentTo="#FF6B35"
            roleBadge="Affiliator"
            roleBadgeColor="#F59E0B"
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
