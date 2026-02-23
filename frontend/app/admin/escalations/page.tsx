'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchEscalations, Escalation } from '@/lib/api'

function getEscalationLevel(severity: string, timeElapsed: string) {
  const hours = parseFloat(timeElapsed) || 0
  if (severity === 'Critical' || hours > 72) return 'L3'
  if (severity === 'High' || hours > 48) return 'L2'
  return 'L1'
}

const ESCALATION_LEVELS = {
  L1: 'L1 (Supervisor)',
  L2: 'L2 (HOD)',
  L3: 'L3 (District Magistrate)',
} as const

function getOverdueStyle(severity: string) {
  if (severity === 'Critical') return 'text-red-600 dark:text-red-400 font-bold animate-pulse'
  if (severity === 'High') return 'text-orange-600 dark:text-orange-400 font-semibold'
  return 'text-amber-600 dark:text-amber-400 font-semibold'
}

function getAction(level: string) {
  if (level === 'L3') return { label: 'Force Reassign', style: 'bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition' }
  if (level === 'L2') return { label: 'Ping HOD', style: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-1.5 rounded-md text-sm font-medium transition' }
  return { label: 'Escalate', style: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-1.5 rounded-md text-sm font-medium transition' }
}

export default function AdminEscalationsPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [overdueFilter, setOverdueFilter] = useState('all')
  const [tickets, setTickets] = useState<Escalation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchEscalations()
        setTickets(data)
      } catch (err) {
        console.error('Failed to load escalations:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Extract unique departments for filter
  const departments = Array.from(new Set(tickets.map((t) => t.department)))

  // Compute critical count
  const criticalCount = tickets.filter((t) => t.severity === 'Critical').length

  // Apply filters
  const filtered = tickets.filter((t) => {
    if (search) {
      const s = search.toLowerCase()
      if (!t.id.toLowerCase().includes(s) && !t.location.toLowerCase().includes(s) && !t.department.toLowerCase().includes(s)) return false
    }
    if (deptFilter !== 'all' && t.department.toLowerCase() !== deptFilter.toLowerCase()) return false
    return true
  })

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="text-red-600 dark:text-red-400">SLA</span> Escalation Matrix
        </h1>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {criticalCount} Critical Escalation{criticalCount !== 1 ? 's' : ''} Active
        </div>
      </header>

      {/* Action Required Banner */}
      {criticalCount > 0 && (
        <div className="w-full bg-red-600/10 dark:bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 bg-red-500 rounded-full animate-pulse shrink-0"
              aria-hidden
            />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {criticalCount} issue{criticalCount !== 1 ? 's have' : ' has'} crossed the critical threshold and require{criticalCount === 1 ? 's' : ''}
              {' '}immediate intervention.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Notify All HODs
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search ticket ID, department, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 min-w-[160px]"
        >
          <option value="all">Filter by Dept: All</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Escalation Table */}
      <div className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading escalations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            {tickets.length === 0 ? 'No escalations found.' : 'No results match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold tracking-wider">
                  <th className="text-left px-6 py-4">Ticket ID</th>
                  <th className="text-left px-6 py-4">Department</th>
                  <th className="text-left px-6 py-4">Location</th>
                  <th className="text-left px-6 py-4">Severity</th>
                  <th className="text-left px-6 py-4">Time Elapsed</th>
                  <th className="text-left px-6 py-4">Escalation Level</th>
                  <th className="text-right px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => {
                  const level = getEscalationLevel(ticket.severity, ticket.time_elapsed)
                  const action = getAction(level)
                  return (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {ticket.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
                        {ticket.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          'inline-flex px-2.5 py-1 rounded-md text-xs font-medium',
                          ticket.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                            ticket.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                              'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                        )}>
                          {ticket.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-sm inline-flex items-center gap-1.5',
                            getOverdueStyle(ticket.severity)
                          )}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          {ticket.time_elapsed}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {ESCALATION_LEVELS[level as keyof typeof ESCALATION_LEVELS]}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          className={cn('inline-flex items-center gap-1.5', action.style)}
                        >
                          {action.label}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
