"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Map,
  Play,
  MapPin,
  Sun,
  Moon,
  Loader2,
  CheckCircle,
  Navigation,
} from "lucide-react";
import { fetchAssignedReports, updateReportStatus, BackendReport } from "@/lib/api";
import { enqueueAction } from "@/lib/offlineQueue";

function getPriorityFromImpact(impact: number | null | undefined) {
  if (impact == null) return { label: "Medium", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" };
  if (impact >= 7) return { label: "Critical", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" };
  if (impact >= 4) return { label: "High", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" };
  return { label: "Medium", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" };
}

export default function FieldAdminPage() {
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      const data = await fetchAssignedReports();
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const showOfflineToast = (msg: string) => {
    setOfflineToast(msg);
    setTimeout(() => setOfflineToast(null), 3000);
  };

  const handleStartWork = async (id: number) => {
    try {
      if (!navigator.onLine) throw new Error('Offline');
      await updateReportStatus(id, "in_progress");
      await loadTasks();
    } catch (err) {
      console.error("Failed to start work (saving offline):", err);
      try {
        await enqueueAction({
          type: 'resolution',
          payload: { reportId: id, status: 'in_progress' },
        });
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress' } : t));
        showOfflineToast('Saved offline — will sync automatically');
      } catch (queueErr) {
        console.error('Failed to queue offline:', queueErr);
      }
    }
  };

  const handleResolve = async (id: number) => {
    try {
      if (!navigator.onLine) throw new Error('Offline');
      await updateReportStatus(id, "resolved");
      await loadTasks();
    } catch (err) {
      console.error("Failed to resolve (saving offline):", err);
      try {
        await enqueueAction({
          type: 'resolution',
          payload: { reportId: id, status: 'resolved' },
        });
        // Optimistic update: remove from task list
        setTasks(prev => prev.filter(t => t.id !== id));
        showOfflineToast('Saved offline — will sync automatically');
      } catch (queueErr) {
        console.error('Failed to queue offline:', queueErr);
      }
    }
  };

  const urgentTask = tasks[0] || null;
  const queueTasks = tasks.slice(1);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-x-hidden transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 flex justify-between items-center rounded-b-2xl mb-4">
        <Image
          src="/logo.png"
          alt="SewaSetu"
          width={100}
          height={30}
          className="object-contain"
        />
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            On Duty
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
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
          {/* Urgent Job Card */}
          {urgentTask && (
            <div className="mx-4 mb-6 p-5 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
              <div className="pl-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">
                    {getPriorityFromImpact(urgentTask.impact_score).label} — {urgentTask.category || "Issue"}
                  </span>
                  <span className="font-mono text-xs text-red-400 dark:text-red-300">
                    #R-{urgentTask.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {urgentTask.description}
                </h2>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-4">
                  <MapPin size={14} />
                  {urgentTask.location_name || (urgentTask.latitude ? `${urgentTask.latitude.toFixed(4)}, ${urgentTask.longitude.toFixed(4)}` : "Location attached")}
                </div>
                <div className="flex gap-2">
                  {urgentTask.latitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${urgentTask.latitude},${urgentTask.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-md transition"
                    >
                      <Navigation size={18} />
                      Navigate
                    </a>
                  )}
                  {urgentTask.status === "open" ? (
                    <button
                      type="button"
                      onClick={() => handleStartWork(urgentTask.id)}
                      className="flex-1 bg-gray-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-md active:scale-95 transition"
                    >
                      <Play size={18} />
                      Start Work
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleResolve(urgentTask.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-md transition"
                    >
                      <CheckCircle size={18} />
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Queue */}
          {queueTasks.length > 0 && (
            <>
              <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Queue ({queueTasks.length})
              </div>
              <div className="flex flex-col gap-3 px-4">
                {queueTasks.map((task) => {
                  const priority = getPriorityFromImpact(task.impact_score);
                  return (
                    <div key={task.id} className="mx-0 mb-0 p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white line-clamp-1">
                          {task.category || "Issue"} — R-{task.id}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priority.color}`}>
                          {priority.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                      {task.status === "open" ? (
                        <button
                          type="button"
                          onClick={() => handleStartWork(task.id)}
                          className="w-full mt-3 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold flex justify-center items-center gap-2 transition"
                        >
                          <Play size={16} />
                          Start Work
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleResolve(task.id)}
                          className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Offline toast */}
      {offlineToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#78350f',
            color: '#fef3c7',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          {offlineToast}
        </div>
      )}
    </div>
  );
}
