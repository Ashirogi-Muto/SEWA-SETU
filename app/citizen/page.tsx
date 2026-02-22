'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function CitizenPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('sewasetu_user')
    if (user) {
      router.replace('/home')
    } else {
      router.replace('/login')
    }
    setChecking(false)
  }, [router])
  
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="mb-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl">🏛️</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SewaSetu</h1>
        <p className="text-blue-100 mb-8">नागरिक शिकायत पोर्टल</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }
  
  return null
}
