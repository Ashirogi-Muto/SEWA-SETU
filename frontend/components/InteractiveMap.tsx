'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Maximize2, Minimize2, MapPin } from 'lucide-react'

// Fix generic Leaflet icon issue in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
}

interface InteractiveMapProps {
    lat: number
    lng: number
    onLocationChange: (lat: number, lng: number) => void
}

function MapEvents({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        dragend: () => {
            const center = map.getCenter()
            onLocationChange(center.lat, center.lng)
        },
        zoomend: () => {
            const center = map.getCenter()
            onLocationChange(center.lat, center.lng)
        }
    })
    return null
}

function RecenterMap({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap()
    const [lastProgrammatic, setLastProgrammatic] = useState({ lat, lng })

    useEffect(() => {
        // Did the parent force a change that wasn't from our own drag?
        if (lat !== lastProgrammatic.lat || lng !== lastProgrammatic.lng) {
            setLastProgrammatic({ lat, lng })
            map.flyTo([lat, lng], map.getZoom(), { duration: 0.5 })
        }
    }, [lat, lng, map, lastProgrammatic])

    return null
}

export default function InteractiveMap({ lat, lng, onLocationChange }: InteractiveMapProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-full h-24 bg-gray-100 rounded-lg animate-pulse" />

    const toggleExpand = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsExpanded(!isExpanded)

        // Trigger resize to fix tile loading when container layout drastically changes
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 100)
    }

    return (
        <>
            {/* Placeholder to prevent layout shift when map is expanded */}
            {isExpanded && <div className="w-full h-24 mb-3" />}

            <div className={
                isExpanded
                    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-md"
                    : "w-full h-24 rounded-lg border border-gray-200 mb-3 relative bg-gray-50 z-10"
            }>
                <div className={
                    isExpanded
                        ? "w-[90vw] md:w-[60vw] h-[60vh] bg-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/5"
                        : "w-full h-full relative rounded-lg overflow-hidden"
                }>
                    {isExpanded && (
                        <div className="bg-[#173F70] text-white p-3 font-bold text-center flex-shrink-0 shadow-sm z-10">
                            Move map to pinpoint location
                        </div>
                    )}

                    <div className="flex-1 relative w-full h-full">
                        <MapContainer
                            center={[lat, lng]}
                            zoom={15}
                            zoomControl={isExpanded} // native zoom controls only in expanded mode
                            scrollWheelZoom={isExpanded} // scroll to zoom only in expanded mode
                            dragging={true}
                            className="w-full h-full z-0 leaflet-container"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapEvents onLocationChange={onLocationChange} />
                            <RecenterMap lat={lat} lng={lng} />
                        </MapContainer>

                        {/* Center Fixed Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none drop-shadow-md">
                            <MapPin className="w-8 h-8 text-[#173F70] fill-white" />
                        </div>

                        {/* Expand Toggle Button */}
                        <button
                            type="button"
                            onClick={toggleExpand}
                            className={`absolute bottom-2 right-2 z-[1000] w-10 h-10 flex items-center justify-center rounded shadow-md transition-colors border ${isExpanded
                                ? 'bg-[#173F70] text-white border-[#173F70]'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                }`}
                            title={isExpanded ? "Close Map" : "Expand Map"}
                        >
                            {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
