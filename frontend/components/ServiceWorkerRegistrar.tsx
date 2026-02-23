'use client'

import { useEffect } from 'react'

/**
 * Registers the existing service worker (/sw.js) on mount.
 * Renders nothing — pure side-effect component.
 */
export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[SW] Service Worker registered, scope:', reg.scope)
                })
                .catch((err) => {
                    console.warn('[SW] Service Worker registration failed:', err)
                })
        }
    }, [])

    return null
}
