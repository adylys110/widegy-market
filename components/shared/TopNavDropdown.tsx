'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, X } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

export type NavItem = {
  href: string
  icon: React.ElementType
  label: string
  badge?: string
  badgeColor?: string
}

export type NavGroup = {
  label?: string
  items: NavItem[]
}

type Props = {
  user: any
  navGroups: NavGroup[]
  accentFrom?: string
  accentTo?: string
  roleBadge?: string
  roleBadgeColor?: string
  logoIcon?: React.ReactNode
  logoLabel?: string
  logoSubLabel?: string
}

export function TopNavDropdown({
  user,
  navGroups,
  accentFrom = '#FF6B35',
  accentTo = '#06B6D4',
  roleBadge,
  roleBadgeColor = '#FF6B35',
  logoIcon,
  logoLabel = 'Widegy',
  logoSubLabel,
}: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  const allItems = navGroups.flatMap(g => g.items)
  const activeItem = allItems.find(
    item => pathname === item.href || (item.href.length > 1 && pathname.startsWith(item.href))
  )

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl transition-all duration-200',
          'bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/30',
          open && 'shadow-md border-primary/30'
        )}
        aria-label="Buka menu navigasi"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            getInitials(user?.name ?? 'U')
          )}
        </div>

        {/* Name + active page */}
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-xs font-bold text-foreground max-w-[90px] truncate">
            {user?.name ?? 'Pengguna'}
          </span>
          {activeItem && (
            <span className="text-[10px] text-muted-foreground mt-0.5">{activeItem.label}</span>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[9999]"
          >
            {/* Header */}
            <div
              className="px-4 py-4 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accentFrom}15, ${accentTo}10)` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
                >
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    getInitials(user?.name ?? 'U')
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name ?? 'Pengguna'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  {roleBadge && (
                    <span
                      className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 text-white"
                      style={{ backgroundColor: roleBadgeColor }}
                    >
                      {roleBadge}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-black/10 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Nav items */}
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {navGroups.map((group, gi) => (
                <div key={gi} className={gi > 0 ? 'mt-1 pt-1 border-t border-border' : ''}>
                  {group.label && (
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1.5">
                      {group.label}
                    </p>
                  )}
                  {group.items.map(({ href, icon: Icon, label, badge, badgeColor }) => {
                    const active =
                      pathname === href || (href.length > 1 && pathname.startsWith(href))
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                          active
                            ? 'text-white'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                        )}
                        style={active ? { background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` } : {}}
                      >
                        <Icon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                        <span className="flex-1">{label}</span>
                        {badge && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white flex-shrink-0"
                            style={{ backgroundColor: badgeColor ?? accentFrom }}
                          >
                            {badge}
                          </span>
                        )}
                        {active && (
                          <motion.div
                            layoutId="dropdown-active-dot"
                            className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0"
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
