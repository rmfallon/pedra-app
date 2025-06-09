import React, { useState, useEffect, useRef } from "react";
import { useMap } from "../context/MapContext";
import SearchResults from "./SearchResults";
import { Search, X, MapPin } from "lucide-react";
import { Location } from "../services/types/location";

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

  console.log("SearchBar rendering with inline styles");

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const mockResults: Location[] = [
        {
          id: "mock-1",
          name: `Thinking Cup (${searchQuery})`,
          description: "Popular coffee shop",
          coordinates: { lat: 42.3601, lng: -71.0589 },
          address: "85 Newbury St, Boston, MA",
          rating: 4.5,
          totalRatings: 127,
          source: "google" as const,
          sourceId: "mock-1",
          lastUpdated: new Date(),
          types: ["cafe"],
          priceLevel: 2,
        },
      ];

      setSearchResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const clearSearch = () => {
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
              placeholder="Search for places..."
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
            onClick={() => handleSearch("nearby")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MapPin style={{ height: "16px", width: "16px" }} />
            Nearby
          </button>
        </div>
      </div>

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
