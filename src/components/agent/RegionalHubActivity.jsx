import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { ArrowRight } from "lucide-react";

/**
 * RegionalHubActivity – right-side panel showing a regional alert and
 * a live interactive Leaflet map of the agent's coverage area.
 *
 * @param {{
 *   message: string,
 *   mapCenter: [number, number],
 *   mapZoom: number,
 *   onViewTrends: () => void
 * }} props
 */
const RegionalHubActivity = ({ message, mapCenter, mapZoom, onViewTrends }) => (
  <div className="flex flex-col gap-4 rounded-2xl bg-green-50 p-5 shadow-sm">
    {/* Header */}
    <div>
      <h2 className="text-base font-bold text-foreground">
        Regional Hub Activity
      </h2>
      <p className="mt-1 text-sm text-foreground/70 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onViewTrends}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        View Regional Trends <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>

    {/* Map – isolated stacking context keeps Leaflet's z-indices from escaping */}
    <div
      className="overflow-hidden rounded-xl border border-green-100 shadow-sm"
      style={{ height: 200, isolation: "isolate" }}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {/* Coverage area indicator */}
        <CircleMarker
          center={mapCenter}
          radius={20}
          pathOptions={{
            color: "#0FBD3B",
            fillColor: "#0FBD3B",
            fillOpacity: 0.25,
            weight: 2,
          }}
        >
          <Popup>
            <span className="text-xs font-semibold text-foreground">
              Live Coverage Area
            </span>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>

    {/* Live coverage badge */}
    <div className="flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30" />
      <span className="text-xs font-semibold text-foreground">
        Live Coverage Area
      </span>
    </div>
  </div>
);

export default RegionalHubActivity;
