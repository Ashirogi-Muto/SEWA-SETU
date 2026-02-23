"use client";
import { MapPin } from "lucide-react";

export default function FieldMap() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-[#050A14] text-gray-900 dark:text-white pb-32 relative shadow-2xl overflow-hidden transition-colors duration-300">
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4 rounded-b-2xl shadow-sm">
        <h1 className="font-bold text-lg">Nearby Tasks</h1>
      </header>
      <div className="relative w-full h-[calc(100vh-8rem)] bg-[#0f172a] mt-4 rounded-[1.5rem] mx-2 max-w-[calc(100%-1rem)] overflow-hidden border border-white/10">
        {/* Fake Map Grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        {/* Mock Pins */}
        <div className="absolute top-1/4 left-1/4 animate-bounce"><MapPin size={32} className="text-red-500 fill-red-500/20" /></div>
        <div className="absolute top-1/2 right-1/3 text-yellow-500"><MapPin size={32} className="fill-yellow-500/20" /></div>
        <div className="absolute bottom-1/3 left-1/2 text-orange-500"><MapPin size={32} className="fill-orange-500/20" /></div>
      </div>
    </div>
  );
}
