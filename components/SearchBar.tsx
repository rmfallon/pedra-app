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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    map,
    searchResults,
    setSearchResults,
    selectedLocation,
    setSelectedLocation,
  } = useMap();

  console.log("SearchBar rendering with SearchResults integration");

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
    } finally {
      setLoading(false);
    }
  };

  // Generate search suggestions
  const generateSuggestions = (input: string) => {
    if (!input.trim()) return [];

    const commonSearches = [
      "coffee shops",
      "restaurants",
      "gas stations",
      "pharmacies",
      "grocery stores",
      "banks",
      "hotels",
      "parks",
      "museums",
      "bars",
      "gyms",
      "hospitals",
    ];

    return commonSearches
      .filter((term) => term.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 5);
  };

  // Handle input change with suggestions
  const handleInputChange = (value: string) => {
    setQuery(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 0 && newSuggestions.length > 0);
  };

  // Execute search when user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Real nearby search using Google Places API
  const searchNearby = async () => {
    console.log("Nearby search triggered");
    setLoading(true);
    setShowSuggestions(false);
    setShowResults(true);

    try {
      const center = getCurrentMapCenter();

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

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setShowResults(false);
    setSelectedLocation(null);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={searchRef} style={{ position: "relative", width: "100%" }}>
        {/* Main Search Input */}
        <div
          style={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "2px solid #dadce0",
            overflow: "hidden",
            transition: "border-color 0.2s ease",
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
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
                if (searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
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
                <X
                  style={{ height: "16px", width: "16px", color: "#5f6368" }}
                />
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

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #dadce0",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              marginTop: "-1px",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom:
                    index < suggestions.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <Search
                  style={{
                    height: "16px",
                    width: "16px",
                    color: "#5f6368",
                    marginRight: "12px",
                  }}
                />
                <span
                  style={{
                    color: "#3c4043",
                    fontSize: "14px",
                  }}
                >
                  {suggestion}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Show SearchResults component when we have results */}
      {showResults && (
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
