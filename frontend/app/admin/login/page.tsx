'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Loader2 } from 'lucide-react'
import { loginUser } from '@/lib/api'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return
        setLoading(true)
        setError('')
        try {
            await loginUser(email, password)
            router.replace('/admin')
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050A14] p-4">
            <div className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 justify-center mb-8">
                    <Landmark className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold text-white tracking-tight">SewaSetu</span>
                </div>
                <h1 className="text-lg font-semibold text-white text-center mb-1">Admin Portal</h1>
                <p className="text-sm text-gray-400 text-center mb-6">Sign in to continue</p>

                {error && (
                    <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@sewasetu.in"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
