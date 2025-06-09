import React, { useState, useEffect, useRef } from "react";
import { useMap } from "../context/MapContext";
import SearchResults from "./SearchResults";
import { Search, X, MapPin } from "lucide-react";
import { Location } from "../services/types/location";
import { googlePlacesService } from "../services/sources/google";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    map,
    searchResults,
    setSearchResults,
    selectedLocation,
    setSelectedLocation,
  } = useMap();

  console.log("SearchBar rendering with Google Places API");

  // Get current map center for searches
  const getCurrentMapCenter = () => {
    if (map) {
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return { lat: 42.3601, lng: -71.0589 }; // Default to Boston
  };

  // Real search using Google Places API
  const handleSearch = async (searchQuery: string) => {
    console.log("Search triggered for:", searchQuery);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const center = getCurrentMapCenter();

      // Use your existing Google Places service
      const results = await googlePlacesService.searchText({
        query: searchQuery,
        lat: center.lat,
        lng: center.lng,
        radius: 5000, // 5km radius
      });

      console.log("Google Places results:", results);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);

      // Show user-friendly error
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Real nearby search using Google Places API
  const searchNearby = async () => {
    console.log("Nearby search triggered");
    setLoading(true);
    setShowResults(true);

    try {
      const center = getCurrentMapCenter();

      // Use your existing Google Places nearby search
      const results = await googlePlacesService.searchNearby({
        lat: center.lat,
        lng: center.lng,
        radius: 2000, // 2km radius for nearby
      });

      console.log("Nearby places results:", results);
      setSearchResults(results);
      setQuery("Places nearby");
    } catch (error) {
      console.error("Nearby search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = () => {
    console.log("Clearing search");
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedLocation(null);
  };

  return (
    <>
      <div ref={searchRef} style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "2px solid #3B82F6",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Search
              style={{
                height: "20px",
                width: "20px",
                color: "#666",
                marginLeft: "12px",
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder="Search for restaurants, shops, attractions..."
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                outline: "none",
                fontSize: "16px",
                borderRadius: "8px",
              }}
            />
            {query && (
              <button
                onClick={clearSearch}
                style={{
                  padding: "8px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                <X style={{ height: "16px", width: "16px", color: "#666" }} />
              </button>
            )}
          </div>

          <button
            onClick={searchNearby}
            disabled={loading}
            style={{
              padding: "12px 16px",
              backgroundColor: loading ? "#93C5FD" : "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "0 8px 8px 0",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin style={{ height: "16px", width: "16px" }} />
            {loading ? "Loading..." : "Nearby"}
          </button>
        </div>
      </div>

      {/* Show SearchResults component when we have results or are loading */}
      {showResults && (searchResults.length > 0 || loading) && (
        <SearchResults
          results={searchResults}
          loading={loading}
          onClear={clearSearch}
        />
      )}
    </>
  );
};

export default SearchBar;
