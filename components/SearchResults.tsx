// components/SearchResults.tsx - Fixed for your Location interface

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  Star,
  DollarSign,
  Navigation,
  X,
} from "lucide-react";
import { Location } from "../services/types/location";
import PlaceDetails from "./PlaceDetails";
import { useMap } from "../context/MapContext";

interface SearchResultsProps {
  results: Location[];
  loading: boolean;
  onClear: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  onClear,
}) => {
  const { map, selectedLocation, setSelectedLocation } = useMap();
  const [showDetails, setShowDetails] = useState(false);

  const handleLocationClick = (location: Location) => {
    // Set this location as selected
    setSelectedLocation(location);

    // Fly to the location using Mapbox flyTo method
    if (map) {
      map.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 16,
        duration: 1000,
      });
    }
  };

  const handleShowDetails = (location: Location) => {
    setSelectedLocation(location);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="absolute top-20 left-4 w-96 bg-white rounded-lg shadow-lg p-4 max-h-[calc(100vh-120px)] overflow-y-auto z-10">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <div className="absolute top-20 left-4 w-96 bg-white rounded-lg shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            {results.length} Results Found
          </h3>
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear results"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {results.map((location, index) => {
            const isSelected = selectedLocation?.id === location.id;
            // Use a combination of id and index to ensure uniqueness
            const uniqueKey = location.id || `location-${index}`;

            return (
              <div
                key={uniqueKey}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 flex-1 pr-2">
                    {location.name}
                  </h4>
                  {location.rating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{location.rating.toFixed(1)}</span>
                      {location.totalRatings && (
                        <span className="ml-1 text-gray-400">
                          ({location.totalRatings})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {location.address || "No address available"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    {location.priceLevel && (
                      <span className="text-gray-600">
                        {"$".repeat(location.priceLevel)}
                      </span>
                    )}

                    {/* Show place types instead of isOpen since that's not in your interface */}
                    {location.types && location.types.length > 0 && (
                      <span className="text-gray-500 text-xs">
                        {location.types.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(location);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Details
                  </button>
                </div>

                {/* Visual indicator for selected item */}
                {isSelected && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Selected on map
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showDetails && selectedLocation && (
        <PlaceDetails
          place={selectedLocation}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default SearchResults;
