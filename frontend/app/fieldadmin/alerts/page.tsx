"use client";

import { useState, useEffect } from "react";
import { Loader2, TriangleAlert, RefreshCw, Bell, Info, CheckCircle } from "lucide-react";
import { fetchAlerts, AppAlert } from "@/lib/api";

export default function FieldAlerts() {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAlerts();
        setAlerts(data || []);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "triangle": return <TriangleAlert className="w-5 h-5 text-red-500" />;
      case "refresh": return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
      case "bell":
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBg = (iconName: string) => {
    switch (iconName) {
      case "triangle": return "bg-red-100 dark:bg-red-900/30";
      case "refresh":
      case "info": return "bg-blue-50 dark:bg-blue-900/30";
      default: return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const getAccent = (type: string) => {
    if (type === "Urgent") return "bg-red-500";
    if (type === "Update" || type === "Updates") return "bg-blue-500";
    return "bg-gray-300 dark:bg-gray-600";
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-x-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 flex justify-between items-center rounded-b-2xl mb-4">
        <h1 className="font-bold text-lg">Notifications</h1>
        <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium cursor-pointer">Mark all read</span>
      </header>

      <div className="flex flex-col gap-3 px-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-10 h-10 mb-2 text-emerald-400" />
            <p className="font-medium">No notifications</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 flex gap-4 items-start relative overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getAccent(alert.type)}`} />
              <div className={`p-2 rounded-full ${getBg(alert.icon)}`}>
                {getIcon(alert.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{alert.type}</span>
                  <span className="text-[10px] text-gray-400">{alert.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
