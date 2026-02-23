'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  Building2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/heatmap', label: 'Live Heatmap', icon: Map },
  { href: '/admin/departments', label: 'Departments', icon: Building2 },
  { href: '/admin/escalations', label: 'SLA Escalations', icon: AlertTriangle },
]

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out flex flex-col shrink-0',
        'bg-white dark:bg-[#050A14] border-r border-gray-200 dark:border-white/10',
        isHovered ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center min-h-[73px]">
        <div className="flex items-center min-w-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="SewaSetu Logo"
            width={isHovered ? 140 : 40}
            height={40}
            className="object-contain transition-all duration-300 ease-in-out"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={!isHovered ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium transition-colors',
                isHovered ? 'px-4 py-3' : 'px-3 py-3 justify-center',
                isActive
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0',
                  isActive && 'text-cyan-600 dark:text-cyan-400'
                )}
              />
              {isHovered && (
                <span className="text-sm font-medium whitespace-nowrap opacity-0 animate-[sidebarFadeIn_0.3s_ease-out_forwards] [animation-fill-mode:forwards]">
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
