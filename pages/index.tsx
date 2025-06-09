import React from "react";
import Map from "../components/Map";
import SearchBar from "../components/SearchBar";

const Home = () => {
  console.log("Index page rendering");

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Map layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Map />
      </div>

      {/* SearchBar with VERY obvious styling for debugging */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          zIndex: 999999,
          maxWidth: "600px",
          backgroundColor: "rgba(255, 0, 0, 0.5)", // Red background to see it
          padding: "15px",
          borderRadius: "10px",
          border: "3px solid yellow",
        }}
      >
        <div
          style={{
            backgroundColor: "yellow",
            color: "black",
            padding: "10px",
            marginBottom: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "16px",
            borderRadius: "5px",
          }}
        >
          🔍 DEBUG: SearchBar should appear below this yellow box
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "2px solid blue",
          }}
        >
          <SearchBar />
        </div>

        <div
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "5px",
            marginTop: "10px",
            textAlign: "center",
            fontWeight: "bold",
            borderRadius: "5px",
          }}
        >
          ✅ If you see this green box, the layout is working
        </div>
      </div>
    </div>
  );
};

export default Home;
