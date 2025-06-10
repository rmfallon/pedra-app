import React, { useState, useEffect } from "react";
import { useMap } from "../context/MapContext";
import { Search, X, MapPin, Star } from "lucide-react";
import { Location } from "../services/types/location";
import { googlePlacesService } from "../services/sources/google";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    map,
    searchResults,
    setSearchResults,
    selectedLocation,
    setSelectedLocation,
  } = useMap();

  console.log("SearchBar rendering - final working version");

  // Get current map center for searches
  const getCurrentMapCenter = () => {
    if (map) {
      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return { lat: 42.3601, lng: -71.0589 };
  };

  // Real search using Google Places API
  const handleSearch = async (searchQuery: string) => {
    console.log("Search triggered for:", searchQuery);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedLocation(null);
      return;
    }

    setLoading(true);

    try {
      const center = getCurrentMapCenter();
      const results = await googlePlacesService.searchText({
        query: searchQuery,
        lat: center.lat,
        lng: center.lng,
        radius: 5000,
      });

      console.log("Google Places results:", results);
      setSearchResults(results);
      setSelectedLocation(null); // Clear previous selection
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Execute search when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result click
  const handleResultClick = (location: Location, index: number) => {
    console.log(`Clicked result ${index + 1}:`, location.name);
    setSelectedLocation(location);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSelectedLocation(null);
  };

  const searchNearby = async () => {
    console.log("Nearby search triggered");
    setLoading(true);

    try {
      const center = getCurrentMapCenter();
      const results = await googlePlacesService.searchNearby({
        lat: center.lat,
        lng: center.lng,
        radius: 2000,
      });

      console.log("Nearby places results:", results);
      setSearchResults(results);
      setSelectedLocation(null);
      setQuery("Places nearby");
    } catch (error) {
      console.error("Nearby search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Search Input */}
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "2px solid #dadce0",
          overflow: "hidden",
          marginBottom: searchResults.length > 0 ? "10px" : "0",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
          }}
        >
          <Search
            style={{
              height: "20px",
              width: "20px",
              color: "#5f6368",
              marginRight: "12px",
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for places..."
            style={{
              flex: 1,
              padding: "14px 0",
              border: "none",
              outline: "none",
              fontSize: "16px",
              color: "#3c4043",
            }}
          />
          {query && (
            <button
              onClick={clearSearch}
              style={{
                padding: "4px",
                border: "none",
                background: "none",
                cursor: "pointer",
                marginLeft: "8px",
              }}
            >
              <X style={{ height: "16px", width: "16px", color: "#5f6368" }} />
            </button>
          )}
        </div>

        <button
          onClick={searchNearby}
          disabled={loading}
          style={{
            padding: "12px 16px",
            backgroundColor: loading ? "#e8f0fe" : "#1a73e8",
            color: loading ? "#5f6368" : "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <MapPin style={{ height: "16px", width: "16px" }} />
          {loading ? "Loading..." : "Nearby"}
        </button>
      </div>

      {/* Results List */}
      {searchResults.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #dadce0",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e8eaed",
              fontWeight: "500",
              color: "#3c4043",
              fontSize: "16px",
            }}
          >
            {searchResults.length} results
          </div>

          {searchResults.map((location, index) => {
            const isSelected = selectedLocation?.id === location.id;

            return (
              <div
                key={`${location.source}-${location.sourceId}-${index}`}
                onClick={() => handleResultClick(location, index)}
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    index < searchResults.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#e8f0fe" : "white",
                  borderLeft: isSelected
                    ? "4px solid #1a73e8"
                    : "4px solid transparent",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                {/* Number indicator */}
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: isSelected ? "#1a73e8" : "#5f6368",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                    flexShrink: 0,
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {index + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "500",
                      color: "#1a73e8",
                      marginBottom: "4px",
                      fontSize: "16px",
                      lineHeight: "1.3",
                    }}
                  >
                    {location.name}
                  </div>

                  {location.rating && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "4px",
                      }}
                    >
                      <Star
                        style={{
                          width: "14px",
                          height: "14px",
                          fill: "#fbbc04",
                          color: "#fbbc04",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#3c4043",
                          fontWeight: "500",
                        }}
                      >
                        {location.rating.toFixed(1)}
                      </span>
                      {location.totalRatings && (
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#5f6368",
                          }}
                        >
                          ({location.totalRatings})
                        </span>
                      )}
                    </div>
                  )}

                  {location.address && (
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#5f6368",
                        lineHeight: "1.4",
                      }}
                    >
                      {location.address}
                    </div>
                  )}

                  {isSelected && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#1a73e8",
                        fontWeight: "500",
                      }}
                    >
                      ✓ Selected on map
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
