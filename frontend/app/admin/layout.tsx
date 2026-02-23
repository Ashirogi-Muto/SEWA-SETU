'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { getToken } from '@/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token && !isLoginPage) {
      router.replace('/admin/login')
    } else {
      setAuthed(true)
    }
  }, [isLoginPage, router])

  // Login page — render without sidebar
  if (isLoginPage) return <>{children}</>

  // Waiting for auth check
  if (!authed) return null

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-full overflow-hidden">
      <Sidebar />
      {/* Main: bg-slate-50 + content (header lives in page for client state) */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#F8FAFC] dark:bg-[#050A14] overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
