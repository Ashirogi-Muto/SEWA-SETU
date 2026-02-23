'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Maximize2, Minimize2, MapPin, Flame, Map as MapIcon, Loader2 } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import { computeViewportMax } from '@/lib/heatmapUtils'

// Fix generic Leaflet icon issue in Next.js and load heatmap canvas
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
}

interface DashboardMapProps {
    reports: any[]
}

// Center map on Greater Noida
const DEFAULT_CENTER: [number, number] = [28.4744, 77.5040]

const HEAT_GRADIENT = {
    0.1: '#2563eb',
    0.3: '#7c3aed',
    0.5: '#f59e0b',
    0.7: '#f97316',
    0.9: '#ef4444',
    1.0: '#dc2626',
}

// Heatmap layer component using leaflet.heat with viewport-aware normalization
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
    const map = useMap()

    // Memoize the array length or string representation to prevent infinite re-rendering flickers
    const pointsDep = useMemo(() => JSON.stringify(points), [points])

    useEffect(() => {
        if (!map || points.length === 0) return

        // Safely require leaflet.heat dynamically only when map is ready
        if (typeof window !== 'undefined') {
            // Expose L globally for leaflet.heat plugin to attach to
            ; (window as any).L = L
            require('leaflet.heat')
        }

        const heatLayerConstructor = (L as any).heatLayer;
        if (!heatLayerConstructor) {
            console.error("Leaflet.heat not loaded correctly");
            return;
        }

        let heatLayer: any = null

        function rebuildHeat() {
            if (heatLayer) {
                map.removeLayer(heatLayer)
            }
            const dynamicMax = computeViewportMax(map, points)
            heatLayer = heatLayerConstructor(points, {
                radius: 30,
                blur: 20,
                maxZoom: 17,
                max: dynamicMax,
                gradient: HEAT_GRADIENT,
            }).addTo(map)
        }

        rebuildHeat()
        map.on('moveend', rebuildHeat)
        map.on('zoomend', rebuildHeat)

        return () => {
            map.off('moveend', rebuildHeat)
            map.off('zoomend', rebuildHeat)
            if (heatLayer) {
                map.removeLayer(heatLayer)
            }
        }
    }, [map, pointsDep])

    return null
}

// Custom hooks to recenter map when expanded/collapsed and toggle interaction
function MapInteraction({ isExpanded }: { isExpanded: boolean }) {
    const map = useMap()

    useEffect(() => {
        // give the container time to animate/resize
        setTimeout(() => {
            map.invalidateSize()
        }, 300)
    }, [map, isExpanded])

    useEffect(() => {
        if (isExpanded) {
            map.dragging.enable()
            map.scrollWheelZoom.enable()
            map.doubleClickZoom.enable()
        } else {
            map.dragging.disable()
            map.scrollWheelZoom.disable()
            map.doubleClickZoom.disable()
        }
    }, [map, isExpanded])

    return null
}

export default function DashboardMap({ reports }: DashboardMapProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [mapType, setMapType] = useState<'point' | 'heatmap'>('point')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-full h-36 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    }

    const toggleExpand = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsExpanded(!isExpanded)
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
    }

    const toggleMapType = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setMapType(prev => prev === 'point' ? 'heatmap' : 'point')
    }

    // Helper to generate the exact same visual icon markers as the old portals
    const createMarkerIcon = (color: string) => {
        const iconHtml = renderToStaticMarkup(
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={color}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
                style={{ width: '28px', height: '28px' }}
            >
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" fill="white" stroke="none" />
            </svg>
        )
        return L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-marker',
            iconSize: [28, 28],
            iconAnchor: [14, 28] // bottom center point
        })
    }

    const getColorForReport = (index: number) => {
        const colors = ['#3B82F6', '#173F70', '#F59E0B', '#10B981']
        return colors[index % colors.length]
    }

    return (
        <>
            {/* Placeholder to prevent layout shift when map is expanded */}
            {isExpanded && <div className="w-full h-36 mb-3" />}

            <div className={
                isExpanded
                    ? "fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-md"
                    : "w-full h-36 rounded-xl border border-gray-200 relative bg-gray-50 z-10 shrink-0"
            }>
                <div className={
                    isExpanded
                        ? "w-[90vw] md:w-[60vw] h-[60vh] bg-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/5"
                        : "w-full h-full relative rounded-xl overflow-hidden"
                }>
                    {isExpanded && (
                        <div className="bg-[#173F70] text-white p-3 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-2">
                                {mapType === 'point' ? <MapIcon className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                                <span className="font-bold">{mapType === 'point' ? 'Point Map' : 'Heatmap'} Viewer</span>
                            </div>
                            <button onClick={toggleExpand} className="p-1 hover:bg-white/10 rounded">
                                <Minimize2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <div className="flex-1 relative w-full h-full">
                        <MapContainer
                            center={reports.length > 0 && reports[0].latitude ? [reports[0].latitude, reports[0].longitude] : DEFAULT_CENTER}
                            zoom={13}
                            // We handle interactions via our custom MapInteraction hook dynamically
                            zoomControl={false}
                            scrollWheelZoom={false}
                            dragging={false}
                            doubleClickZoom={false}
                            className="w-full h-full z-0 leaflet-container"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapInteraction isExpanded={isExpanded} />
                            {isExpanded && <ZoomControl position="topleft" />}

                            {/* Render reports as markers based on toggle mode */}
                            {mapType === 'point' ? (
                                reports.map((report, idx) => {
                                    if (!report.latitude || !report.longitude) return null
                                    return (
                                        <Marker
                                            key={`marker-${report.id}-point`}
                                            position={[Number(report.latitude), Number(report.longitude)]}
                                            icon={createMarkerIcon(getColorForReport(idx))}
                                        />
                                    )
                                })
                            ) : (
                                <HeatmapLayer
                                    points={reports
                                        .filter(r => r.latitude && r.longitude)
                                        .map(r => [Number(r.latitude), Number(r.longitude), 1.0])}
                                />
                            )}
                        </MapContainer>

                        {/* Absolute Floating UI Overlays */}
                        <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-2 drop-shadow-md">
                            {/* Toggle Map Type Button */}
                            <button
                                type="button"
                                onClick={toggleMapType}
                                className="w-10 h-10 flex items-center justify-center rounded shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                                title={mapType === 'point' ? "Switch to Heatmap" : "Switch to Point Map"}
                            >
                                {mapType === 'point' ? <Flame className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                            </button>

                            {/* Expand Button (inline mode only) */}
                            {!isExpanded && (
                                <button
                                    type="button"
                                    onClick={toggleExpand}
                                    className="w-10 h-10 flex items-center justify-center rounded shadow-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
                                    title="Expand Map"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
