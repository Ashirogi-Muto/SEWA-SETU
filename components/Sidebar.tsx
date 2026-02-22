'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  Building2,
  AlertTriangle,
  Landmark,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/heatmap', label: 'Live Heatmap', icon: Map },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/escalations', label: 'SLA Escalations', icon: AlertTriangle },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'bg-[#0B1727] text-slate-300 flex flex-col shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo + toggle */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2 min-h-[73px]">
        <div className="flex items-center gap-2 min-w-0">
          <Landmark className="w-7 h-7 text-white shrink-0" />
          {!isCollapsed && (
            <span className="text-white font-semibold text-lg tracking-tight truncate">
              SewaSetu
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Status pill - hidden when collapsed */}
      {!isCollapsed && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 w-fit">
            <span
              className="relative flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              aria-hidden
            />
            <span className="text-xs text-slate-300 font-medium">System Live</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-colors',
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                isActive
                  ? 'bg-teal-900/60 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-cyan-300')} />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
