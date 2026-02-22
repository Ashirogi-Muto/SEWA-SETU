'use client'

import { useState } from 'react'
import {
  Search,
  SlidersHorizontal,
  Calendar,
  MapPin,
  ChevronRight,
  UserCircle2,
  CheckCircle2,
} from 'lucide-react'

const MOCK_CARDS = [
  {
    id: '12345',
    title: 'Pothole on Main St.',
    category: 'Road',
    categoryBg: 'bg-[#F59E0B]/20',
    emoji: '🛣️',
    date: 'Oct 25, 2023',
    location: 'Sector 15',
    status: 'Active' as const,
  },
  {
    id: '12346',
    title: 'Water pipeline leak',
    category: 'Water',
    categoryBg: 'bg-[#3B82F6]/20',
    emoji: '💧',
    date: 'Oct 24, 2023',
    location: 'Sector 22',
    status: 'In Progress' as const,
  },
  {
    id: '12347',
    title: 'Pothole on Main St.',
    category: 'Road',
    categoryBg: 'bg-[#F59E0B]/20',
    emoji: '🛣️',
    date: 'Oct 23, 2023',
    location: 'Sector 15',
    status: 'Resolved' as const,
  },
  {
    id: '12348',
    title: 'Blocked drain near market',
    category: 'Water',
    categoryBg: 'bg-[#3B82F6]/20',
    emoji: '💧',
    date: 'Oct 22, 2023',
    location: 'Sector 10',
    status: 'Active' as const,
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
      {/* Header */}
      <header className="w-full px-5 pt-6 pb-3 flex justify-between items-center shrink-0 z-10">
        <h1 className="text-2xl font-black text-[#173F70]">All Reports</h1>
        <UserCircle2 className="w-8 h-8 text-[#173F70]" />
      </header>

      {/* Search Bar */}
      <div className="px-4 mb-4 shrink-0 flex gap-2">
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
        <button
          type="button"
          className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center justify-center"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex px-4 gap-2 overflow-x-auto scrollbar-hide mb-5 shrink-0">
        <button type="button" className="bg-[#173F70] text-white px-4 py-2 rounded-lg text-sm font-bold shrink-0">
          All
        </button>
        <button type="button" className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg text-sm font-bold shrink-0">
          Active
        </button>
        <button type="button" className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-sm font-bold shrink-0">
          In Progress
        </button>
        <button type="button" className="bg-[#10B981] text-white px-4 py-2 rounded-lg text-sm font-bold shrink-0">
          Resolved
        </button>
      </div>

      {/* Report Cards List */}
      <div className="flex flex-col px-4 gap-3 shrink-0">
        {MOCK_CARDS.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3 shrink-0 cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Left: Icon & Category */}
            <div className="flex flex-col items-center justify-center gap-1 w-12 shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${report.categoryBg}`}
              >
                {report.emoji}
              </div>
              <span className="text-[11px] font-bold text-gray-900">{report.category}</span>
            </div>

            {/* Middle: Details */}
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{report.title}</h3>
              <p className="text-xs text-gray-500 mb-1">Report ID: #{report.id}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {report.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {report.location}
                </span>
              </div>
            </div>

            {/* Right: Status & Arrow */}
            <div className="flex flex-col items-end justify-between self-stretch py-1">
              {report.status === 'Active' && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#3B82F6] text-white">
                  Active
                </span>
              )}
              {report.status === 'In Progress' && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#F59E0B] text-white">
                  In Progress
                </span>
              )}
              {report.status === 'Resolved' && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Resolved
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
