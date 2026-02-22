'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue - wrap in useEffect to avoid SSR issues
let iconsFixed = false

interface LocationMapProps {
  position: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationMap({ position, onLocationSelect }: LocationMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Fix Leaflet icons only once on client side
    if (!iconsFixed && typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      iconsFixed = true
    }
  }, [])

  if (!isClient) {
    return (
      <div className="h-[300px] w-full rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden shadow-lg relative z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
        key={`${position[0]}-${position[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs z-[1000] pointer-events-none">
        📍 Tap map to update location
      </div>
    </div>
  )
}
