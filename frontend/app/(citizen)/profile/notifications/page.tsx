'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Calendar, MapPin, AlertCircle, Check, Loader2 } from 'lucide-react'
import { fetchAlerts, AppAlert, markAlertRead, markAllAlertsRead } from '@/lib/api'

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState<AppAlert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAlerts().then(setNotifications).finally(() => setLoading(false))
    }, [])

    const markAllAsRead = async () => {
        try {
            await markAllAlertsRead()
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        } catch (error) {
            console.error('Failed to mark all as read', error)
        }
    }

    const markAsRead = async (id: string | number) => {
        try {
            await markAlertRead(id)
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (error) {
            console.error('Failed to mark read', error)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
            {/* Header */}
            <header className="w-full bg-white px-5 pt-6 pb-3 flex items-center justify-between shadow-sm shrink-0 z-10 sticky top-0">
                <div className="flex items-center">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-[#173F70]" />
                    </button>
                    <h1 className="text-xl font-black text-[#173F70]">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-[#173F70] hover:text-[#123158] transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </header>

            <div className="flex-1 p-4 flex flex-col gap-3">
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 text-[#173F70] animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-[20px] shadow-sm mt-4">
                        <Bell className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Notifications</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">You're all caught up! There are no new notifications at this time.</p>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const Icon = notification.icon === 'refresh' ? Check :
                            notification.icon === 'bell' ? Bell : AlertCircle;
                        return (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`bg-white rounded-[20px] p-4 shadow-sm border ${notification.is_read ? 'border-gray-100' : 'border-[#173F70]/20'} flex gap-4 items-start ${!notification.is_read ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                            >
                                <div className={`p-3 rounded-full shrink-0 ${notification.type === 'Updates' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'Urgent' ? 'bg-orange-100 text-orange-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col flex-1 pl-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-[15px] pr-2 ${notification.is_read ? 'text-gray-700 font-bold' : 'text-gray-900 font-black'}`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.is_read && (
                                            <div className="w-2.5 h-2.5 bg-[#173F70] rounded-full shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 leading-snug mb-2">{notification.message}</p>
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-auto">
                                        <Bell className="w-3 h-3" /> {notification.time}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
