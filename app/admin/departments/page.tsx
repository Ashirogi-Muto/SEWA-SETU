'use client'

import { useState } from 'react'
import { Search, Download, HardHat, Droplet, Zap, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEPARTMENTS = [
  {
    id: 'pwd',
    name: 'Public Works Department',
    shortName: 'PWD',
    hod: 'Er. R.K. Sharma',
    icon: HardHat,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    status: 'Critical Load',
    statusStyle:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    activeIssues: 482,
    slaBreaches: 21,
    resolvedToday: 145,
    avgResolution: '48h 12m',
  },
  {
    id: 'jal',
    name: 'Jal Nigam (Water Board)',
    shortName: 'Jal Nigam',
    hod: 'Shri A. Verma',
    icon: Droplet,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    status: 'Moderate Load',
    statusStyle:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    activeIssues: 218,
    slaBreaches: 8,
    resolvedToday: 62,
    avgResolution: '32h 45m',
  },
  {
    id: 'uppcl',
    name: 'UPPCL (Electricity)',
    shortName: 'UPPCL',
    hod: 'Er. S. Patel',
    icon: Zap,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    status: 'Optimal',
    statusStyle:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    activeIssues: 94,
    slaBreaches: 2,
    resolvedToday: 28,
    avgResolution: '18h 00m',
  },
  {
    id: 'sanitation',
    name: 'Sanitation & Waste',
    shortName: 'Sanitation',
    hod: 'Shri M. Singh',
    icon: Trash2,
    iconBg: 'bg-slate-100 dark:bg-slate-700/50',
    iconColor: 'text-slate-600 dark:text-slate-300',
    status: 'Moderate Load',
    statusStyle:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    activeIssues: 156,
    slaBreaches: 5,
    resolvedToday: 41,
    avgResolution: '24h 30m',
  },
]

export default function AdminDepartmentsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Department Directory
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Search departments, heads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>
          <button
            type="button"
            onClick={() => alert('Exporting roster...')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Roster
          </button>
        </div>
      </header>

      {/* Global Health Banner */}
      <div className="bg-white dark:bg-[#0f172a]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-8 flex flex-wrap justify-between items-center gap-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          System Load: <span className="font-semibold text-gray-900 dark:text-white">84% (High)</span>
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Active Personnel: <span className="font-semibold text-gray-900 dark:text-white">412</span>
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Cross-Department SLA Breaches:{' '}
          <span className="font-semibold text-red-600 dark:text-red-400 animate-pulse">
            34
          </span>
        </span>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon
          return (
            <article
              key={dept.id}
              className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className={cn(
                    'p-2.5 rounded-xl shrink-0',
                    dept.iconBg,
                    dept.iconColor
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full shrink-0',
                    dept.statusStyle
                  )}
                >
                  {dept.status}
                </span>
              </div>

              {/* Card Body */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {dept.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Head: {dept.hod}
              </p>

              {/* Micro-stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Active Issues
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dept.activeIssues}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    SLA Breaches
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {dept.slaBreaches}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Resolved Today
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.resolvedToday}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    Avg Resolution
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {dept.avgResolution}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-200 dark:border-white/10 pt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  View Tickets
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-slate-800 dark:bg-cyan-900/50 text-white dark:text-cyan-300 border border-slate-700 dark:border-cyan-500/50 hover:bg-slate-700 dark:hover:bg-cyan-800/50 transition-colors"
                >
                  Escalate to HOD
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
