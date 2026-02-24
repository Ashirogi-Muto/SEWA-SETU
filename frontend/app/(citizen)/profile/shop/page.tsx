'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchUserProfile } from '@/lib/api'
import {
    ArrowLeft,
    Trophy,
    Gift,
    Star,
    Bus,
    TreePine,
    Coffee,
    Ticket,
    ShoppingBag,
    Sparkles,
    Loader2,
    Lock,
} from 'lucide-react'

const SHOP_ITEMS = [
    {
        id: 1,
        name: 'Bus Pass Discount',
        description: '10% off monthly city bus pass',
        cost: 50,
        icon: Bus,
        color: 'bg-blue-100 text-blue-600',
        category: 'Transport',
    },
    {
        id: 2,
        name: 'Tree Planting Certificate',
        description: 'A tree planted in your name at a local park',
        cost: 100,
        icon: TreePine,
        color: 'bg-green-100 text-green-600',
        category: 'Environment',
    },
    {
        id: 3,
        name: 'Cafeteria Voucher',
        description: '₹50 off at partnered government cafeterias',
        cost: 30,
        icon: Coffee,
        color: 'bg-amber-100 text-amber-600',
        category: 'Food',
    },
    {
        id: 4,
        name: 'Event Priority Pass',
        description: 'Priority seating at the next civic town hall',
        cost: 75,
        icon: Ticket,
        color: 'bg-purple-100 text-purple-600',
        category: 'Events',
    },
    {
        id: 5,
        name: 'Civic Star Badge',
        description: 'Exclusive profile badge for top contributors',
        cost: 200,
        icon: Star,
        color: 'bg-yellow-100 text-yellow-600',
        category: 'Badges',
    },
    {
        id: 6,
        name: 'Gift Hamper',
        description: 'Government-branded merchandise hamper',
        cost: 150,
        icon: Gift,
        color: 'bg-pink-100 text-pink-600',
        category: 'Rewards',
    },
]

export default function KarmaShopPage() {
    const router = useRouter()
    const [karma, setKarma] = useState<number>(0)
    const [rank, setRank] = useState<string>('Bronze')
    const [loading, setLoading] = useState(true)
    const [redeemed, setRedeemed] = useState<number | null>(null)

    useEffect(() => {
        fetchUserProfile()
            .then((data) => {
                setKarma(data?.karma || 0)
                setRank(data?.rank || 'Bronze')
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleRedeem = (item: typeof SHOP_ITEMS[0]) => {
        if (karma < item.cost) return
        setRedeemed(item.id)
        // Simulate redemption
        setTimeout(() => {
            setKarma(prev => prev - item.cost)
            setRedeemed(null)
        }, 1500)
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
            {/* Header */}
            <header className="w-full bg-white px-5 pt-6 pb-3 flex items-center shadow-sm shrink-0 z-10 sticky top-0">
                <button
                    onClick={() => router.back()}
                    className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-[#173F70]" />
                </button>
                <h1 className="text-xl font-black text-[#173F70]">Karma Shop</h1>
            </header>

            {loading ? (
                <div className="flex justify-center items-center flex-1">
                    <Loader2 className="w-8 h-8 text-[#173F70] animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col px-4 pt-4 gap-4">
                    {/* Karma Balance Card */}
                    <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-[24px] p-5 shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-tr-full" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Trophy className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-white/80 text-sm font-medium">Your Balance</p>
                                <p className="text-3xl font-black">{karma} <span className="text-lg font-bold">Karma</span></p>
                                <p className="text-white/70 text-xs font-medium mt-0.5">Rank: {rank}</p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#173F70]/10 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-[#173F70]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Earn karma by reporting civic issues</p>
                            <p className="text-xs text-gray-500">Each verified report earns you karma points to spend here</p>
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className="flex items-center gap-2 px-1 mt-1">
                        <ShoppingBag className="w-5 h-5 text-[#173F70]" />
                        <h2 className="text-base font-bold text-gray-900">Available Rewards</h2>
                    </div>

                    {/* Shop Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {SHOP_ITEMS.map((item) => {
                            const Icon = item.icon
                            const canAfford = karma >= item.cost
                            const isRedeeming = redeemed === item.id

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</span>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h3>
                                        <p className="text-[11px] text-gray-500 mt-1 leading-snug">{item.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                                            <span className="text-sm font-black text-[#F59E0B]">{item.cost}</span>
                                        </div>

                                        <button
                                            onClick={() => handleRedeem(item)}
                                            disabled={!canAfford || isRedeeming}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isRedeeming
                                                    ? 'bg-green-500 text-white'
                                                    : canAfford
                                                        ? 'bg-[#173F70] text-white hover:bg-[#123158] active:scale-95'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isRedeeming ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : !canAfford ? (
                                                <Lock className="w-3 h-3" />
                                            ) : null}
                                            {isRedeeming ? 'Done!' : canAfford ? 'Redeem' : 'Locked'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
