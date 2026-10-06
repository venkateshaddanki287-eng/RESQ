"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSyncExternalStore } from "react";

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const markerIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export function ResQMap({ points }: { points: Array<{ id: string; label: string; lat: number; lng: number; color: string }> }) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot
  );

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl border border-[#2B2E31] bg-[#111315]">
      {mounted ? (
        <MapContainer center={[17.385044, 78.486671]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={markerIcon(point.color)}
            >
              <Popup>{point.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.18em] text-[#7E858B]">
          Loading live map…
        </div>
      )}
    </div>
  );
}
