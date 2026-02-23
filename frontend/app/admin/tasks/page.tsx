'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  List,
  Map,
  Bell,
  User,
  Navigation,
  Camera,
  Play,
  X,
  Loader2,
  MapPin,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchAssignedReports, updateReportStatus, BackendReport } from '@/lib/api'

const BOTTOM_NAV_ITEMS = [
  { icon: List, label: 'Tasks', path: '/admin/tasks', active: true },
  { icon: Map, label: 'Map', path: '/admin/heatmap' },
  { icon: Bell, label: 'Alerts', path: '#' },
  { icon: User, label: 'Profile', path: '#' },
]

function getPriorityFromImpact(impact: number | null | undefined) {
  if (impact == null) return { label: 'Medium', style: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
  if (impact >= 7) return { label: 'Critical', style: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  if (impact >= 4) return { label: 'High', style: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' }
  return { label: 'Medium', style: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
}

export default function AdminTasksPage() {
  const [onDuty, setOnDuty] = useState(true)
  const [tasks, setTasks] = useState<BackendReport[]>([])
  const [loading, setLoading] = useState(true)
  const [proofModalOpen, setProofModalOpen] = useState(false)
  const [resolvingTaskId, setResolvingTaskId] = useState<number | null>(null)
  const [slideProgress, setSlideProgress] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)

  const loadTasks = async () => {
    try {
      const data = await fetchAssignedReports()
      setTasks(data || [])
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTasks() }, [])

  const handleStartWork = async (id: number) => {
    try {
      await updateReportStatus(id, 'in_progress')
      await loadTasks()
    } catch (err) {
      console.error('Failed to start work:', err)
    }
  }

  const openProofModal = (taskId: number) => {
    setResolvingTaskId(taskId)
    setProofModalOpen(true)
    setSlideProgress(0)
  }

  const closeProofModal = async (resolved = false) => {
    if (resolved && resolvingTaskId != null) {
      try {
        await updateReportStatus(resolvingTaskId, 'resolved')
        await loadTasks()
      } catch (err) {
        console.error('Failed to resolve:', err)
      }
    }
    setProofModalOpen(false)
    setResolvingTaskId(null)
    setSlideProgress(0)
  }

  const slideProgressRef = useRef(0)
  const handleSlideStart = () => setIsSliding(true)
  const handleSlideEnd = () => {
    if (slideProgressRef.current >= 100) closeProofModal(true)
    else setSlideProgress(0)
    slideProgressRef.current = 0
    setIsSliding(false)
  }
  const getSlidePct = (clientX: number) => {
    if (!slideRef.current) return 0
    const rect = slideRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    return Math.round((x / rect.width) * 100)
  }
  const handleSlideMove = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = getSlidePct(clientX)
    slideProgressRef.current = pct
    setSlideProgress(pct)
    if (pct >= 100) closeProofModal(true)
  }

  useEffect(() => {
    if (!isSliding) return
    const onMove = (e: TouchEvent | MouseEvent) => {
      const clientX = e instanceof TouchEvent ? e.touches[0]?.clientX : e.clientX
      if (clientX == null) return
      const pct = getSlidePct(clientX)
      slideProgressRef.current = pct
      setSlideProgress(pct)
      if (pct >= 100) closeProofModal(true)
    }
    const onEnd = () => {
      if (slideProgressRef.current >= 100) closeProofModal(true)
      else setSlideProgress(0)
      slideProgressRef.current = 0
      setIsSliding(false)
    }
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)
    return () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onEnd)
    }
  }, [isSliding])

  const urgentTask = tasks[0] || null
  const queueTasks = tasks.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-[#131b2f] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          My Assigned Jobs
        </h1>
        <button
          type="button"
          role="switch"
          aria-checked={onDuty}
          onClick={() => setOnDuty((d) => !d)}
          className={cn(
            'min-h-[44px] min-w-[100px] px-4 rounded-full font-semibold text-sm transition-colors flex items-center justify-center',
            onDuty
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          {onDuty ? 'On Duty' : 'Off Duty'}
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
          <CheckCircle className="w-12 h-12 mb-3 text-emerald-400" />
          <p className="font-semibold">All caught up!</p>
          <p className="text-sm">No pending tasks at the moment.</p>
        </div>
      ) : (
        <>
          {/* Urgent Job Hero Card */}
          {urgentTask && (
            <section className="m-4 p-5 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-xl shadow-sm">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
                  {getPriorityFromImpact(urgentTask.impact_score).label} — {urgentTask.category || 'Issue'}
                </h2>
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  #R-{urgentTask.id}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {urgentTask.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {urgentTask.location_name || (urgentTask.latitude ? `${urgentTask.latitude.toFixed(4)}, ${urgentTask.longitude.toFixed(4)}` : 'Location attached')}
              </p>
              <div className="flex flex-col gap-3">
                {urgentTask.latitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${urgentTask.latitude},${urgentTask.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                  >
                    <Navigation className="w-5 h-5" />
                    Navigate
                  </a>
                )}
                {urgentTask.status === 'open' ? (
                  <button
                    type="button"
                    onClick={() => handleStartWork(urgentTask.id)}
                    className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Play className="w-5 h-5" />
                    Start Work
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openProofModal(urgentTask.id)}
                    className="min-h-[48px] w-full flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Queue */}
          {queueTasks.length > 0 && (
            <>
              <h3 className="px-4 mt-6 mb-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Queue ({queueTasks.length})
              </h3>
              <ul className="px-0">
                {queueTasks.map((task) => {
                  const priority = getPriorityFromImpact(task.impact_score)
                  return (
                    <li key={task.id} className="mx-4 mb-4">
                      <div className="p-4 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {task.category || 'Issue'} — R-{task.id}
                          </span>
                          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full shrink-0', priority.style)}>
                            {priority.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                        {task.status === 'open' ? (
                          <button
                            type="button"
                            onClick={() => handleStartWork(task.id)}
                            className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Start Work
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openProofModal(task.id)}
                            className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </>
      )}

      {/* Proof of Work Modal */}
      {proofModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeProofModal()}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#131b2f] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#131b2f]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Upload Fix Evidence
              </h3>
              <button
                type="button"
                onClick={() => closeProofModal()}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  After (your fix)
                </p>
                <label className="min-h-[160px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors">
                  <Camera className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tap to upload photo
                  </span>
                  <input type="file" accept="image/*" capture="environment" className="sr-only" />
                </label>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Close Ticket
                </p>
                <div
                  ref={slideRef}
                  className="relative h-14 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden select-none"
                  onMouseDown={handleSlideStart}
                  onMouseMove={handleSlideMove}
                  onMouseUp={handleSlideEnd}
                  onMouseLeave={handleSlideEnd}
                  onTouchStart={handleSlideStart}
                  onTouchMove={handleSlideMove}
                  onTouchEnd={handleSlideEnd}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-red-500 flex items-center justify-center transition-all duration-75"
                    style={{ width: `${slideProgress}%` }}
                  >
                    <span className="text-white font-bold text-sm">
                      Slide to confirm
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span
                      className={cn(
                        'font-bold text-sm transition-opacity',
                        slideProgress > 20 ? 'opacity-0' : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      Slide to confirm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-[#131b2f] border-t border-gray-200 dark:border-gray-800 flex justify-around p-3 z-10">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.active
          return (
            <Link
              key={item.label}
              href={item.path}
              className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  isActive
                    ? 'text-cyan-500 dark:text-cyan-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span
                className={cn(
                  isActive
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
