/**
 * Offline Queue — IndexedDB wrapper for storing pending actions
 * Stores reports (with image/audio blobs) and status resolutions
 * that will be synced when the device comes back online.
 */

const DB_NAME = 'sewasetu-offline'
const DB_VERSION = 1
const STORE_NAME = 'actions'
const MAX_QUEUE_SIZE = 50

export interface OfflineAction {
    id: string
    type: 'report' | 'resolution'
    payload: Record<string, any>
    imageBlob?: Blob
    audioBlob?: Blob
    createdAt: number
    status: 'pending' | 'syncing' | 'failed'
    retries: number
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = () => {
            const db = request.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('status', 'status', { unique: false })
                store.createIndex('createdAt', 'createdAt', { unique: false })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

export async function enqueueAction(
    action: Omit<OfflineAction, 'id' | 'createdAt' | 'status' | 'retries'>
): Promise<string> {
    const db = await openDB()

    // Check queue size limit
    const count = await countPending()
    if (count >= MAX_QUEUE_SIZE) {
        throw new Error('Offline queue is full. Please sync existing items first.')
    }

    const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`

    const record: OfflineAction = {
        ...action,
        id,
        createdAt: Date.now(),
        status: 'pending',
        retries: 0,
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.put(record)
        req.onsuccess = () => {
            dispatchQueueChanged()
            resolve(id)
        }
        req.onerror = () => reject(req.error)
    })
}

export async function dequeueAction(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const req = store.delete(id)
        req.onsuccess = () => {
            dispatchQueueChanged()
            resolve()
        }
        req.onerror = () => reject(req.error)
    })
}

export async function updateActionStatus(
    id: string,
    status: OfflineAction['status'],
    incrementRetries = false
): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const getReq = store.get(id)

        getReq.onsuccess = () => {
            const record = getReq.result as OfflineAction | undefined
            if (!record) {
                resolve()
                return
            }
            record.status = status
            if (incrementRetries) {
                record.retries += 1
            }
            const putReq = store.put(record)
            putReq.onsuccess = () => {
                dispatchQueueChanged()
                resolve()
            }
            putReq.onerror = () => reject(putReq.error)
        }

        getReq.onerror = () => reject(getReq.error)
    })
}

export async function getAllPending(): Promise<OfflineAction[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.getAll()

        req.onsuccess = () => {
            const all = (req.result as OfflineAction[])
                .filter((a) => a.status === 'pending' || a.status === 'failed')
                .sort((a, b) => a.createdAt - b.createdAt) // FIFO
            resolve(all)
        }
        req.onerror = () => reject(req.error)
    })
}

export async function countPending(): Promise<number> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.getAll()

        req.onsuccess = () => {
            const count = (req.result as OfflineAction[]).filter(
                (a) => a.status === 'pending' || a.status === 'syncing' || a.status === 'failed'
            ).length
            resolve(count)
        }
        req.onerror = () => reject(req.error)
    })
}

/** Dispatch a custom event so UI components can reactively update */
function dispatchQueueChanged(): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offlineQueueChanged'))
    }
}
