'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import {
  Layers,
  Cpu,
  Hourglass,
  Timer,
  Check,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Search,
  Bell,
  Download,
  Sun,
  Moon,
} from 'lucide-react'
import DepartmentDonutChart, { ChartSegment } from './_components/DepartmentDonutChart'
import { fetchDashboard, DashboardData, fetchEscalations, fetchReports, BackendReport } from '@/lib/api'

const DashboardMapComponent = dynamic(() => import('./_components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1a1f2e] animate-pulse" />,
})

const DATE_OPTIONS = ['Today, Oct 26', 'Last 7 Days', 'This Month', 'Last 30 Days']

export default function AdminPage() {
  const { theme, setTheme } = useTheme()
  const [dateOpen, setDateOpen] = useState(false)
  const [dateLabel, setDateLabel] = useState('Today, Oct 26')
  const dateRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState<any>(null)
  const [escalations, setEscalations] = useState<any[]>([])
  const [reports, setReports] = useState<BackendReport[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [data, escData, reportsData] = await Promise.all([
          fetchDashboard(),
          fetchEscalations(),
          fetchReports(),
        ])
        setStats(data)
        setEscalations(escData)
        setReports(reportsData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      }
    }
    loadStats()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-8 py-4 bg-white dark:bg-[#050A14] border-b border-slate-200 dark:border-white/10">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Search issues, departments..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Date dropdown */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setDateOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10"
            >
              {dateLabel}
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            </button>
            {dateOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[160px] bg-white dark:bg-[#0f172a] rounded-lg shadow-lg border border-slate-200 dark:border-white/10 z-50">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDateLabel(opt)
                      setDateOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => alert('Exporting data to CSV...')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button type="button" className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" title="User avatar" />
        </div>
      </header>

      <div className="p-8 space-y-8 bg-white dark:bg-[#050A14] min-h-full">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Live Triage Command Center
        </h1>

        {/* 4-column stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Reports</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats ? stats.kpis.totalReports : '...'}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <ChevronUp className="w-4 h-4" />+12% from yesterday
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Resolution Rate</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1">
                  {stats ? Math.round((stats.kpis.reportsResolved / (stats.kpis.totalReports || 1)) * 100) : '...'}%
                  <Check className="w-7 h-7 text-emerald-500" />
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">{stats ? stats.kpis.reportsResolved : '...'} issues processed</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5 border-red-200/50 dark:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Active Departments</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  {stats ? stats.kpis.activeDepartments : '...'}
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">Departments handling reports</p>
              </div>
              <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Hourglass className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Avg Resolution Time</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats ? stats.kpis.avgResolutionTime : '...'}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">-15% improvement</p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Timer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap + Donut grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[350px]">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-1 min-h-[280px] w-full bg-[#1a1f2e] rounded-xl relative overflow-hidden border border-slate-700/50">
              <DashboardMapComponent reports={reports} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Issue Distribution by Department</h3>
            <div className="relative">
              <DepartmentDonutChart segments={stats?.departmentDistribution || []} total={stats?.kpis?.totalReports || 0} />
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {(stats?.departmentDistribution || []).map(({ name, value, color }: ChartSegment) => (
                <span key={name} className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} /> {name} {value}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Escalation Feed */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Live Escalation Feed</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/50 dark:bg-white/5">
                  <th className="px-6 py-4">Issue ID</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Time Elapsed</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {escalations.map((esc) => (
                  <tr key={esc.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800 dark:text-white">{esc.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> {esc.department}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">{esc.location}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${esc.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                        esc.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                          'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                        }`}>
                        {esc.severity}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${esc.severity === 'Critical' ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-600 dark:text-gray-400'}`}>
                      {esc.time_elapsed}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {esc.severity === 'Critical' ? (
                        <button type="button" className="inline-flex px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 dark:bg-white/10 text-white hover:bg-slate-700 dark:hover:bg-white/20 transition-colors">
                          Override
                        </button>
                      ) : (
                        <button type="button" className="inline-flex px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-white/20 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                          Notify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
