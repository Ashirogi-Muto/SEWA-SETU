// src/components/ReportsMap.tsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Report } from '../../../types';
import { Map as MapIcon, Flame } from 'lucide-react';

// Leaflet icon fix for Vite/React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Heatmap layer component using leaflet.heat
const HeatmapLayer = ({ points }: { points: [number, number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heat = (L as any).heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.1: '#2563eb',
        0.3: '#7c3aed',
        0.5: '#f59e0b',
        0.7: '#f97316',
        0.9: '#ef4444',
        1.0: '#dc2626',
      },
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

interface ReportsMapProps {
  reports?: Report[];
}

// Default map center (New Delhi, India)
const defaultCenter: [number, number] = [28.6139, 77.2090];

export default function ReportsMap({ reports = [] }: ReportsMapProps) {
  const [mapView, setMapView] = useState<'pins' | 'heatmap'>('pins');

  const reportsWithCoords = reports.filter(
    (r) => r.location?.latitude && r.location?.longitude
  );

  const heatPoints: [number, number, number][] = reportsWithCoords.map((r) => [
    r.location.latitude,
    r.location.longitude,
    1.0,
  ]);

  const center: [number, number] =
    reportsWithCoords.length > 0
      ? [reportsWithCoords[0].location.latitude, reportsWithCoords[0].location.longitude]
      : defaultCenter;

  return (
    <div>
      {/* Toggle Buttons */}
      <div className="flex items-center gap-2 mb-3">
        <div className="inline-flex items-center rounded-lg bg-muted p-1">
          <button
            onClick={() => setMapView('pins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${mapView === 'pins'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Pin Map
          </button>
          <button
            onClick={() => setMapView('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${mapView === 'heatmap'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heatmap
          </button>
        </div>
        {mapView === 'heatmap' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div
              className="w-12 h-2 rounded"
              style={{
                background:
                  'linear-gradient(to right, #2563eb, #7c3aed, #f59e0b, #ef4444, #dc2626)',
              }}
            />
            <span>Low → High</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapView === 'pins'
          ? reportsWithCoords.map((report) => (
            <Marker
              key={report.id}
              position={[report.location.latitude, report.location.longitude]}
              icon={DefaultIcon}
            >
              <Popup>
                <div className="font-semibold">
                  {report.id}: {report.category}
                </div>
                <p className="text-xs">{report.description}</p>
              </Popup>
            </Marker>
          ))
          : heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}
      </MapContainer>
    </div >
  );
}