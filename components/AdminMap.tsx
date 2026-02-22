"use client";

import { Map, Overlay, ZoomControl } from "pigeon-maps";

export default function AdminMap() {
  const cartoDarkProvider = (x: number, y: number, z: number, dpr?: number) => {
    return `https://a.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}${dpr && dpr >= 2 ? '@2x' : ''}.png`;
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative z-0 border border-white/5">
      <Map
        defaultCenter={[28.4744, 77.5040]}
        defaultZoom={12}
        provider={cartoDarkProvider}
        animate={true}
      >
        <ZoomControl style={{ right: 10, top: 10 }} buttonStyle={{ background: '#111827', color: 'white' }} />
        
        {/* High Severity Cluster - Red & Pulsing */}
        <Overlay anchor={[28.4744, 77.5040]} offset={[20, 20]}>
          <div className="w-[40px] h-[40px] bg-red-500/40 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-[15px] h-[15px] bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" />
          </div>
        </Overlay>

        {/* Medium Severity Cluster - Orange */}
        <Overlay anchor={[28.4800, 77.5100]} offset={[15, 15]}>
          <div className="w-[30px] h-[30px] bg-orange-500/40 rounded-full flex items-center justify-center">
            <div className="w-[12px] h-[12px] bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,1)]" />
          </div>
        </Overlay>

        {/* High Severity Pothole - Red */}
        <Overlay anchor={[28.4600, 77.4900]} offset={[15, 15]}>
          <div className="w-[30px] h-[30px] bg-red-500/40 rounded-full flex items-center justify-center">
            <div className="w-[12px] h-[12px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,1)]" />
          </div>
        </Overlay>
      </Map>
    </div>
  );
}