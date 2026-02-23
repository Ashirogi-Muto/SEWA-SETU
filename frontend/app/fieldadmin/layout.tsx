"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { List, Map, Bell, User, Camera } from "lucide-react";
import { getToken } from "@/lib/api";
import { initOfflineSync } from "@/lib/offlineSync";

export default function FieldAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/fieldadmin/login";
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      const token = getToken();
      if (!token) {
        router.replace("/fieldadmin/login");
        return;
      }
    }
    setAuthChecked(true);
  }, [pathname, isLogin, router]);

  // Initialize offline sync engine
  useEffect(() => {
    const cleanup = initOfflineSync();
    return cleanup;
  }, []);

  // Don't render protected content until auth check passes
  if (!authChecked && !isLogin) return null;

  return (
    <>
      {children}
      {!isLogin && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[380px] bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/10 rounded-full shadow-2xl flex justify-between items-center px-6 py-3 z-30 transition-colors">
          <Link
            href="/fieldadmin"
            className="flex flex-col items-center gap-0.5 text-blue-600 dark:text-blue-400"
          >
            <List size={22} />
            <span className="text-[10px] font-medium">Tasks</span>
          </Link>
          <Link
            href="/fieldadmin/map"
            className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Map size={22} />
            <span className="text-[10px] font-medium">Map</span>
          </Link>
          <button
            type="button"
            className="w-12 h-12 bg-[#1e3a8a] text-white rounded-full flex items-center justify-center shadow-lg -mt-8 border-4 border-gray-50 dark:border-[#050A14] hover:bg-blue-900 active:scale-95 transition"
            aria-label="Proof of Work"
          >
            <Camera size={20} />
          </button>
          <Link
            href="/fieldadmin/alerts"
            className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Bell size={22} />
            <span className="text-[10px] font-medium">Alerts</span>
          </Link>
          <Link
            href="/fieldadmin/profile"
            className="flex flex-col items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </nav>
      )}
    </>
  );
}

