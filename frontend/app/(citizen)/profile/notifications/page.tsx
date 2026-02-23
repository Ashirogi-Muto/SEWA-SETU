'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Calendar, MapPin, AlertCircle, Check } from 'lucide-react'

// Dummy notification data
const NOTIFICATIONS = [
    {
        id: 1,
        title: 'Report Resolved',
        message: 'Your report regarding "Pothole on Main St" has been marked as resolved.',
        time: '2 hours ago',
        type: 'success',
        read: false,
        icon: Check
    },
    {
        id: 2,
        title: 'New Event Nearby',
        message: 'Community clean-up drive this weekend at Central Park.',
        time: '1 day ago',
        type: 'info',
        read: true,
        icon: Calendar
    },
    {
        id: 3,
        title: 'Urgent Update',
        message: 'Water supply interruption scheduled for tomorrow between 2 PM - 5 PM.',
        time: '2 days ago',
        type: 'warning',
        read: true,
        icon: AlertCircle
    },
    {
        id: 4,
        title: 'Location Match',
        message: 'A new civic issue was reported near your registered home location.',
        time: '3 days ago',
        type: 'info',
        read: true,
        icon: MapPin
    }
]

export default function NotificationsPage() {
    const router = useRouter()
    const [notifications, setNotifications] = useState(NOTIFICATIONS)

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const unreadCount = notifications.filter(n => !n.read).length

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
                {notifications.map((notification) => {
                    const Icon = notification.icon
                    return (
                        <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`bg-white rounded-[20px] p-4 shadow-sm border ${notification.read ? 'border-gray-100' : 'border-[#173F70]/20'} flex gap-4 items-start ${!notification.read ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                        >
                            <div className={`p-3 rounded-full shrink-0 ${notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col flex-1 pl-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-[15px] pr-2 ${notification.read ? 'text-gray-700 font-bold' : 'text-gray-900 font-black'}`}>
                                        {notification.title}
                                    </h3>
                                    {!notification.read && (
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
                })}
            </div>
        </div>
    )
}
