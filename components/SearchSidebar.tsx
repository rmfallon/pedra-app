import React from "react";
import { useMap } from "../context/MapContext";
import {
  MapPin,
  Star,
  Phone,
  ExternalLink,
  Navigation,
  Clock,
} from "lucide-react";
import { Location } from "../services/types/location";

const SearchSidebar: React.FC = () => {
  const { map, searchResults, selectedLocation, setSelectedLocation } =
    useMap();

  const handleLocationClick = (location: Location, index: number) => {
    console.log(`Sidebar: Selected ${location.name}`);
    setSelectedLocation(location);
  };

  const formatDistance = (location: Location) => {
    // In a real app, calculate from user's location
    return "0.3 mi";
  };

  const formatTypes = (types?: string[]) => {
    if (!types || types.length === 0) return "";
    return types.slice(0, 2).join(" • ");
  };

  const getPriceDisplay = (priceLevel?: number) => {
    if (!priceLevel) return "";
    return "$$".repeat(priceLevel);
  };

  if (searchResults.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
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
          Find restaurants, gas stations, hotels, and more around Boston
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Results Header */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "white",
          borderBottom: "1px solid #e8eaed",
          position: "sticky",
          top: 0,
          zIndex: 10,
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
          {searchResults.length} places
        </h2>
      </div>

      {/* Results List */}
      <div style={{ backgroundColor: "#fafafa" }}>
        {searchResults.map((location, index) => {
          const isSelected = selectedLocation?.id === location.id;

          return (
            <div
              key={`${location.source}-${location.sourceId}-${index}`}
              onClick={() => handleLocationClick(location, index)}
              style={{
                backgroundColor: "white",
                margin: "8px",
                borderRadius: "8px",
                padding: "16px",
                cursor: "pointer",
                border: isSelected ? "2px solid #1a73e8" : "1px solid #e8eaed",
                boxShadow: isSelected
                  ? "0 2px 8px rgba(26, 115, 232, 0.2)"
                  : "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }
              }}
            >
              {/* Result number badge */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "24px",
                  height: "24px",
                  backgroundColor: isSelected ? "#1a73e8" : "#5f6368",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {index + 1}
              </div>

              {/* Main content */}
              <div style={{ paddingRight: "32px" }}>
                {/* Name and rating row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "6px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#1a73e8",
                      lineHeight: "20px",
                      flex: 1,
                    }}
                  >
                    {location.name}
                  </h3>
                </div>

                {/* Rating and price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {location.rating && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
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
                            fontSize: "13px",
                            color: "#5f6368",
                          }}
                        >
                          ({location.totalRatings})
                        </span>
                      )}
                    </div>
                  )}

                  {getPriceDisplay(location.priceLevel) && (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#137333",
                        fontWeight: "500",
                      }}
                    >
                      {getPriceDisplay(location.priceLevel)}
                    </span>
                  )}
                </div>

                {/* Type and distance */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#5f6368",
                    }}
                  >
                    {formatTypes(location.types)}
                  </span>
                  <span style={{ color: "#dadce0" }}>•</span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#5f6368",
                    }}
                  >
                    {formatDistance(location)}
                  </span>
                </div>

                {/* Address */}
                {location.address && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      marginBottom: "12px",
                    }}
                  >
                    <MapPin
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#5f6368",
                        marginTop: "1px",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#5f6368",
                        lineHeight: "18px",
                      }}
                    >
                      {location.address}
                    </span>
                  </div>
                )}

                {/* Action buttons for selected item */}
                {isSelected && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "16px",
                      paddingTop: "12px",
                      borderTop: "1px solid #e8eaed",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Get directions to:", location.name);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#1a73e8",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1557b0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#1a73e8";
                      }}
                    >
                      <Navigation style={{ width: "14px", height: "14px" }} />
                      Directions
                    </button>

                    {location.phone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${location.phone}`, "_self");
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "white",
                          color: "#1a73e8",
                          border: "1px solid #dadce0",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Phone style={{ width: "14px", height: "14px" }} />
                        Call
                      </button>
                    )}

                    {location.website && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(location.website, "_blank");
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "white",
                          color: "#1a73e8",
                          border: "1px solid #dadce0",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <ExternalLink
                          style={{ width: "14px", height: "14px" }}
                        />
                        Website
                      </button>
                    )}
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
