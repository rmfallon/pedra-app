// /context/MapContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import mapboxgl from "mapbox-gl";
import { Location } from "../services/types/location";

interface MapContextType {
  map: mapboxgl.Map | null;
  setMap: (map: mapboxgl.Map | null) => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  searchResults: Location[];
  setSearchResults: (results: Location[]) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  
  return (
    <MapContext.Provider value={{ 
      map, 
      setMap, 
      selectedLocation, 
      setSelectedLocation,
      searchResults,
      setSearchResults
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
