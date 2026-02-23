"use client";
import { User, LogOut, Settings, ClipboardList } from "lucide-react";

export default function FieldProfile() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-x-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 rounded-b-2xl mb-4">
        <h1 className="font-bold text-lg">My Profile</h1>
      </header>

      {/* ID Card */}
      <div className="mx-4 p-6 bg-[#1e3a8a] text-white rounded-[1.5rem] shadow-lg flex items-center gap-5 mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
          <User size={32} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Rahul Kumar</h2>
          <p className="text-blue-200 text-sm">PWD Field Engineer</p>
          <div className="mt-2 inline-block px-3 py-1 bg-black/30 rounded-full text-xs font-mono">ID: PWD-402</div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="mx-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col mb-6">
        <button className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
          <ClipboardList size={20} className="text-gray-500" /> <span className="font-medium text-sm">Duty Roster</span>
        </button>
        <button className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
          <Settings size={20} className="text-gray-500" /> <span className="font-medium text-sm">App Settings</span>
        </button>
      </div>

      <div className="px-4">
        <button className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 font-bold rounded-[1.5rem] flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
}
