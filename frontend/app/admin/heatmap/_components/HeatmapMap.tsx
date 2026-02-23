'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { BackendReport } from '@/lib/api'
import { computeViewportMax } from '@/lib/heatmapUtils'

interface HeatmapMapProps {
    reports: BackendReport[]
}

export default function HeatmapMap({ reports }: HeatmapMapProps) {
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const heatLayerRef = useRef<any>(null)

    const GRADIENT = {
        0.1: '#2563eb',
        0.3: '#7c3aed',
        0.5: '#f59e0b',
        0.7: '#f97316',
        0.9: '#ef4444',
        1.0: '#dc2626',
    }

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
            center: [28.4744, 77.5040],
            zoom: 12,
            zoomControl: false,
            attributionControl: false,
        })

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map)

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
    }, [])

    // Update heatmap layer when reports change, and re-normalize on viewport change
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const validReports = reports.filter((r) => r.latitude && r.longitude)
        const heatPoints: [number, number, number][] = validReports.map((r) => [
            r.latitude,
            r.longitude,
            1.0,
        ])

        function rebuildHeat() {
            if (!map) return

            // Remove existing
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current)
                heatLayerRef.current = null
            }

            if (heatPoints.length === 0) return

            // Compute max based on visible viewport density
            const dynamicMax = computeViewportMax(map, heatPoints)

            const heat = (L as any).heatLayer(heatPoints, {
                radius: 30,
                blur: 20,
                maxZoom: 17,
                max: dynamicMax,
                gradient: GRADIENT,
            }).addTo(map)
            heatLayerRef.current = heat
        }

        // Build initial layer
        rebuildHeat()

        // Re-normalize when viewport changes
        map.on('moveend', rebuildHeat)
        map.on('zoomend', rebuildHeat)

        // Fit bounds on initial load
        if (validReports.length > 0) {
            const bounds = L.latLngBounds(validReports.map((r) => [r.latitude, r.longitude] as [number, number]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
        }

        return () => {
            map.off('moveend', rebuildHeat)
            map.off('zoomend', rebuildHeat)
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current)
                heatLayerRef.current = null
            }
        }
    }, [reports])

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ background: '#1a1f2e' }}
        />
    )
}
