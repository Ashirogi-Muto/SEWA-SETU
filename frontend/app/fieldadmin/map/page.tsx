"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { fetchReports, BackendReport } from "@/lib/api";

const DashboardMapComponent = dynamic(
  () => import("@/app/admin/_components/DashboardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#1a1f2e] animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    ),
  }
);

export default function FieldMap() {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReports();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to load reports for map:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 rounded-b-2xl shadow-sm">
        <h1 className="font-bold text-lg">Nearby Tasks</h1>
      </header>
      <div className="relative w-full h-[calc(100vh-8rem)] bg-[#0f172a] mt-4 rounded-[1.5rem] mx-2 max-w-[calc(100%-1rem)] overflow-hidden border border-white/10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <DashboardMapComponent reports={reports} />
        )}
      </div>
    </div>
  );
}
