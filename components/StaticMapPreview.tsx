'use client'

interface StaticMapPreviewProps {
  lat: number
  lng: number
  onRelocate: () => void
}

export default function StaticMapPreview({ lat, lng, onRelocate }: StaticMapPreviewProps) {
  // Using OpenStreetMap static tile API  
  const zoom = 15
  const width = 600
  const height = 300
  
  // OpenStreetMap static map tile (center tile)
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom))
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
  
  return (
    <div className="relative h-[300px] w-full rounded-lg overflow-hidden shadow-lg bg-muted">
      {/* Static map using OpenStreetMap tiles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-6xl">📍</div>
          <div className="text-sm font-medium">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </div>
          <button
            type="button"
            onClick={onRelocate}
            className="text-xs text-primary hover:underline"
          >
            📍 Click to update location
          </button>
        </div>
      </div>
      
      {/* Map background visualization */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${x}/${y}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Marker indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
      </div>
    </div>
  )
}
