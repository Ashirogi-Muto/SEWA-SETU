"use client";

interface LocationMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function LocationMap(_props: LocationMapProps) {
  return (
    <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
      Map Area
    </div>
  );
}
