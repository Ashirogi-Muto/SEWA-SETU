'use client'

import { useEffect } from 'react'
import BottomNav from '@/components/BottomNav'

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let deferredPrompt: any
    const handler = (e: any) => {
      e.preventDefault()
      deferredPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] sm:py-8">
      {/* Phone Wrapper: relative, flex-col, hidden outer overflow */}
      <div className="relative flex flex-col w-full max-w-[393px] h-[100dvh] sm:h-[852px] bg-[#F4F7FB] overflow-hidden shadow-2xl sm:rounded-[40px] sm:border-[8px] sm:border-gray-800">
        
        {/* Scrollable Content Area: flex-1 takes available space, overflow-y-auto allows scroll */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-[100px]">
          {children}
        </main>

        {/* The Navbar anchored inside the relative wrapper */}
        <BottomNav />
      </div>
    </div>
  );
}
