'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, Bell, User, Plus } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/login') return null

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: FileText, label: 'Reports', path: '/history' },
    null, // middle slot = FAB
    { icon: Bell, label: 'Alerts', path: '/alerts', hasNotification: true },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const isActive = (path: string) => pathname === path || (path === '/home' && pathname === '/')

  return (
    <nav className="absolute bottom-6 left-4 right-4 z-50 bg-white py-3 px-6 flex justify-between items-center rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100">
      {navItems.map((item) => {
        if (item === null) {
          return (
            <Link key="report-fab" href="/report" className="relative -top-6 flex flex-col items-center">
              <div className="w-14 h-14 bg-[#173F70] rounded-full flex items-center justify-center text-white border-[5px] border-[#F4F7FB] shadow-lg hover:scale-105 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
            </Link>
          )
        }
        const Icon = item.icon
        const active = isActive(item.path)
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-1 transition-all relative"
          >
            {item.hasNotification && (
              <span className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full" />
            )}
            <Icon
              className={`w-5 h-5 ${active ? 'text-[#173F70]' : 'text-slate-500'}`}
              strokeWidth={active ? 2.5 : 2}
            />
            <span className={`text-[10px] ${active ? 'text-[#173F70] font-bold' : 'text-slate-500 font-medium'}`}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
