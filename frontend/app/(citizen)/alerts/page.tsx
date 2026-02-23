'use client'

import { useState, useEffect } from 'react'
import {
  UserCircle2,
  TriangleAlert,
  RefreshCw,
  Bell,
  Info,
  Loader2
} from 'lucide-react'
import { fetchAlerts, AppAlert } from '@/lib/api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AppAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts()
        setAlerts(data)
      } catch (err) {
        console.error('Failed to load alerts:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAlerts()
  }, [])

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'triangle': return <TriangleAlert className="w-6 h-6 text-red-500" />
      case 'refresh': return <RefreshCw className="w-5 h-5 text-blue-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      case 'bell':
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getBgClass = (iconName: string) => {
    switch (iconName) {
      case 'triangle': return 'bg-red-100'
      case 'refresh':
      case 'info': return 'bg-blue-50'
      case 'bell':
      default: return 'bg-gray-100'
    }
  }

  const filterOptions = [
    { id: 'All', color: 'bg-[#173F70] text-white' },
    { id: 'Urgent', color: 'bg-[#DC2626] text-white hover:bg-red-700' },
    { id: 'Updates', color: 'bg-[#5C8AE6] text-white hover:bg-blue-600' },
    { id: 'General', color: 'bg-[#9CA3AF] text-white hover:bg-gray-500' },
  ]

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All') return true;
    if (filter === 'Updates' && (alert.type === 'Update' || alert.type === 'Updates')) return true;
    return alert.type === filter;
  })

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
      {/* Header */}
      <header className="w-full px-5 pt-6 pb-3 flex justify-between items-center shrink-0 z-10">
        <h1 className="text-2xl font-black text-[#173F70]">Alerts</h1>
        <UserCircle2 className="w-8 h-8 text-[#173F70]" />
      </header>

      {/* Filter Chips */}
      <div className="flex px-5 gap-2 overflow-x-auto scrollbar-hide mb-5 shrink-0">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setFilter(opt.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors shadow-sm ${filter === opt.id ? opt.color : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
          >
            {opt.id}
          </button>
        ))}
      </div>

      {/* Alert Cards List */}
      <div className="flex flex-col px-4 gap-3 shrink-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#173F70]" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <p className="text-center text-gray-500 py-10 font-medium">No alerts found for this filter.</p>
        ) : filteredAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-50 flex gap-3 shrink-0 cursor-pointer hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgClass(alert.icon)}`}>
              {getIcon(alert.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-sm">{alert.title}</h3>
                {alert.type === 'Urgent' ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                    View
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">{alert.time}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {alert.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-black text-gray-900">{alert.type}</span>
                {alert.type === 'Urgent' && (
                  <span className="text-[10px] text-gray-400 font-medium">{alert.time}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
