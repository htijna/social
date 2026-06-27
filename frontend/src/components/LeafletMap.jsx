import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import leaflet styles and override markers to prevent the Vite bundle bug
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper component to capture map clicks and update state
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Helper component to recenter map when lat/lng change dynamically
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function LeafletMap({ 
  lat = 20.5937, 
  lng = 78.9629, 
  zoom = 13, 
  interactive = false, 
  onLocationSelect 
}) {
  
  const handleMapClick = (selectedLat, selectedLng) => {
    if (interactive && onLocationSelect) {
      onLocationSelect(
        parseFloat(selectedLat.toFixed(6)), 
        parseFloat(selectedLng.toFixed(6))
      );
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 relative z-10">
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(lat && lng) && (
          <Marker position={[lat, lng]}>
            {interactive && (
              <svg className="hidden">
                {/* Visual marker element */}
              </svg>
            )}
          </Marker>
        )}
        {interactive && <MapClickHandler onClick={handleMapClick} />}
        <MapRecenter lat={lat} lng={lng} />
      </MapContainer>
      {interactive && (
        <div className="absolute bottom-2 right-2 z-[1000] bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Click map to pin coordinates
        </div>
      )}
    </div>
  );
}
