import React, { useState, useEffect } from "react";
import { useMap } from "../context/MapContext";
import { Search, X, MapPin } from "lucide-react";
import { Location } from "../services/types/location";
import { googlePlacesService } from "../services/sources/google";

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { map, searchResults, setSearchResults, setSelectedLocation } =
    useMap();

  console.log("SearchBar rendering - sidebar optimized");

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
      setSelectedLocation(null);
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
      "pizza",
      "sushi",
      "mexican food",
      "italian food",
      "breakfast",
      "lunch",
    ];

    return commonSearches
      .filter((term) => term.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 6);
  };

  // Handle input change with suggestions
  const handleInputChange = (value: string) => {
    setQuery(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 1 && newSuggestions.length > 0);
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

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedLocation(null);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const searchNearby = async () => {
    console.log("Nearby search triggered");
    setLoading(true);
    setShowSuggestions(false);

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
      {/* Main Search Input */}
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #dadce0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          transition: "box-shadow 0.2s ease",
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
              height: "18px",
              width: "18px",
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
            }}
            placeholder="Search maps..."
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              outline: "none",
              fontSize: "16px",
              color: "#3c4043",
              backgroundColor: "transparent",
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
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
            padding: "8px 12px",
            backgroundColor: loading ? "#f8f9fa" : "#1a73e8",
            color: loading ? "#5f6368" : "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
          }}
        >
          <MapPin style={{ height: "14px", width: "14px" }} />
          <span className="hidden sm:inline">{loading ? "..." : "Nearby"}</span>
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
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                borderBottom:
                  index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
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
                  height: "14px",
                  width: "14px",
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

      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            padding: "12px 16px",
            border: "1px solid #dadce0",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#5f6368",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #f3f3f3",
              borderTop: "2px solid #1a73e8",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          Searching...
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
