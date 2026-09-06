import { useState } from "react";
import { Check, Copy, ExternalLink, MapPin } from "lucide-react";

export type LocationPoint = {
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
  capturedAt?: string | null;
};

export function LocationMapLink({ label, location }: { label: string; location: LocationPoint }) {
  const [copied, setCopied] = useState(false);
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;

  async function copyCoordinates() {
    try {
      await navigator.clipboard.writeText(coordinates);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return <div className="portal-location">
    <div className="portal-location__heading"><MapPin className="h-4 w-4" /><div><b>{label}</b><span>Exact saved GPS point{location.capturedAt ? ` · ${new Date(location.capturedAt).toLocaleString()}` : ""}</span></div></div>
    <code>{coordinates}</code>
    <div className="portal-location__actions">
      <a href={mapUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps</a>
      <button type="button" onClick={() => void copyCoordinates()}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy coordinates"}</button>
    </div>
    <small>GPS accuracy: {location.accuracyM != null ? `±${Math.round(Number(location.accuracyM))}m` : "not available"}. This is a one-time saved point, not continuous tracking.</small>
  </div>;
}