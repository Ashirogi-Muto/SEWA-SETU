'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import { loginUser, setToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendEmail = () => {
    if (email.length > 3 && email.includes('@')) {
      setStep('password')
      setError('')
    }
  }

  const handleLogin = async () => {
    if (password.length > 0) {
      setLoading(true)
      setError('')
      try {
        await loginUser(email, password)
        router.push('/home')
      } catch (err: any) {
        setError(err.message || 'Login failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await loginUser('citizen@demo.com', 'demo_password')
      router.push('/home')
    } catch (err: any) {
      setError(err.message || 'Guest login failed')
    } finally {
      setLoading(false)
    }
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
                {step === 'email' ? 'Welcome Back' : 'Enter Password'}
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                {step === 'email'
                  ? 'Enter email to continue'
                  : `Logging in as ${email}`
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-4 p-0">
              {error && (
                <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
                  {error}
                </div>
              )}
              {step === 'email' ? (
                <>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 text-xl border-2 border-slate-200 bg-white/50 backdrop-blur-sm rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 shadow-lg transition-all"
                  />

                  <Button
                    onClick={handleSendEmail}
                    disabled={email.length < 3 || !email.includes('@')}
                    className="w-full h-16 text-xl font-bold shadow-2xl rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 ring-4 ring-green-200/50"
                  >
                    Continue
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
                    disabled={loading}
                    variant="outline"
                    className="w-full h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl font-semibold transition-all flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Continue as Guest
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 text-2xl text-center border-2 border-slate-200 bg-white/50 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 shadow-lg"
                  />

                  <Button
                    onClick={handleLogin}
                    disabled={password.length === 0 || loading}
                    className="w-full h-16 text-xl font-bold shadow-2xl rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:-translate-y-1 transition-all duration-300 ring-4 ring-green-200/50 flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
                    Login & Continue
                    {!loading && <ArrowRight className="ml-2 w-6 h-6" />}
                  </Button>

                  <button
                    onClick={() => setStep('email')}
                    className="w-full text-green-600 font-bold text-sm hover:text-green-700 transition-colors"
                  >
                    Change Email
                  </button>
                </>
              )}

              <p className="text-xs text-center text-slate-500 font-medium pt-4 opacity-80">
                AI-Powered Civic Bridge for Greater Noida
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  )
}
