import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomIcon = (status) => {
  const color = status === 'sos' ? '#DC2626' : status === 'warning' ? '#D97706' : '#2563EB';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export default function InteractiveMap({ center = [37.7749, -122.4194], zoom = 14, markers = [], safeZones = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Render Safe Zones (Geofence Circles)
    safeZones.forEach((zone) => {
      const zColor = zone.status === 'inactive' ? '#94A3B8' : '#16A34A';
      const circle = L.circle([zone.lat || 37.7749, zone.lng || -122.4194], {
        color: zColor,
        fillColor: zColor,
        fillOpacity: 0.15,
        radius: zone.radiusM || zone.radiusMeters || 200,
        dashArray: '6, 6',
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #0F172A;">${zone.name}</strong><br/>
          <span style="color: #64748B; font-size: 11px;">Geofence Radius: ${zone.radiusM || 200}m</span>
        </div>
      `);
    });

    // Render Child Status Markers
    markers.forEach((m) => {
      const lat = m.lat || m.coordinates?.lat || 37.7749;
      const lng = m.lng || m.coordinates?.lng || -122.4194;
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(m.status),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #0F172A;">${m.name || 'Child Band'}</strong><br/>
          <span style="color: #2563EB; font-weight: 600; font-size: 11px;">Status: ${(m.status || 'SAFE').toUpperCase()}</span><br/>
          <span style="color: #64748B; font-size: 11px;">Battery: ${m.batteryPct || 90}%</span>
        </div>
      `);
    });

    // Cleanup map on component unmount or center change
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center[0], center[1], zoom, JSON.stringify(markers), JSON.stringify(safeZones)]);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-inner relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
