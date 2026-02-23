'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchReports, BackendReport } from '@/lib/api'

// Dynamically import map to avoid SSR issues with Leaflet
const HeatmapMap = dynamic(() => import('./_components/HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#1a1f2e] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  ),
})

export default function AdminHeatmapPage() {
  const [reports, setReports] = useState<BackendReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReports()
        setReports(data)
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = Array.from(new Set(reports.map((r) => r.category).filter(Boolean)))

  const filtered = selectedCategory === 'all'
    ? reports
    : reports.filter((r) => r.category === selectedCategory)

  return (
    <div className="flex flex-col h-full bg-[#050A14] text-white overflow-hidden">
      {/* HUD Header Strip */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0a0f1e] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-bold tracking-tight">LIVE INTEL — Civic Heatmap</h1>
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded">
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            <span className="text-white font-bold">{filtered.length}</span> Reports
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="w-full h-full bg-[#1a1f2e] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="ml-3 text-gray-400">Loading report data...</span>
          </div>
        ) : (
          <HeatmapMap reports={filtered} />
        )}

        {/* INTENSITY Legend — bottom-left overlay */}
        <div className="absolute bottom-4 left-4 bg-[#0a0f1e]/90 backdrop-blur border border-white/10 p-3 rounded-lg flex flex-col gap-2 z-[500]">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            INTENSITY
          </span>
          <div className="flex items-center gap-2">
            <div
              className="w-24 h-2.5 rounded"
              style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed, #f59e0b, #ef4444, #dc2626)' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 w-24">
            <span>Low</span>
            <span>High</span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {filtered.length} reports plotted
          </div>
        </div>

        {/* Stats — top-right overlay */}
        <div className="absolute top-4 right-4 flex gap-2 z-[500]">
          {[
            { label: 'Active', value: filtered.filter((r) => r.status !== 'resolved' && r.status !== 'RESOLVED').length, color: 'text-red-400' },
            { label: 'In Progress', value: filtered.filter((r) => r.status === 'in_progress' || r.status === 'IN_PROGRESS').length, color: 'text-amber-400' },
            { label: 'Resolved', value: filtered.filter((r) => r.status === 'resolved' || r.status === 'RESOLVED').length, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0a0f1e]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-center">
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[10px] text-gray-400 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
