'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

/**
 * Slim banner that appears at the very top when the device is offline.
 * Auto-hides when connectivity returns.
 * Renders nothing when online — zero visual impact on existing layout.
 */
export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        // Set initial state
        setIsOffline(!navigator.onLine)

        const handleOffline = () => setIsOffline(true)
        const handleOnline = () => setIsOffline(false)

        window.addEventListener('offline', handleOffline)
        window.addEventListener('online', handleOnline)

        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: '#f59e0b',
                color: '#78350f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
            }}
        >
            <WifiOff size={14} />
            You&apos;re offline — changes will sync automatically
        </div>
    )
}
