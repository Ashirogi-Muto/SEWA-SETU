'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Search, ShieldCheck, UserCircle2, MessageSquare, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchMyReports, BackendReport } from '@/lib/api'
import dynamic from 'next/dynamic'

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="w-full h-36 bg-gray-100 rounded-xl animate-pulse border border-gray-200" />
})

// Time formatter utility
function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export default function HomePage() {
  const [activeCount, setActiveCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [resolvedCount, setResolvedCount] = useState(0)
  const [recentIssues, setRecentIssues] = useState<BackendReport[]>([])
  const [activeReports, setActiveReports] = useState<BackendReport[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const reports = await fetchMyReports()
        if (reports && reports.length > 0) {
          setActiveCount(reports.filter(r => ['open', 'OPEN'].includes(r.status)).length)
          setInProgressCount(reports.filter(r => ['in_progress', 'IN_PROGRESS'].includes(r.status)).length)
          setResolvedCount(reports.filter(r => ['resolved', 'RESOLVED'].includes(r.status)).length)

          const sorted = [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          setRecentIssues(sorted.slice(0, 2))

          // Provide live active reports to the DashboardMap
          const activeReps = reports.filter(r => ['open', 'in_progress', 'OPEN', 'IN_PROGRESS'].includes(r.status))
          setActiveReports(activeReps)
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error)
      }
    }
    loadData()
  }, [])

  return (
    <div className="flex flex-col w-full pb-28">
      {/* HEADER - top app bar, edge-to-edge, matches navbar */}
      <header className="w-full bg-white px-5 pt-6 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SewaSetu" className="w-14 h-14 object-contain shrink-0" />
          <span className="text-xl font-bold text-[#173F70]">SewaSetu</span>
        </div>
        <UserCircle2 className="w-10 h-10 text-[#173F70]" strokeWidth={2} />
      </header>

      {/* CONTENT - side padding restored */}
      <div className="flex flex-col px-4 pt-6 gap-5 shrink-0">
        {/* MY REPORTS - COMPACT, ARROWS BEHIND CIRCLES */}
        <Card className="shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <CardContent className="p-0 flex flex-col gap-3">
            <h2 className="text-base font-bold text-gray-900">My Reports</h2>

            {/* TRACKER: labels under icons, then numbers + subtext; arrows behind */}
            <div className="relative flex items-center justify-between pt-1">
              {/* Connecting lines with CSS triangle arrowheads - behind circles */}
              <div className="absolute top-6 left-[18%] right-[18%] flex justify-between z-0">
                <div className="relative w-[42%] h-[2px] bg-[#3B82F6]">
                  <div className="absolute -right-1 -top-[4px] border-y-[5px] border-y-transparent border-l-[6px] border-l-[#3B82F6]"></div>
                </div>
                <div className="relative w-[42%] h-[2px] bg-[#F59E0B]">
                  <div className="absolute -right-1 -top-[4px] border-y-[5px] border-y-transparent border-l-[6px] border-l-[#F59E0B]"></div>
                </div>
              </div>

              {/* REPORT */}
              <div className="flex flex-col items-center gap-0.5 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center ring-4 ring-white">
                  <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-gray-900">Report</p>
                <p className="text-xl font-bold text-[#3B82F6]">{activeCount}</p>
                <p className="text-[10px] text-gray-500">Active</p>
              </div>

              {/* TRACK */}
              <div className="flex flex-col items-center gap-0.5 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center ring-4 ring-white">
                  <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-gray-900">Track</p>
                <p className="text-xl font-bold text-[#F59E0B]">{inProgressCount}</p>
                <p className="text-[10px] text-gray-500">In Progress</p>
              </div>

              {/* RESOLVE */}
              <div className="flex flex-col items-center gap-0.5 z-10 relative">
                <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center ring-4 ring-white">
                  <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-gray-900">Resolve</p>
                <p className="text-xl font-bold text-[#10B981]">{resolvedCount}</p>
                <p className="text-[10px] text-gray-500">Resolved</p>
              </div>
            </div>

            {/* NEW REPORT BUTTON */}
            <Link href="/report" className="block">
              <Button
                className="w-full py-3 bg-[#173F70] hover:bg-[#0f2d52] rounded-lg text-white font-semibold text-sm"
              >
                New Report +
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* LIVE TRACKING CARD */}
        <Card className="shrink-0 bg-white rounded-2xl p-0 shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <h3 className="text-base font-bold text-gray-900">Live Tracking</h3>
          </div>
          <div className="px-4 pb-4">
            <DashboardMap reports={activeReports} />
          </div>
        </Card>

        {/* COMMUNITY FEED SECTION - EXACT MOCKUP */}
        <div className="shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-gray-900">Community Feed</h3>
            <Link href="/history">
              <span className="text-xs text-blue-600 font-semibold hover:text-blue-700">View All</span>
            </Link>
          </div>

          {/* Dynamic Feed */}
          {recentIssues.length > 0 ? recentIssues.map((issue, idx) => {
            const isResolved = issue.status === 'resolved' || issue.status === 'RESOLVED'
            return (
              <Card key={issue.id} className="shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <CardContent className="p-0 flex gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isResolved ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {isResolved ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                        ) : (
                          <MessageSquare className={`w-4 h-4 ${isResolved ? 'text-[#10B981]' : 'text-[#F59E0B]'}`} strokeWidth={2} />
                        )}
                      </div>
                      <p className={`font-bold text-xs ${isResolved ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                        {issue.category || 'Local Issue'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {issue.description}
                    </p>
                    <p className="text-[10px] text-gray-400">{timeAgo(issue.created_at)}</p>
                  </div>
                  {issue.image_url && (
                    <img
                      src={issue.image_url}
                      alt="Report image"
                      className="w-12 h-12 rounded-lg object-cover shrink-0 ml-3"
                    />
                  )}
                </CardContent>
              </Card>
            )
          }) : (
            <>
              {/* Fallback to original mockups if no data */}
              <Card className="shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <CardContent className="p-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                    </div>
                    <p className="font-bold text-xs text-[#F59E0B]">Local Issue</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Recent posts about the haringarwoods with local issues. Pursists are where hiors emergency with sail around.
                  </p>
                  <p className="text-[10px] text-gray-400">11 hours ago</p>
                </CardContent>
              </Card>

              <Card className="shrink-0 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <CardContent className="p-0 flex gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                      </div>
                      <p className="font-bold text-xs text-[#10B981]">Completed Work</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Completed works wortnot conserved with hearior development.
                    </p>
                    <p className="text-[10px] text-gray-400">2 days ago</p>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=100&h=100"
                    alt="Completed road"
                    className="w-12 h-12 rounded-lg object-cover shrink-0 ml-3"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
