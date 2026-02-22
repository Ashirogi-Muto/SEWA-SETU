'use client'

import {
  UserCircle2,
  TriangleAlert,
  RefreshCw,
  Bell,
  Info,
} from 'lucide-react'

export default function AlertsPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
      {/* Header */}
      <header className="w-full px-5 pt-6 pb-3 flex justify-between items-center shrink-0 z-10">
        <h1 className="text-2xl font-black text-[#173F70]">Alerts</h1>
        <UserCircle2 className="w-8 h-8 text-[#173F70]" />
      </header>

      {/* Filter Chips */}
      <div className="flex px-5 gap-2 overflow-x-auto scrollbar-hide mb-5 shrink-0">
        <button
          type="button"
          className="bg-[#173F70] text-white px-5 py-2 rounded-lg text-sm font-bold shrink-0"
        >
          All
        </button>
        <button
          type="button"
          className="bg-[#DC2626] text-white px-5 py-2 rounded-lg text-sm font-bold shrink-0 shadow-sm"
        >
          Urgent
        </button>
        <button
          type="button"
          className="bg-[#5C8AE6] text-white px-5 py-2 rounded-lg text-sm font-bold shrink-0 shadow-sm"
        >
          Updates
        </button>
        <button
          type="button"
          className="bg-[#9CA3AF] text-white px-5 py-2 rounded-lg text-sm font-bold shrink-0 shadow-sm"
        >
          General
        </button>
      </div>

      {/* Alert Cards List */}
      <div className="flex flex-col px-4 gap-3 shrink-0">
        {/* CARD 1: Heavy Rain Alert (Urgent) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-50 flex gap-3 shrink-0 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <TriangleAlert className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 text-sm">Heavy Rain Alert</h3>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                View
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Waterlogging expected in Sector 15. Take precautions.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-black text-gray-900">Urgent</span>
              <span className="text-[10px] text-gray-400 font-medium">10 min ago</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Report Update (Update) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-50 flex gap-3 shrink-0 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 text-sm">Report Update: #12345</h3>
              <span className="text-[10px] text-gray-400 font-medium shrink-0">2 hrs ago</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Your report on &apos;Pothole on Main St.&apos; is now &apos;In Progress&apos;.
            </p>
            <div className="flex items-center gap-2 mt-2 mb-1.5">
              <span className="text-xs font-black text-gray-900">Update</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-[#F59E0B] rounded-full" />
            </div>
          </div>
        </div>

        {/* CARD 3: Community Meeting (General) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-50 flex gap-3 shrink-0 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 text-sm">Community Meeting</h3>
              <span className="text-[10px] text-gray-400 font-medium shrink-0">Yesterday</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Monthly civic forum this Saturday at 10 AM, Town Hall.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-black text-gray-900">General</span>
            </div>
          </div>
        </div>

        {/* CARD 4: New Feature Added (Update) */}
        <div className="bg-white rounded-[20px] p-4 shadow-sm border border-gray-50 flex gap-3 shrink-0 cursor-pointer hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900 text-sm">New Feature Added</h3>
              <span className="text-[10px] text-gray-400 font-medium shrink-0">2 days ago</span>
            </div>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              You can now track garbage collection vehicles live.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-black text-gray-900">Update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
