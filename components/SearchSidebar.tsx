import React from "react";
import { useMap } from "../context/MapContext";
import { MapPin, Star, Phone, ExternalLink, Navigation } from "lucide-react";
import { Location } from "../services/types/location";

const SearchSidebar: React.FC = () => {
  const { map, searchResults, selectedLocation, setSelectedLocation } =
    useMap();

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);

    if (map) {
      map.flyTo({
        center: [location.coordinates.lng, location.coordinates.lat],
        zoom: 16,
        duration: 1000,
      });
    }
  };

  const formatTypes = (types?: string[]) => {
    if (!types || types.length === 0) return "";
    return types.slice(0, 2).join(" • ");
  };

  if (searchResults.length === 0) {
    return (
      <div
        style={{
          padding: "32px 16px",
          textAlign: "center",
          color: "#5f6368",
        }}
      >
        <MapPin
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 16px",
            color: "#dadce0",
          }}
        />
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "18px",
            fontWeight: "400",
            color: "#3c4043",
          }}
        >
          Search for places
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          Find restaurants, gas stations, hotels, and more
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Results Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e8eaed",
          backgroundColor: "white",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "500",
            color: "#3c4043",
          }}
        >
          {searchResults.length} results
        </h2>
      </div>

      {/* Results List */}
      <div>
        {searchResults.map((location, index) => {
          const isSelected = selectedLocation?.id === location.id;

          return (
            <div
              key={location.id || index}
              onClick={() => handleLocationClick(location)}
              style={{
                padding: "16px",
                borderBottom: "1px solid #e8eaed",
                cursor: "pointer",
                backgroundColor: isSelected ? "#e8f0fe" : "white",
                transition: "background-color 0.15s ease",
                position: "relative",
                borderLeft: isSelected
                  ? "4px solid #1a73e8"
                  : "4px solid transparent",
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
              {/* Result number indicator */}
              <div
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "16px",
                  width: "20px",
                  height: "20px",
                  backgroundColor: isSelected ? "#1a73e8" : "#5f6368",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div style={{ marginLeft: "32px" }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: "#1a73e8",
                    lineHeight: "20px",
                  }}
                >
                  {location.name}
                </h3>

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
                      marginBottom: "8px",
                    }}
                  >
                    {location.address}
                  </div>
                )}

                {isSelected && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#1a73e8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      Directions
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchSidebar;
