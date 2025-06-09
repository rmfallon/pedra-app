// /components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useMap } from "../context/MapContext";

interface POI {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

const Sidebar: React.FC = () => {
  const [pois, setPois] = useState<POI[]>([]);
  const { map } = useMap();

  useEffect(() => {
    // Fetch saved POIs from Supabase on component mount
    const fetchPOIs = async () => {
      const { data, error } = await supabase.from<POI>("pois").select("*");
      if (error) {
        console.error("Error fetching POIs:", error);
      } else {
        setPois(data || []);
      }
    };

    fetchPOIs();
  }, []);

  const handlePOIClick = (poi: POI) => {
    if (map) {
      map.flyTo({ center: [poi.longitude, poi.latitude], zoom: 12 });
    }
  };

  const handleCheckIn = (poi: POI) => {
    // Stub for check-in functionality
    console.log(`Checked in at ${poi.name}`);
    // Optionally, add API call to record the check-in.
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Saved Locations</h2>
      <ul>
        {pois.map((poi) => (
          <li
            key={poi.id}
            className="mb-2 p-2 bg-white rounded shadow cursor-pointer"
            onClick={() => handlePOIClick(poi)}
          >
            <h3 className="font-semibold">{poi.name}</h3>
            {poi.description && <p className="text-sm">{poi.description}</p>}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCheckIn(poi);
              }}
              className="mt-2 bg-purple-500 text-white px-2 py-1 rounded"
            >
              Check In
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
