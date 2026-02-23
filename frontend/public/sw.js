// SewaSetu Service Worker - Offline Keyword Matching
const CACHE_NAME = 'sewasetu-v1'
const OFFLINE_URL = '/citizen'

// Offline keyword mappings (Hindi + English)
const OFFLINE_KEYWORDS = {
  roads: ['गड्ढा', 'pothole', 'सड़क', 'road', 'crack', 'hole'],
  electricity: ['बिजली', 'bijli', 'power', 'wire', 'transformer'],
  streetlight: ['बत्ती', 'streetlight', 'lamp', 'light', 'dark'],
  water: ['पानी', 'paani', 'water', 'leak', 'pipe'],
  drainage: ['नाला', 'nala', 'drain', 'flood', 'जलभराव'],
  waste: ['कूड़ा', 'kuda', 'garbage', 'trash', 'गंदगी'],
  sewerage: ['गटर', 'sewer', 'गंदा पानी'],
  trees: ['पेड़', 'ped', 'tree', 'branch'],
  water_supply: ['tanker', 'टंकर', 'no water', 'पानी नहीं']
}

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/',
        '/citizen',
        '/manifest.json'
      ])
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - offline-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse
      }

      // Try network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
    })
  )
})

// Message event - offline keyword matching
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'OFFLINE_TRIAGE') {
    const { description } = event.data
    const category = matchOfflineKeywords(description)
    
    event.ports[0].postMessage({
      category,
      offline: true,
      message: 'Using offline keywords. Will sync when online.'
    })
  }
})

// Offline keyword matcher
function matchOfflineKeywords(text) {
  if (!text) return 'misc'
  
  const lower = text.toLowerCase()
  let bestMatch = 'misc'
  let maxMatches = 0
  
  for (const [category, keywords] of Object.entries(OFFLINE_KEYWORDS)) {
    const matches = keywords.filter(kw => lower.includes(kw.toLowerCase())).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = category
    }
  }
  
  return bestMatch
}

console.log('[SW] Service Worker loaded')
