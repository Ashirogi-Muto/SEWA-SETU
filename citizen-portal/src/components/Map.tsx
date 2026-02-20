import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchAllReports } from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from 'lucide-react';
import type { Report } from '@/types';

// Default map center from your admin_map.html
const DEFAULT_CENTER: [number, number] = [28.4744, 77.5041];
const DEFAULT_ZOOM = 12;

const ReportsMap = () => {
  // Use React Query to fetch all reports for the map
  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ['allReports'], // A unique key for this public data
    queryFn: fetchAllReports,
  });

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-muted">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Could not load map data</h3>
        <p className="text-muted-foreground">Please ensure the backend server is running.</p>
      </div>
    );
  }

  return (
    <MapContainer 
        center={DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports?.map((report: Report) => (
        <Marker key={report.id} position={[report.latitude, report.longitude]}>
          <Popup>
            <div className="font-sans">
              <div className="font-bold text-base mb-1 border-b pb-1">{report.category || 'Report'}</div>
              <p><strong>Status:</strong> {report.status}</p>
              <p><strong>Description:</strong> {report.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ReportsMap;