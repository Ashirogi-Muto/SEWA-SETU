// src/components/ReportsMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Report } from '../../../types';

// This is a common fix for a known issue with Leaflet icons in Vite/React
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

interface ReportsMapProps {
  reports?: Report[];
}

// Default map center (New Delhi, India)
const defaultCenter: [number, number] = [28.6139, 77.2090];

export default function ReportsMap({ reports = [] }: ReportsMapProps) {
  return (
    <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={false} style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((report) => (
        <Marker 
          key={report.id} 
          position={[report.location.latitude, report.location.longitude]}
          icon={DefaultIcon}
        >
          <Popup>
            <div className="font-semibold">{report.id}: {report.category}</div>
            <p className="text-xs">{report.description}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}