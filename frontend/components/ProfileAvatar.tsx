'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'

export default function ProfileAvatar() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
        }
        setOpen(false)
        router.push('/login')
    }

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#173F70] to-[#2563eb] flex items-center justify-center shadow-md border-2 border-white hover:scale-105 transition-transform"
                aria-label="Profile menu"
            >
                <User className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => { setOpen(false); router.push('/profile') }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <User className="w-4 h-4 text-[#173F70]" />
                        My Profile
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    )
}
