'use client'

import { useState, useEffect } from 'react'
import { fetchMyReports, BackendReport } from '@/lib/api'
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  ChevronRight,
  UserCircle2,
  CheckCircle2,
  Loader2,
  X,
  Clock,
  AlertTriangle,
  Tag,
  Hash,
  BarChart3,
  Image as ImageIcon
} from 'lucide-react'

// Emoji mapper helper
function getCategoryInfo(category: string, status: string) {
  const catLower = (category || '').toLowerCase()
  const isResolved = status === 'RESOLVED' || status === 'resolved'
  const isProgress = status === 'IN_PROGRESS' || status === 'in_progress'

  let emoji = ''
  if (catLower.includes('road') || catLower.includes('pothole')) emoji = ''
  else if (catLower.includes('water') || catLower.includes('drain') || catLower.includes('sewage')) emoji = ''
  else if (catLower.includes('light') || catLower.includes('electric')) emoji = ''
  else if (catLower.includes('garbage')) emoji = ''

  let bg = 'bg-[#F59E0B]/20 text-[#F59E0B]'
  if (isResolved) bg = 'bg-[#10B981]/20 text-[#10B981]'
  else if (!isProgress) bg = 'bg-[#3B82F6]/20 text-[#3B82F6]'

  return { emoji, bg }
}

function getStatusBadge(status: string) {
  const s = status?.toLowerCase()
  if (s === 'resolved') return { label: 'Resolved', cls: 'bg-[#10B981] text-white' }
  if (s === 'in_progress' || s === 'in progress') return { label: 'In Progress', cls: 'bg-[#F59E0B] text-white' }
  if (s === 'rejected') return { label: 'Rejected', cls: 'bg-red-500 text-white' }
  return { label: 'Active', cls: 'bg-[#3B82F6] text-white' }
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

/* ─── Report Detail Modal ────────────────────────────────────────── */
function ReportDetailModal({ report, onClose }: { report: BackendReport; onClose: () => void }) {
  const catInfo = getCategoryInfo(report.category, report.status)
  const badge = getStatusBadge(report.status)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-[24px] shadow-2xl overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-[#173F70] to-[#2563EB] px-5 py-4 rounded-t-[24px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
              {catInfo.emoji}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Report R-{report.id}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.cls}`}>{badge.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</h3>
            <p className="text-sm text-gray-800 leading-relaxed bg-[#F4F7FB] rounded-xl p-3">
              {report.description || 'No description provided.'}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="bg-[#F4F7FB] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#173F70]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{report.category || 'General'}</p>
            </div>

            {/* Report ID */}
            <div className="bg-[#F4F7FB] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="w-3.5 h-3.5 text-[#173F70]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Report ID</span>
              </div>
              <p className="text-sm font-bold text-gray-900">R-{report.id}</p>
            </div>

            {/* Created At */}
            <div className="bg-[#F4F7FB] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#173F70]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Created</span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{formatDate(report.created_at)}</p>
            </div>

            {/* Updated At */}
            <div className="bg-[#F4F7FB] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#173F70]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Updated</span>
              </div>
              <p className="text-xs font-semibold text-gray-700">{report.updated_at ? formatDate(report.updated_at) : 'Not yet'}</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-[#F4F7FB] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#173F70]" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Location</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{report.location_name || 'Greater Noida'}</p>
            {report.latitude && report.longitude && (
              <p className="text-xs text-gray-500 mt-0.5">
                {Number(report.latitude).toFixed(6)}, {Number(report.longitude).toFixed(6)}
              </p>
            )}
          </div>

          {/* Impact & Confidence */}
          <div className="grid grid-cols-2 gap-3">
            {report.impact_score !== undefined && report.impact_score !== null && (
              <div className="bg-[#F4F7FB] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black text-gray-900">{Number(report.impact_score).toFixed(1)}</p>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(Number(report.impact_score) * 10, 100)}%`,
                        backgroundColor: Number(report.impact_score) >= 8 ? '#EF4444' : Number(report.impact_score) >= 5 ? '#F59E0B' : '#10B981'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {report.confidence !== undefined && report.confidence !== null && (
              <div className="bg-[#F4F7FB] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <BarChart3 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">AI Confidence</span>
                </div>
                <p className="text-lg font-black text-gray-900">{(Number(report.confidence) * 100).toFixed(0)}%</p>
              </div>
            )}
          </div>

          {/* Image */}
          {report.image_url && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#173F70]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Attached Photo</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={report.image_url.startsWith('http') ? report.image_url : `${API_URL}${report.image_url}`}
                  alt="Report attachment"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}

          {/* Duplicate reference */}
          {report.duplicate_of && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs font-bold text-yellow-700">
                 This report was flagged as a duplicate of Report R-{report.duplicate_of}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [reports, setReports] = useState<BackendReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMyReports()
        // Sort newest first
        const sorted = (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setReports(sorted)
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    const isResolved = r.status === 'RESOLVED' || r.status === 'resolved'
    const isProgress = r.status === 'IN_PROGRESS' || r.status === 'in_progress'
    const isActive = r.status === 'OPEN' || r.status === 'open' || (!isResolved && !isProgress)

    if (filter === 'Active') return isActive
    if (filter === 'In Progress') return isProgress
    if (filter === 'Resolved') return isResolved
    return true
  })

  const filterOptions = [
    { id: 'All', color: 'bg-[#173F70] text-white' },
    { id: 'Active', color: 'bg-[#3B82F6] text-white' },
    { id: 'In Progress', color: 'bg-[#F59E0B] text-white' },
    { id: 'Resolved', color: 'bg-[#10B981] text-white' },
  ]

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
      {/* Header */}
      <header className="w-full px-5 pt-6 pb-3 flex justify-between items-center shrink-0 z-10">
        <h1 className="text-2xl font-black text-[#173F70]">All Reports</h1>
        <UserCircle2 className="w-8 h-8 text-[#173F70]" />
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-4 shrink-0 flex">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-[#173F70] shadow-sm"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex px-4 gap-2 overflow-x-auto scrollbar-hide mb-5 shrink-0">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${filter === opt.id ? opt.color : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
          >
            {opt.id}
          </button>
        ))}
      </div>

      {/* Report Cards List */}
      <div className="flex flex-col px-4 gap-3 shrink-0">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#173F70]" />
          </div>
        ) : filteredReports.length === 0 ? (
          <p className="text-center text-gray-500 py-10 font-medium">No reports found.</p>
        ) : filteredReports.map((report) => {
          const catInfo = getCategoryInfo(report.category, report.status)
          const dateStr = new Date(report.created_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })
          const isResolved = report.status === 'RESOLVED' || report.status === 'resolved'
          const isProgress = report.status === 'IN_PROGRESS' || report.status === 'in_progress'
          const isActive = report.status === 'OPEN' || report.status === 'open' || (!isResolved && !isProgress)

          return (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 shrink-0 cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Left: Icon & Category */}
              <div className="flex flex-col items-center justify-center gap-1 w-12 shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${catInfo.bg}`}
                >
                  {catInfo.emoji}
                </div>
                <span className="text-[11px] font-bold text-gray-900 truncate max-w-[50px]">{report.category || 'General'}</span>
              </div>

              {/* Middle: Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{report.description}</h3>
                <p className="text-xs text-gray-500 mb-1">Report ID: R-{report.id}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {dateStr}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {report.latitude ? `${report.latitude.toFixed(4)}...` : 'Location attached'}
                  </span>
                </div>
              </div>

              {/* Right: Status & Arrow */}
              <div className="flex flex-col items-end justify-between self-stretch py-1">
                {isActive && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#3B82F6] text-white">
                    Active
                  </span>
                )}
                {isProgress && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#F59E0B] text-white">
                    In Progress
                  </span>
                )}
                {isResolved && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Resolved
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Report Detail Popup Modal */}
      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  )
}
