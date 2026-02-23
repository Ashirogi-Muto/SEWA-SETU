'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
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
import DepartmentDonutChart, { SEGMENTS } from './_components/DepartmentDonutChart'

const DATE_OPTIONS = ['Today, Oct 26', 'Last 7 Days', 'This Month', 'Last 30 Days']

export default function AdminPage() {
  const { theme, setTheme } = useTheme()
  const [dateOpen, setDateOpen] = useState(false)
  const [dateLabel, setDateLabel] = useState('Today, Oct 26')
  const dateRef = useRef<HTMLDivElement>(null)

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
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Active Issues</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">1,245</p>
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
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">AI Auto-Routed Today</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-1">
                  98%
                  <Check className="w-7 h-7 text-emerald-500" />
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">1,220 issues processed</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5 border-red-200/50 dark:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400">SLA Breaches (Critical)</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                  34
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">Requires immediate attention</p>
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
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">04:12:00</p>
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
              {/* CSS grid background - sharper grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(71, 85, 105, 0.5) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(71, 85, 105, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(100, 116, 139, 0.5) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(100, 116, 139, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '96px 96px',
                }}
              />
              {/* Glowing heatmap orbs - focused heat zones (~40–50px blur) */}
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/50 blur-[48px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-500/35 blur-[50px] rounded-full" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-yellow-500/40 blur-[40px] rounded-full" />
              <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-red-500/45 blur-[40px] rounded-full" />
              {/* Heatmap controls: dropdown top-right */}
              <div className="absolute top-4 right-4 z-10">
                <select
                  className="bg-slate-900/90 backdrop-blur border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  defaultValue="all"
                >
                  <option value="all">All Departments</option>
                  <option value="pwd">PWD</option>
                  <option value="jal">Jal Nigam</option>
                </select>
              </div>
              {/* SEVERITY legend bottom-left */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-600 p-3 rounded-lg flex flex-col gap-2 z-10">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">SEVERITY</span>
                <div className="flex items-center gap-2 text-xs text-slate-300"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> High</div>
                <div className="flex items-center gap-2 text-xs text-slate-300"><div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Medium</div>
                <div className="flex items-center gap-2 text-xs text-slate-300"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" /> Low</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/10 p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Issue Distribution by Department</h3>
            <div className="relative">
              <DepartmentDonutChart />
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {SEGMENTS.map(({ name, value, color }) => (
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
                <tr className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800 dark:text-white">#GN-849</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> PWD
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">Alpha II</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                      Critical
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">48h 12m</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="inline-flex px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 dark:bg-white/10 text-white hover:bg-slate-700 dark:hover:bg-white/20 transition-colors">
                      Override
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800 dark:text-white">#GN-850</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> Jal Nigam
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">Knowledge Park III</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                      High
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">24h 45m</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="inline-flex px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-white/20 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                      Notify
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-slate-800 dark:text-white">#GN-851</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Sanitation
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">Sector 150</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                      Medium
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">02h 10m</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" className="inline-flex px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-white/20 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                      Notify
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
