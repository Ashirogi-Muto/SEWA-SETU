/**
 * Offline Sync Engine
 * Processes the IndexedDB queue when the device comes back online.
 * For reports with audioBlob, performs deferred STT transcription first.
 */

import {
    getAllPending,
    dequeueAction,
    updateActionStatus,
    OfflineAction,
} from './offlineQueue'
import { apiFetch, transcribeAudio } from './api'

const MAX_RETRIES = 3
let isSyncing = false

/**
 * Sync all pending offline actions in FIFO order.
 * Safe to call multiple times — guards against concurrent runs.
 */
export async function syncAllPending(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.onLine) return
    if (isSyncing) return

    isSyncing = true

    try {
        const pending = await getAllPending()

        for (const action of pending) {
            if (action.retries >= MAX_RETRIES) {
                // Already exceeded retries — mark as permanently failed
                await updateActionStatus(action.id, 'failed')
                continue
            }

            await updateActionStatus(action.id, 'syncing')

            try {
                if (action.type === 'report') {
                    await syncReport(action)
                } else if (action.type === 'resolution') {
                    await syncResolution(action)
                }

                // Success — remove from queue
                await dequeueAction(action.id)
                console.log(`[OfflineSync]  Synced action ${action.id} (${action.type})`)
            } catch (err) {
                console.error(`[OfflineSync]  Failed to sync ${action.id}:`, err)
                await updateActionStatus(action.id, 'failed', true)
            }
        }
    } finally {
        isSyncing = false
    }
}

/**
 * Sync a single offline report submission.
 * If an audioBlob is present, transcribes it first and appends to description.
 */
async function syncReport(action: OfflineAction): Promise<void> {
    let description: string = action.payload.description || ''

    // 1. Deferred STT: transcribe audio blob if present
    if (action.audioBlob) {
        try {
            const sttResult = await transcribeAudio(action.audioBlob)
            if (sttResult.text) {
                // Remove the placeholder text if present, then append real transcription
                description = description
                    .replace(' Voice recorded — will be transcribed when online', '')
                    .trim()
                description = description
                    ? `${description} ${sttResult.text}`
                    : sttResult.text
            }
        } catch (sttErr) {
            console.warn('[OfflineSync] STT failed, submitting with original description:', sttErr)
            // Continue with the existing description (don't block the report)
        }
    }

    // 2. Build FormData
    const formData = new FormData()
    formData.append('description', description)
    formData.append('latitude', String(action.payload.latitude))
    formData.append('longitude', String(action.payload.longitude))

    if (action.imageBlob) {
        formData.append('images', action.imageBlob, 'offline-image.jpg')
    }

    // 3. Submit
    await apiFetch('/api/reports', {
        method: 'POST',
        body: formData,
    })
}

/**
 * Sync a single offline resolution (status update).
 */
async function syncResolution(action: OfflineAction): Promise<void> {
    const { reportId, status } = action.payload
    await apiFetch(`/api/reports/${reportId}/status?status=${status}`, {
        method: 'PATCH',
    })
}

/**
 * Initialize the sync listener. Call once from a layout component.
 * Automatically syncs when the device comes online.
 * Also attempts an immediate sync on initialization.
 */
export function initOfflineSync(): () => void {
    const handleOnline = () => {
        console.log('[OfflineSync]  Back online — starting sync...')
        syncAllPending()
    }

    window.addEventListener('online', handleOnline)

    // Attempt immediate sync in case there are stale items
    if (navigator.onLine) {
        syncAllPending()
    }

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline)
    }
}
