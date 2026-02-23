"use client";
import { Bell, AlertTriangle, CheckCircle } from "lucide-react";

export default function FieldAlerts() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-x-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 flex justify-between items-center rounded-b-2xl mb-4">
        <h1 className="font-bold text-lg">Notifications</h1>
        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium cursor-pointer">Mark all read</span>
      </header>
      <div className="flex flex-col gap-3 px-4">
        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"><AlertTriangle size={20} /></div>
          <div>
            <h3 className="font-bold text-sm mb-1">Critical Ticket Assigned</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pothole in Alpha II. SLA breached in 48h.</p>
            <span className="text-[10px] text-gray-400 mt-2 block">10 mins ago</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 items-start">
           <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full"><CheckCircle size={20} /></div>
           <div>
            <h3 className="font-bold text-sm mb-1">Leave Request Approved</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your request for Oct 28 has been approved by HOD.</p>
            <span className="text-[10px] text-gray-400 mt-2 block">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
