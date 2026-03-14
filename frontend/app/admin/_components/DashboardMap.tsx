'use client'

import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { Map as MapIcon, Flame } from 'lucide-react'
import { BackendReport } from '@/lib/api'
import { computeViewportMax } from '@/lib/heatmapUtils'

const SEVERITY_COLORS: Record<string, string> = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#EAB308',
}

function getSeverity(report: BackendReport): string {
    if (report.escalation_level && report.escalation_level >= 4) return 'critical'
    if (report.impact_score && report.impact_score > 10) return 'high'
    return 'medium'
}

const HEAT_GRADIENT = {
    0.1: '#2563eb',
    0.3: '#7c3aed',
    0.5: '#f59e0b',
    0.7: '#f97316',
    0.9: '#ef4444',
    1.0: '#dc2626',
}

interface DashboardMapProps {
    reports: BackendReport[]
}

export default function DashboardMap({ reports }: DashboardMapProps) {
    const [mapView, setMapView] = useState<'pins' | 'heatmap'>('pins')
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.Layer[]>([])
    const heatLayerRef = useRef<any>(null)
    const viewportHandlerRef = useRef<(() => void) | null>(null)

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
            center: [28.4744, 77.5040],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        })

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
        }).addTo(map)

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    // Update layers when reports or mapView change
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        // Clear existing layers and event handlers
        markersRef.current.forEach((l) => map.removeLayer(l))
        markersRef.current = []
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current)
            heatLayerRef.current = null
        }
        if (viewportHandlerRef.current) {
            map.off('moveend', viewportHandlerRef.current)
            map.off('zoomend', viewportHandlerRef.current)
            viewportHandlerRef.current = null
        }

        const validReports = reports.filter((r) => r.latitude && r.longitude)

        if (mapView === 'pins') {
            validReports.forEach((report) => {
                const severity = getSeverity(report)
                const color = SEVERITY_COLORS[severity]
                const marker = L.circleMarker([report.latitude, report.longitude], {
                    radius: severity === 'critical' ? 10 : severity === 'high' ? 8 : 6,
                    fillColor: color,
                    fillOpacity: 0.7,
                    color: color,
                    weight: 2,
                    opacity: 0.9,
                })
                marker.bindPopup(`
          <div style="font-family: system-ui; min-width: 160px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e293b;">${report.category || 'Report'}</div>
            <p style="font-size: 11px; color: #64748b; margin: 4px 0;">${report.description?.substring(0, 60) || 'No description'}</p>
          </div>
        `)
                marker.addTo(map)
                markersRef.current.push(marker)
            })
        } else {
            // Heatmap mode with viewport-aware normalization
            const heatPoints: [number, number, number][] = validReports.map((r) => [r.latitude, r.longitude, 1.0])

            function rebuildHeat() {
                if (!map) return
                if (heatLayerRef.current) {
                    map.removeLayer(heatLayerRef.current)
                    heatLayerRef.current = null
                }
                if (heatPoints.length === 0) return

                const dynamicMax = computeViewportMax(map, heatPoints)
                const heat = (L as any).heatLayer(heatPoints, {
                    radius: 30,
                    blur: 20,
                    maxZoom: 17,
                    max: dynamicMax,
                    gradient: HEAT_GRADIENT,
                }).addTo(map)
                heatLayerRef.current = heat
            }

            rebuildHeat()
            map.on('moveend', rebuildHeat)
            map.on('zoomend', rebuildHeat)
            viewportHandlerRef.current = rebuildHeat
        }

        // Fit bounds
        if (validReports.length > 0) {
            const bounds = L.latLngBounds(validReports.map((r) => [r.latitude, r.longitude] as [number, number]))
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
        }

        return () => {
            if (viewportHandlerRef.current) {
                map.off('moveend', viewportHandlerRef.current)
                map.off('zoomend', viewportHandlerRef.current)
            }
        }
    }, [reports, mapView])

    return (
        <div className="w-full h-full relative">
            {/* Toggle - top right */}
            <div className="absolute top-3 right-3 z-[500] flex items-center gap-2">
                <div className="inline-flex items-center rounded-lg bg-slate-900/90 backdrop-blur p-1 border border-slate-600">
                    <button
                        type="button"
                        onClick={() => setMapView('pins')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${mapView === 'pins'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <MapIcon className="w-3 h-3" />
                        Pins
                    </button>
                    <button
                        type="button"
                        onClick={() => setMapView('heatmap')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${mapView === 'heatmap'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <Flame className="w-3 h-3" />
                        Heat
                    </button>
                </div>
                {mapView === 'heatmap' && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur px-2 py-1 rounded-md border border-slate-600">
                        <div
                            className="w-10 h-1.5 rounded"
                            style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed, #f59e0b, #ef4444, #dc2626)' }}
                        />
                        <span>Low → High</span>
                    </div>
                )}
            </div>

            {/* Severity legend - bottom left */}
            <div className="absolute bottom-24 left-3 bg-slate-900/80 backdrop-blur border border-slate-600 p-2.5 rounded-lg flex flex-col gap-1.5 z-[500]">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">SEVERITY</span>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" /> High</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" /> Medium</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]" /> Low</div>
            </div>

            <div ref={containerRef} className="w-full h-full" style={{ background: '#1a1f2e' }} />
        </div>
    )
}
