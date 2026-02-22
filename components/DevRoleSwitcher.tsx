'use client'

import Link from 'next/link'
import { Smartphone, Monitor, HardHat } from 'lucide-react'

export default function DevRoleSwitcher() {
  return (
    <div
      className="fixed bottom-4 left-4 flex gap-2 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-[9999] shadow-2xl"
      aria-label="Switch portal (dev)"
    >
      <Link
        href="/"
        className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 transition-colors"
        title="Citizen Portal"
      >
        <Smartphone className="w-5 h-5" />
      </Link>
      <Link
        href="/admin"
        className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 transition-colors"
        title="Admin Portal"
      >
        <Monitor className="w-5 h-5" />
      </Link>
      <Link
        href="/fieldadmin"
        className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/20 transition-colors"
        title="Field Admin Portal"
      >
        <HardHat className="w-5 h-5" />
      </Link>
    </div>
  )
}
