"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import {
  Map,
  Play,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";

export default function FieldAdminPage() {
  const { theme, setTheme } = useTheme();

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

      {/* Urgent Job Card (Softer, App-like) */}
      <div className="mx-4 mb-6 p-5 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
        <div className="pl-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wide">
              Critical Pothole
            </span>
            <span className="font-mono text-xs text-red-400 dark:text-red-300">
              #GN-849
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Alpha II, Main Road
          </h2>
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-4">
            <MapPin size={14} />
            1.2km away
          </div>
          <div className="flex gap-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Alpha+II+Main+Road"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-md transition"
            >
              <Map size={18} />
              Navigate
            </a>
            <button
              type="button"
              className="flex-1 bg-gray-900 dark:bg-white dark:text-black text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-md active:scale-95 transition"
            >
              <Play size={18} />
              Start Work
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Queue */}
      <div className="px-4 mt-6 mb-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        Queue (2)
      </div>
      <div className="flex flex-col gap-3 px-4">
        <div className="mx-0 mb-4 p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white">
              Water Leakage
            </span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
              Medium
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sector 150, Near Ace Golfshire
          </p>
          <button
            type="button"
            className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            Mark Resolved
          </button>
        </div>
        <div className="mx-0 mb-4 p-4 bg-white dark:bg-[#0f172a] rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white">
              Garbage Pile-up
            </span>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
              Medium
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Delta I, Main Chowk
          </p>
          <button
            type="button"
            className="w-full mt-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
