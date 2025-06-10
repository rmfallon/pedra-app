import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMap } from "../context/MapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapProps {
  showEvents?: boolean;
}

const Map: React.FC<MapProps> = ({ showEvents = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [hasAutoFitted, setHasAutoFitted] = useState(false);
  const { map, setMap, searchResults, selectedLocation, setSelectedLocation } =
    useMap();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    console.log("Creating map instance...");

    const mapInstance = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-71.0589, 42.3601], // Boston coordinates
      zoom: 12,
    });

    mapRef.current = mapInstance;

    mapInstance.on("load", () => {
      console.log("Map loaded successfully!");
      setMap(mapInstance);

      // Add user location control
      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right",
      );

      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");
    });

    mapInstance.on("error", (e) => {
      console.error("Map error:", e);
    });

    return () => {
      console.log("Cleaning up map...");
      if (mapRef.current) {
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [setMap]);

  // Handle search results markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!searchResults.length) {
      setHasAutoFitted(false);
      return;
    }

    console.log("Adding markers for search results:", searchResults);

    // Add new markers for search results
    const newMarkers = searchResults.map((location, index) => {
      // Create custom marker element
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${selectedLocation?.id === location.id ? "#1a73e8" : "#3B82F6"};
        border: 2px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: background-color 0.2s ease;
      `;
      markerElement.textContent = (index + 1).toString();

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(map);

      // Add click handler for marker
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log(`Marker ${index + 1} clicked:`, location.name);

        // Set selected location
        setSelectedLocation(location);

        // Create popup with location info
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setLngLat([location.coordinates.lng, location.coordinates.lat])
          .setHTML(
            `
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${location.name}</h3>
              ${location.rating ? `<p style="font-size: 12px; color: #666; margin: 0;">★ ${location.rating}</p>` : ""}
              ${location.address ? `<p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">${location.address}</p>` : ""}
            </div>
          `,
          )
          .addTo(map);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Only auto-fit when new search results arrive (not on selection change)
    if (!hasAutoFitted && searchResults.length > 0) {
      console.log("Auto-fitting map to show all results");
      const bounds = new mapboxgl.LngLatBounds();
      searchResults.forEach((location) => {
        bounds.extend([location.coordinates.lng, location.coordinates.lat]);
      });

      map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 15,
        duration: 1000,
      });

      setHasAutoFitted(true);
    }
  }, [
    map,
    searchResults,
    selectedLocation,
    hasAutoFitted,
    setSelectedLocation,
  ]);

  // Handle selected location - only fly if user explicitly selected something
  useEffect(() => {
    if (!map || !selectedLocation) return;

    console.log("Flying to selected location:", selectedLocation.name);

    // Fly to selected location with higher zoom
    map.flyTo({
      center: [
        selectedLocation.coordinates.lng,
        selectedLocation.coordinates.lat,
      ],
      zoom: 16,
      duration: 1000,
    });
  }, [map, selectedLocation]);

  // Reset auto-fit when search results change
  useEffect(() => {
    setHasAutoFitted(false);
  }, [searchResults]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
      }}
      className="relative"
    />
  );
};

export default Map;
