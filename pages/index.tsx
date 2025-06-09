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

      {/* Clean SearchBar overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          zIndex: 1000,
          maxWidth: "600px",
        }}
      >
        <SearchBar />
      </div>
    </div>
  );
};

export default Home;
