"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, ClipboardList, Loader2, Trophy, Mail } from "lucide-react";
import { fetchUserProfile, clearToken, UserProfile } from "@/lib/api";

export default function FieldProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/fieldadmin/login");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-x-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 rounded-b-2xl mb-4">
        <h1 className="font-bold text-lg">My Profile</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* ID Card */}
          <div className="mx-4 p-6 bg-[#1e3a8a] text-white rounded-[1.5rem] shadow-lg flex items-center gap-5 mb-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 backdrop-blur-sm">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
              <p className="text-blue-200 text-sm">{profile?.role || "Staff"}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="inline-block px-3 py-1 bg-black/30 rounded-full text-xs font-mono">
                  <Mail size={12} className="inline mr-1" />
                  {profile?.email || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {profile?.stats && (
            <div className="flex px-4 gap-3 mb-6">
              <div className="flex-1 bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-[#173F70]">{profile.stats.total_reports}</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="flex-1 bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-600">{profile.stats.resolved_reports}</span>
                <span className="text-xs text-emerald-600">Resolved</span>
              </div>
              <div className="flex-1 bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
                <span className="text-2xl font-black text-amber-600">{profile.stats.pending_reports}</span>
                <span className="text-xs text-amber-600">Pending</span>
              </div>
            </div>
          )}

          {/* Karma Badge */}
          {profile && (
            <div className="mx-4 mb-6 p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              <div>
                <p className="font-bold text-sm">Rank: {profile.rank || "Bronze"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.karma || 0} Karma Points</p>
              </div>
            </div>
          )}

          {/* Menu Options */}
          <div className="mx-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col mb-6">
            <button className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
              <ClipboardList size={20} className="text-gray-500" />
              <span className="font-medium text-sm">Duty Roster</span>
            </button>
            <button className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left">
              <Settings size={20} className="text-gray-500" />
              <span className="font-medium text-sm">App Settings</span>
            </button>
          </div>

          <div className="px-4">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500 font-bold rounded-[1.5rem] flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
