import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Crosshair, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default center (can be customized based on your city)
const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090]; // Delhi coordinates
const DEFAULT_ZOOM = 13;

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number];
  className?: string;
}

// Component to handle map clicks
function LocationMarker({ position, onLocationSelect }: { 
  position: [number, number] | null; 
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialPosition,
  className = ""
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Refs to prevent unnecessary re-renders and duplicate requests
  const hasAutoTriedLocation = useRef(false);
  const isRequestingLocation = useRef(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    const newPosition: [number, number] = [lat, lng];
    setPosition(newPosition);
    onLocationSelect(lat, lng);
    
    // Clear any existing error when location is successfully selected
    if (locationError) {
      setLocationError(null);
      // Clear error timeout if it exists
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    }
  }, [onLocationSelect, locationError]);

  const getCurrentLocation = useCallback(() => {
    // Prevent multiple simultaneous requests
    if (isRequestingLocation.current || isLoadingLocation) {
      return;
    }

    if (!navigator.geolocation) {
      const error = "Geolocation is not supported by this browser.";
      setLocationError(error);
      toast({
        title: "Geolocation Not Supported",
        description: error,
        variant: "destructive",
      });
      return;
    }

    isRequestingLocation.current = true;
    setIsLoadingLocation(true);
    setLocationError(null);
    
    // Clear any existing error timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
        setIsLoadingLocation(false);
        isRequestingLocation.current = false;
        toast({
          title: "Location Obtained",
          description: "Your current location has been set on the map.",
        });
      },
      (error) => {
        setIsLoadingLocation(false);
        isRequestingLocation.current = false;
        
        let errorMessage = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        setLocationError(errorMessage);
        
        // Set a timeout to clear the error after 10 seconds to prevent permanent jittering
        errorTimeoutRef.current = setTimeout(() => {
          setLocationError(null);
          errorTimeoutRef.current = null;
        }, 10000);
        
        toast({
          title: "Location Error",
          description: errorMessage + " You can click on the map to set location manually.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000 // 5 minutes cache
      }
    );
  }, [handleLocationSelect, toast, isLoadingLocation]);

  // Auto-get location on component mount if no initial position (only once)
  useEffect(() => {
    if (!initialPosition && !position && !hasAutoTriedLocation.current) {
      hasAutoTriedLocation.current = true;
      // Small delay to prevent immediate execution during render
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array to run only once
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Select Report Location</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation || isRequestingLocation.current}
            className="flex items-center gap-2 min-w-[140px]"
          >
            <Crosshair className={`h-4 w-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
            {isLoadingLocation ? "Getting Location..." : "Use My Location"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <MapContainer 
            center={position || DEFAULT_CENTER} 
            zoom={DEFAULT_ZOOM} 
            style={{ height: '300px', width: '100%' }}
            key={position ? `${position[0]}-${position[1]}` : 'default'}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker 
              position={position} 
              onLocationSelect={handleLocationSelect}
            />
          </MapContainer>
          
          {/* Overlay instructions */}
          <div className="absolute top-2 left-2 right-2 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4" />
                {position ? 
                  `Location selected: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}` :
                  "Click on the map to select the issue location"
                }
              </div>
            </div>
          </div>

          {/* Error state - only show if there's an error and we're not currently loading */}
          {locationError && !isLoadingLocation && (
            <div className="absolute bottom-2 left-2 right-2 z-[1000]">
              <div className="bg-red-50 border border-red-200 rounded-md p-2 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{locationError}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Location details */}
        <div className="p-4 border-t bg-gray-50/50">
          <div className="text-sm text-muted-foreground">
            {position ? (
              <div className="space-y-1">
                <div><strong>Latitude:</strong> {position[0].toFixed(6)}</div>
                <div><strong>Longitude:</strong> {position[1].toFixed(6)}</div>
                <div className="text-xs text-green-600 mt-2">
                  ✓ Location set. You can click elsewhere on the map to change it.
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <div>No location selected yet.</div>
                <div className="text-xs mt-1">Use "Use My Location" button or click on the map.</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;