'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Search,
  Loader2,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchDepartments, fetchReports, BackendReport } from '@/lib/api'

interface DepartmentWithStats {
  id: number
  name: string
  email: string
  activeIssues: number
  resolvedIssues: number
  totalIssues: number
}

const DEPT_COLORS: Record<string, string> = {
  'Roads & Highways': '#3B82F6',
  'Sanitation': '#22C55E',
  'Water Supply': '#06B6D4',
  'Electricity': '#F59E0B',
  'Public Safety': '#EF4444',
}

function getDeptColor(name: string): string {
  return DEPT_COLORS[name] || '#8B5CF6'
}

export default function AdminDepartmentsPage() {
  const [search, setSearch] = useState('')
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [depts, reports] = await Promise.all([
          fetchDepartments(),
          fetchReports(),
        ])

        // Group reports by category to compute per-department stats
        const reportsByDept: Record<string, BackendReport[]> = {}
        for (const r of reports) {
          const cat = r.category || 'Unknown'
          if (!reportsByDept[cat]) reportsByDept[cat] = []
          reportsByDept[cat].push(r)
        }

        // Map category names to department names
        const categoryToDept: Record<string, string> = {
          'Roads/Potholes': 'Roads & Highways',
          'Sanitation': 'Sanitation',
          'Water': 'Water Supply',
          'Water Supply': 'Water Supply',
          'Electricity': 'Electricity',
          'Power': 'Electricity',
          'Safety': 'Public Safety',
          'Public Safety': 'Public Safety',
        }

        const enriched: DepartmentWithStats[] = depts.map((dept: any) => {
          // Find reports matching this department
          let matchingReports: BackendReport[] = []
          for (const [cat, deptName] of Object.entries(categoryToDept)) {
            if (deptName === dept.name && reportsByDept[cat]) {
              matchingReports = [...matchingReports, ...reportsByDept[cat]]
            }
          }
          // Also try direct name match
          if (reportsByDept[dept.name]) {
            matchingReports = [...matchingReports, ...reportsByDept[dept.name]]
          }

          const active = matchingReports.filter((r) => r.status !== 'resolved' && r.status !== 'RESOLVED').length
          const resolved = matchingReports.filter((r) => r.status === 'resolved' || r.status === 'RESOLVED').length

          return {
            id: dept.id,
            name: dept.name,
            email: dept.email,
            activeIssues: active,
            resolvedIssues: resolved,
            totalIssues: matchingReports.length,
          }
        })

        setDepartments(enriched)
      } catch (err) {
        console.error('Failed to load departments:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = departments.filter((d) => {
    if (!search) return true
    const s = search.toLowerCase()
    return d.name.toLowerCase().includes(s) || d.email.toLowerCase().includes(s)
  })

  const totalActive = departments.reduce((sum, d) => sum + d.activeIssues, 0)
  const totalResolved = departments.reduce((sum, d) => sum + d.resolvedIssues, 0)

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          Department Directory
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold">
            {departments.length} Departments
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold">
            {totalActive} Active Issues
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-semibold">
            {totalResolved} Resolved
          </span>
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="search"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
        />
      </div>

      {/* Department Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading departments...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((dept) => {
            const color = getDeptColor(dept.name)
            return (
              <div
                key={dept.id}
                className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {dept.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{dept.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {dept.email}
                      </div>
                    </div>
                  </div>
                  {dept.activeIssues > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-3 h-3" />
                      {dept.activeIssues} active
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{dept.totalIssues}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{dept.activeIssues}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{dept.resolvedIssues}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Resolved</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
