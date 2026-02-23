"use client";

import React from "react";

const issuePills = [
  { urgency: "9.1", label: "G.K. Road", critical: true },
  { urgency: "8.7", label: "Akash Nagar", critical: false },
  { urgency: "8.5", label: "Sector 5", critical: false },
  { urgency: "8.2", label: "India Gate", critical: false },
];

export default function HeatmapPage() {
  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-[#050A14]">
      {/* Full-screen map */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/dark-city-map.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "block";
          }}
        />
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80 hidden"
          style={{
            backgroundImage: "url(/api/placeholder/1920/1080)",
            filter: "brightness(0.4) saturate(0.6)",
          }}
        />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(11,17,33,0.7) 100%)",
        }}
      />

      {/* Heat clusters */}
      <div
        className="absolute top-[18%] left-[22%] w-48 h-48 rounded-full animate-pulse pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(circle, rgba(239,68,68,0.7) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-[52%] left-[58%] w-56 h-56 rounded-full animate-pulse pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-[35%] left-[68%] w-40 h-40 rounded-full animate-pulse pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.65) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-[62%] left-[28%] w-44 h-44 rounded-full animate-pulse pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.55) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute top-[42%] left-[38%] w-32 h-32 rounded-full animate-pulse pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(circle, rgba(234,179,8,0.5) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Intel Strip HUD — floating top bar */}
      <div className="absolute top-6 left-6 right-6 z-20 h-16 bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full flex items-center px-6 justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-white tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            LIVE INTEL 🔴
          </span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide justify-center min-w-0 flex-1 mx-4">
          {issuePills.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-sm text-gray-200 shrink-0"
            >
              <span
                className={
                  item.critical ? "text-red-400 font-bold" : "text-emerald-400 font-semibold"
                }
              >
                {item.urgency}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Municipal Department Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Traffic Department Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Map tooltip — High-risk Cluster card */}
      <div className="absolute top-[20%] left-[28%] z-10 w-56 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl">
        <p className="font-semibold text-white">High-risk Cluster</p>
        <p className="text-sm text-gray-400 mt-1">Average Urgency: 8.8</p>
        <p className="text-sm text-gray-400">Identified: Pothole</p>
      </div>

      {/* Real-time Alert — bottom center toast */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-red-900/80 backdrop-blur border border-red-500/50 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 animate-pulse">
        <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <p className="text-sm font-medium whitespace-nowrap">
          High-risk cluster detected near India Gate. Severity:{" "}
          <span className="font-bold text-red-200">Critical</span>
        </p>
      </div>

      {/* Bottom Right: Data Select widget */}
      <div className="absolute bottom-6 right-6 z-10 w-64 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-4 shadow-xl">
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
          Data Select
        </p>
        <div className="h-24 flex items-end gap-1 mb-4">
          {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 min-w-0 rounded-t bg-cyan-500/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Leaky
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Issues
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Reality
          </span>
        </div>
      </div>
    </div>
  );
}
