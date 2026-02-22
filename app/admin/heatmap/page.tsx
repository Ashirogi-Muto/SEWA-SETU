"use client";
import React from "react";

const glassPanel =
  "bg-black/20 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]";

export default function HeatmapPage() {
  return (
    <div
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
      style={{
        backgroundImage:
          "url(/placeholder-dark-map.jpg), url(/api/placeholder/1920/1080)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay so UI pops */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Crisp heat zones — smaller, distinct hot spots (blur-30) */}
      <div className="absolute top-[20%] left-[25%] w-32 h-32 rounded-full bg-red-500/60 blur-[30px] animate-pulse pointer-events-none z-[1]" />
      <div className="absolute top-[55%] left-[50%] w-48 h-48 rounded-full bg-red-500/55 blur-[30px] pointer-events-none z-[1]" />
      <div className="absolute top-[35%] left-[65%] w-28 h-28 rounded-full bg-orange-500/55 blur-[30px] animate-pulse pointer-events-none z-[1]" />
      <div className="absolute top-[62%] left-[28%] w-36 h-36 rounded-full bg-orange-500/50 blur-[30px] pointer-events-none z-[1]" />
      <div className="absolute top-[42%] left-[38%] w-24 h-24 rounded-full bg-red-500/50 blur-[30px] animate-pulse pointer-events-none z-[1]" />

      {/* Cyan map pins — above map layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <path
            id="heatmapPin"
            d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 14 8 14s8-8.75 8-14c0-4.42-3.58-8-8-8z"
            fill="rgb(6,182,212)"
            stroke="rgba(6,182,212,0.7)"
            strokeWidth="1.2"
          />
        </defs>
        <g transform="translate(22, 32) scale(0.35)">
          <use href="#heatmapPin" />
          <circle cx="12" cy="8" r="2.5" fill="#000" />
        </g>
        <g transform="translate(52, 48) scale(0.35)">
          <use href="#heatmapPin" />
          <circle cx="12" cy="8" r="2.5" fill="#000" />
        </g>
        <g transform="translate(68, 28) scale(0.35)">
          <use href="#heatmapPin" />
          <circle cx="12" cy="8" r="2.5" fill="#000" />
        </g>
        <g transform="translate(38, 62) scale(0.35)">
          <use href="#heatmapPin" />
          <circle cx="12" cy="8" r="2.5" fill="#000" />
        </g>
      </svg>

      {/* Top floating navigation — high-transparency glass */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div
          className={`${glassPanel} rounded-2xl flex items-center gap-5 p-2.5 min-w-[600px]`}
        >
          <div className="flex items-center gap-2 pl-3 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-1 max-w-[260px]">
            <input
              type="text"
              placeholder="Search locations, wards..."
              className="bg-transparent border-none outline-none text-white text-sm placeholder-white/50 w-full"
            />
            <svg
              className="w-4 h-4 text-white/60 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/70 text-xs font-medium">Date Range</span>
            <div className="relative">
              <select className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-white text-sm outline-none focus:border-cyan-400/50 min-w-[140px]">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-400/50 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 transition"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="flex flex-col items-start">
              <span className="text-sm font-medium text-white">Refresh Live Data</span>
              <span className="text-[10px] text-white/50 font-normal">
                Last refresh: 15:09:12
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Left floating panel: AI Vision Card — glass */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-80">
        <div className={`${glassPanel} rounded-xl p-4`}>
          <div className="h-40 bg-black/30 rounded-lg relative overflow-hidden border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{ backgroundImage: `url('/api/placeholder/320/160')` }}
            />
            <div className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 border-cyan-400 rounded-tl" />
            <div className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 border-cyan-400 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-12 h-12 border-l-2 border-b-2 border-cyan-400 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-r-2 border-b-2 border-cyan-400 rounded-br" />
          </div>
          <p className="text-cyan-400 text-sm font-medium mt-3">
            🤖 AI Category: Major Pothole (98% Match)
          </p>
          <h4 className="text-white font-semibold text-sm mt-3 mb-2">
            Sarvam AI Transcript
          </h4>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-white/90 text-sm italic">
              यहाँ सड़क पर बहुत बड़ा गड्ढा है, कृपया इसे ठीक करें।
            </p>
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-400/30">
            <p className="text-amber-300 text-sm font-medium">
              Status: In Progress (PWD)
            </p>
          </div>
        </div>
      </div>

      {/* Right floating panel: Map Filters — glass */}
      <div className="absolute right-6 top-24 z-10 w-64">
        <div className={`${glassPanel} rounded-xl p-5`}>
          <h3 className="text-cyan-400 font-semibold mb-4">Map Filters</h3>
          <div className="space-y-4">
            <div>
              <p className="text-white/70 text-xs font-medium mb-2">Issue Type</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  All
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  <span className="w-4 h-4 flex items-center justify-center rounded bg-white/10 text-[10px]">
                    🕳
                  </span>
                  Pothole
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  <span className="w-4 h-4 flex items-center justify-center rounded bg-white/10 text-[10px]">
                    🗑
                  </span>
                  Garbage
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  <span className="w-4 h-4 flex items-center justify-center rounded bg-white/10 text-[10px]">
                    💧
                  </span>
                  Water Leak
                </label>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium mb-2">Status</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  Open
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  In Progress
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white text-sm">
                  <input
                    type="checkbox"
                    className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400/50"
                  />
                  Breached
                </label>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium mb-2">Assigned Dept.</p>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400/50">
                <option>PWD</option>
                <option>UPPCL</option>
                <option>Jal Nigam</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="w-full mt-4 bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 rounded-lg py-2 transition text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Bottom left: Severity Legend — glass */}
      <div className="absolute bottom-6 left-6 z-10">
        <div
          className={`${glassPanel} rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap`}
        >
          <span className="text-white/70 text-sm font-medium">Severity:</span>
          <span className="flex items-center gap-1.5 text-white text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />{" "}
            High (Red)
          </span>
          <span className="flex items-center gap-1.5 text-white text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />{" "}
            Medium (Orange)
          </span>
          <span className="flex items-center gap-1.5 text-white text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />{" "}
            Low (Yellow)
          </span>
        </div>
      </div>

      {/* Bottom right: Map Controls — glass */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <button
          type="button"
          className={`w-10 h-10 rounded-lg ${glassPanel} text-white hover:border-cyan-400/50 hover:text-cyan-400 transition flex items-center justify-center`}
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`w-10 h-10 rounded-lg ${glassPanel} text-white hover:border-cyan-400/50 hover:text-cyan-400 transition flex items-center justify-center`}
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`w-10 h-10 rounded-lg ${glassPanel} text-white hover:border-cyan-400/50 hover:text-cyan-400 transition flex items-center justify-center`}
          aria-label="Layers"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
