'use client'

import { useRouter } from 'next/navigation'
import {
  User,
  MapPin,
  Trophy,
  UserCog,
  Globe,
  Bell,
  Download,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sewasetu_user')
    }
    router.push('/login')
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F4F7FB] pb-32">
      {/* Header */}
      <header className="w-full bg-white px-5 pt-6 pb-3 flex justify-between items-center shadow-sm shrink-0 z-10">
        <h1 className="text-2xl font-black text-[#173F70]">Profile</h1>
      </header>

      {/* Hero Card (User Identity & Karma) */}
      <div className="m-4 bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#173F70]/5 rounded-bl-full -z-0" />
        <div className="flex items-center gap-4 z-10 relative flex-1">
          <div className="w-20 h-20 rounded-full bg-gray-200 border-[4px] border-[#F4F7FB] shadow-md flex items-center justify-center shrink-0">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-xl font-bold text-gray-900">Rahul Kumar</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              Dadri, Greater Noida
            </p>
            <div className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 mt-3 w-fit">
              <Trophy className="w-3.5 h-3.5" />
              Citizen Rank: Gold (450 Karma)
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="flex px-4 gap-3 shrink-0 mb-2">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl font-black text-[#173F70]">42</span>
          <span className="text-xs text-gray-500">Total Reports</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl font-black text-[#10B981]">35</span>
          <span className="text-xs text-[#10B981]">Resolved</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1">
          <span className="text-2xl font-black text-[#F59E0B]">7</span>
          <span className="text-xs text-[#F59E0B]">Pending</span>
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="mx-4 mt-2 bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden shrink-0 flex flex-col divide-y divide-gray-100">
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-3 bg-blue-100 text-blue-600">
              <UserCog className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900">Edit Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-3 bg-[#173F70]/10 text-[#173F70]">
              <Globe className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900">Language / भाषा</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-3 bg-orange-100 text-orange-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900">Notifications</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-3 bg-green-100 text-green-600">
              <Download className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900">Export Data (CSV)</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
        <button className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-3 bg-gray-100 text-gray-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="font-medium text-gray-900">Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="mx-4 mt-6 mb-4 bg-red-50 text-red-600 border border-red-100 font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-red-100 transition-colors shrink-0"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </div>
  )
}
