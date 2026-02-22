'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, FileText, Search, User } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', emoji: '🏠' },
    { icon: FileText, label: 'Reports', path: '/history', emoji: '📋' },
    { icon: Search, label: 'Track', path: '/track', emoji: '🔍' },
    { icon: User, label: 'Profile', path: '/profile', emoji: '👤' },
  ]

  const isActive = (path: string) => pathname === path || (path === '/home' && pathname === '/')

  return (
    <nav 
      className="absolute inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl"
    >
      <div className="flex justify-around items-center px-4 py-3">
        {navItems.map((item) => {
          const active = isActive(item.path)
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[64px] ${
                active 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
