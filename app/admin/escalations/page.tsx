'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ESCALATION_LEVELS = {
  L1: 'L1 (Supervisor)',
  L2: 'L2 (HOD)',
  L3: 'L3 (District Magistrate)',
} as const

const MOCK_TICKETS = [
  {
    id: 'GN-0992',
    issueType: 'Severe Pothole',
    dept: 'PWD',
    location: 'Alpha II',
    overdue: '+74h 12m',
    overdueStyle: 'text-red-600 dark:text-red-400 font-bold animate-pulse',
    level: 'L3' as const,
    action: 'Force Reassign',
    actionStyle: 'bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition',
  },
  {
    id: 'GN-1004',
    issueType: 'Pipeline Burst',
    dept: 'Jal Nigam',
    location: 'Sector 150',
    overdue: '+42h 05m',
    overdueStyle: 'text-orange-600 dark:text-orange-400 font-semibold',
    level: 'L2' as const,
    action: 'Ping HOD',
    actionStyle: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-1.5 rounded-md text-sm font-medium transition',
  },
  {
    id: 'GN-1045',
    issueType: 'Transformer Spark',
    dept: 'UPPCL',
    location: 'Knowledge Park',
    overdue: '+25h 30m',
    overdueStyle: 'text-amber-600 dark:text-amber-400 font-semibold',
    level: 'L1' as const,
    action: 'Escalate',
    actionStyle: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-1.5 rounded-md text-sm font-medium transition',
  },
  {
    id: 'GN-1088',
    issueType: 'Garbage Pile-up',
    dept: 'Sanitation',
    location: 'Delta I',
    overdue: '+68h 00m',
    overdueStyle: 'text-red-600 dark:text-red-400 font-bold animate-pulse',
    level: 'L3' as const,
    action: 'Force Reassign',
    actionStyle: 'bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition',
  },
  {
    id: 'GN-1102',
    issueType: 'Streetlight Failure',
    dept: 'UPPCL',
    location: 'Sector 22',
    overdue: '+31h 15m',
    overdueStyle: 'text-amber-600 dark:text-amber-400 font-semibold',
    level: 'L1' as const,
    action: 'Escalate',
    actionStyle: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-1.5 rounded-md text-sm font-medium transition',
  },
]

export default function AdminEscalationsPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [overdueFilter, setOverdueFilter] = useState('all')

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="text-red-600 dark:text-red-400">SLA</span> Escalation Matrix
        </h1>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg font-bold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Global Breach Rate: 8.4% (Critical)
        </div>
      </header>

      {/* Action Required Banner */}
      <div className="w-full bg-red-600/10 dark:bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 bg-red-500 rounded-full animate-pulse shrink-0"
            aria-hidden
          />
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            7 Issues have crossed the 72-hour critical threshold and require
            immediate District Magistrate intervention.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          Notify All HODs
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="search"
            placeholder="Search ticket ID or location..."
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
          <option value="pwd">PWD</option>
          <option value="jal">Jal Nigam</option>
          <option value="uppcl">UPPCL</option>
          <option value="sanitation">Sanitation</option>
        </select>
        <select
          value={overdueFilter}
          onChange={(e) => setOverdueFilter(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 min-w-[160px]"
        >
          <option value="all">Overdue By: All</option>
          <option value="24">&gt;24h</option>
          <option value="48">&gt;48h</option>
          <option value="72">&gt;72h</option>
        </select>
      </div>

      {/* Escalation Table */}
      <div className="bg-white dark:bg-[#0f172a]/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold tracking-wider">
                <th className="text-left px-6 py-4">Ticket ID</th>
                <th className="text-left px-6 py-4">Issue Type</th>
                <th className="text-left px-6 py-4">Assigned Dept</th>
                <th className="text-left px-6 py-4">Location</th>
                <th className="text-left px-6 py-4">Overdue Time</th>
                <th className="text-left px-6 py-4">Escalation Level</th>
                <th className="text-right px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TICKETS.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      #{ticket.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ticket.issueType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ticket.dept}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
                    {ticket.location}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'text-sm inline-flex items-center gap-1.5',
                        ticket.overdueStyle
                      )}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      Overdue: {ticket.overdue}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {ESCALATION_LEVELS[ticket.level]}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className={cn('inline-flex items-center gap-1.5', ticket.actionStyle)}
                    >
                      {ticket.action}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
