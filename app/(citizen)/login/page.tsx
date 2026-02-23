'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  const handleSendOTP = () => {
    if (phone.length === 10) {
      setStep('otp')
    }
  }

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      localStorage.setItem('sewasetu_user', JSON.stringify({ 
        phone, 
        name: `User ${phone.slice(-4)}` 
      }))
      router.push('/home')
    }
  }

  const handleGuestLogin = () => {
    localStorage.setItem('sewasetu_user', JSON.stringify({ 
      phone: 'guest', 
      name: 'Guest' 
    }))
    router.push('/home')
  }

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 50%), linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)'
      }}
    >
      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-r from-orange-400/20 to-green-400/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-b from-blue-500/10 to-green-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-tr from-emerald-400/15 to-orange-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* LARGE LOGO - NO BORDERS */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="drop-shadow-2xl">
          <Image 
            src="/logo.png" 
            alt="SewaSetu AI Civic Bridge" 
            width={240} 
            height={120} 
            priority 
            className="object-contain"
          />
        </div>
      </div>
      
      {/* MAIN CARD */}
      <div className="w-full max-w-md mt-32 relative z-10">
        <Card className="backdrop-blur-xl bg-gradient-to-b from-white/95 to-slate-50/90 border-0 shadow-2xl ring-1 ring-white/50 rounded-3xl overflow-hidden">
          <div className="p-8 space-y-6 bg-gradient-to-r from-white via-slate-50/80 to-emerald-50/60 rounded-2xl backdrop-blur-sm border border-white/50">
            <CardHeader className="text-center space-y-2 p-0">
              <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-green-800 bg-clip-text text-transparent drop-shadow-lg">
                {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                {step === 'phone' 
                  ? 'Enter mobile to continue' 
                  : `Code sent to +91 ${phone}`
                }
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 p-0">
              {step === 'phone' ? (
                <>
                  <Input 
                    type="tel"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="h-16 text-xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 shadow-lg transition-all"
                    maxLength={10}
                  />
                  
                  <Button
                    onClick={handleSendOTP}
                    disabled={phone.length !== 10}
                    className="w-full h-16 text-xl font-bold rounded-2xl bg-[#1e3a8a] text-white hover:bg-blue-900 transition-colors shadow-md"
                  >
                    Send OTP
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-slate-500 font-medium">or</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleGuestLogin}
                    variant="outline"
                    className="w-full h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold transition-all"
                  >
                    Continue as Guest
                  </Button>
                </>
              ) : (
                <>
                  <Input 
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-16 text-2xl text-center tracking-widest border-2 border-slate-200 bg-white/50 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 shadow-lg"
                    maxLength={6}
                  />
                  
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={otp.length !== 6}
                    className="w-full h-16 text-xl font-bold shadow-2xl rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 ring-4 ring-green-200/50"
                  >
                    Verify & Continue
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                  
                  <button
                    onClick={() => setStep('phone')}
                    className="w-full text-green-600 font-bold text-sm hover:text-green-700 transition-colors"
                  >
                    Change Number
                  </button>
                </>
              )}
              
              <p className="text-xs text-center text-slate-500 font-medium pt-4 opacity-80">
                AI-Powered Civic Bridge
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  )
}
