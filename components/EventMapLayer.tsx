import React, { useEffect, useState } from "react";
import { useMap } from "../context/MapContext";
import { format } from "date-fns";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import EventDetails from "./EventDetails";

interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  imageUrl?: string;
  organizer?: string;
  // ... other fields
}

interface EventMapLayerProps {
  visible: boolean;
}

const EventMapLayer: React.FC<EventMapLayerProps> = ({ visible }) => {
  const { map } = useMap();
  const [events, setEvents] = useState<Event[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Check if map is ready with valid coordinates
  useEffect(() => {
    if (!map) {
      setIsMapReady(false);
      return;
    }

    // Wait for map to be fully loaded
    if (map.loaded()) {
      setIsMapReady(true);
    } else {
      map.once("load", () => {
        setIsMapReady(true);
      });
    }
  }, [map]);

  useEffect(() => {
    async function fetchEvents() {
      if (!map || !isMapReady) return;

      const center = map.getCenter();

      // Safety check for valid coordinates
      if (!center || (center.lat === 0 && center.lng === 0)) {
        console.log("Waiting for valid map coordinates...");
        return;
      }

      try {
        // Fetch events based on current map view
        const response = await fetch(
          `/api/events?lat=${center.lat}&lng=${center.lng}&radius=10000`,
        );

        // Check if the response is OK before attempting to parse JSON
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Server responded with ${response.status}: ${errorText.substring(0, 100)}...`,
          );
        }

        const data = await response.json();

        // Check if data has the expected structure
        if (data?.events && Array.isArray(data.events)) {
          setEvents(data.events);
        } else if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.warn("Unexpected data format from API:", data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    }

    if (visible && isMapReady) {
      fetchEvents();

      // Add event listener for map movement to fetch new events
      const handleMoveEnd = () => {
        fetchEvents();
      };

      map.on("moveend", handleMoveEnd);

      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }
  }, [visible, map, isMapReady]);

  useEffect(() => {
    if (!map || !visible || !isMapReady) return;

    // Clear any existing events layer
    if (map.getLayer("events-layer")) {
      map.removeLayer("events-layer");
    }
    if (map.getSource("events-source")) {
      map.removeSource("events-source");
    }

    // Add events as a new layer
    if (events.length > 0 && map.isStyleLoaded()) {
      // Create GeoJSON for event markers
      const geojson = {
        type: "FeatureCollection",
        features: events.map((event) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [event.coordinates.lng, event.coordinates.lat],
          },
          properties: {
            ...event,
          },
        })),
      };

      // Add source
      map.addSource("events-source", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add layer for clusters
      map.addLayer({
        id: "event-clusters",
        type: "circle",
        source: "events-source",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#f97316", // Orange
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
          "circle-opacity": 0.8,
        },
      });

      // Add layer for individual events
      map.addLayer({
        id: "events-layer",
        type: "circle",
        source: "events-source",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#f97316", // Orange
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Add click handler for event markers
      map.on("click", "events-layer", (e) => {
        if (e.features && e.features[0]) {
          const event = e.features[0].properties as Event;

          // Create popup
          const popupNode = document.createElement("div");
          const root = createRoot(popupNode);

          root.render(
            <EventDetails event={event} onClose={() => popup.remove()} />,
          );

          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 25,
          })
            .setLngLat([event.coordinates.lng, event.coordinates.lat])
            .setDOMContent(popupNode)
            .addTo(map);
        }
      });

      // Change cursor on hover
      map.on("mouseenter", "events-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "events-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [events, map, visible, isMapReady]);

  return null;
};

export default EventMapLayer;
