'use client'

import Sidebar from '@/components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-full overflow-hidden">
      <Sidebar />
      {/* Main: bg-slate-50 + content (header lives in page for client state) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
