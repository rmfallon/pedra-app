// components/SavedLocations.tsx
import React, { useEffect, useState } from "react";
import { useMap } from "../context/MapContext";
import { supabase } from "../lib/supabaseClient";
import mapboxgl from "mapbox-gl";

interface SavedLocation {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  additional_data?: {
    website?: string;
    phone?: string;
    rating?: number;
  };
}

const SavedLocations: React.FC = () => {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const { map } = useMap();
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    fetchSavedLocations();
  }, []);

  const fetchSavedLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("pois")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching saved locations:", error);
    }
  };

  const handleLocationClick = (location: SavedLocation) => {
    if (map) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create new marker
      const marker = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      // Store marker reference
      markerRef.current = marker;

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">${location.name}</h3>
          <p class="text-sm">${location.description}</p>
          ${
            location.additional_data?.website
              ? `<a href="${location.additional_data.website}" target="_blank" class="text-blue-600 hover:underline text-sm">Visit Website</a>`
              : ""
          }
        </div>
      `;

      // Add popup to marker
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      marker.setPopup(popup).togglePopup();

      // Fly to location
      map.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 16,
        essential: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this saved location?")) {
      try {
        const { error } = await supabase.from("pois").delete().eq("id", id);

        if (error) throw error;
        await fetchSavedLocations();
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  if (locations.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No saved locations yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {locations.map((location) => (
        <div
          key={location.id}
          className="bg-white rounded-lg shadow p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div
              className="cursor-pointer flex-1"
              onClick={() => handleLocationClick(location)}
            >
              <h3 className="font-semibold">{location.name}</h3>
              <p className="text-sm text-gray-600">{location.description}</p>
            </div>
            <button
              onClick={() => handleDelete(location.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete location"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedLocations;
