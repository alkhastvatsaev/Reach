
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom Driver Icon
const DriverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: `
    <div style="
      background: #007AFF; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Component to handle map center updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export default function TrackingMap({ status, clientCoords }: { status: string, clientCoords?: {lat: number, lng: number} }) {
  // Strasbourg default fallback
  const strasbourgCenter: [number, number] = [48.5734, 7.7521];
  
  // Real coordinates from job if available
  const initialPos: [number, number] = clientCoords 
    ? [clientCoords.lat, clientCoords.lng] 
    : strasbourgCenter;

  const [driverPos, setDriverPos] = useState<[number, number]>(strasbourgCenter);
  const [clientPos, setClientPos] = useState<[number, number]>(initialPos);

  // Update position if clientCoords arrive late (API delay)
  useEffect(() => {
    if (clientCoords) {
      setClientPos([clientCoords.lat, clientCoords.lng]);
    }
  }, [clientCoords]);

  useEffect(() => {
    if (status === 'taken' || status === 'delivering') {
      // Small simulated movement for demo
      const interval = setInterval(() => {
        setDriverPos(prev => [
          prev[0] + (Math.random() - 0.5) * 0.001,
          prev[1] + (Math.random() - 0.5) * 0.001
        ]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={clientPos} 
        zoom={14} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#f5f5f7' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="map-tiles"
        />
        
        <ChangeView center={driverPos} />

        {/* Client Position */}
        <Marker position={clientPos} icon={DefaultIcon}>
          <Popup>Votre destination</Popup>
        </Marker>

        {/* Driver Position (Visible if assigned) */}
        {status !== 'open' && (
          <Marker position={driverPos} icon={DriverIcon}>
            <Popup>Votre livreur est ici</Popup>
          </Marker>
        )}
      </MapContainer>

      <style jsx global>{`
        .map-tiles {
          filter: saturate(1.1) brightness(1.02); /* Softer, natural modern feel */
        }
        .leaflet-container {
          background: #f5f5f7 !important;
        }
        .custom-driver-icon {
          transition: all 5s linear !important;
        }
      `}</style>
    </div>
  );
}
