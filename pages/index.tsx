import React, { useState } from "react";
import Map from "../components/Map";
import SearchBar from "../components/SearchBar";
import SearchSidebar from "../components/SearchSidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);

  console.log("Pedra app rendering - Google Maps style layout");

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar - Collapsible */}
      <div
        style={{
          width: sidebarOpen ? `${sidebarWidth}px` : "0px",
          height: "100vh",
          backgroundColor: "white",
          borderRight: "1px solid #e0e0e0",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s ease",
          overflow: "hidden",
          boxShadow: sidebarOpen ? "2px 0 8px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {sidebarOpen && (
          <>
            {/* Search Bar at top of sidebar */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #e0e0e0",
                backgroundColor: "white",
                flexShrink: 0,
              }}
            >
              <SearchBar />
            </div>

            {/* Search Results in scrollable area */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                backgroundColor: "#fafafa",
              }}
            >
              <SearchSidebar />
            </div>
          </>
        )}
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          left: sidebarOpen ? `${sidebarWidth - 1}px` : "0px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 200,
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
          borderLeft: sidebarOpen ? "none" : "1px solid #e0e0e0",
          borderRadius: sidebarOpen ? "0 8px 8px 0" : "0 8px 8px 0",
          padding: "12px 6px",
          cursor: "pointer",
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          transition: "left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft
            style={{ width: "16px", height: "16px", color: "#5f6368" }}
          />
        ) : (
          <ChevronRight
            style={{ width: "16px", height: "16px", color: "#5f6368" }}
          />
        )}
      </button>

      {/* Right side - Map takes remaining space */}
      <div
        style={{
          flex: 1,
          height: "100vh",
          position: "relative",
          minWidth: "300px", // Ensure map always has minimum width
        }}
      >
        {/* Floating search bar when sidebar is closed */}
        {!sidebarOpen && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              right: "20px",
              zIndex: 150,
              maxWidth: "600px",
            }}
          >
            <SearchBar />
          </div>
        )}

        <Map />

        {/* Map Attribution/Info */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#5f6368",
            zIndex: 50,
          }}
        >
          Powered by Pedra
        </div>
      </div>
    </div>
  );
};

export default Home;
