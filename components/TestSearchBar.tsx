import React from "react";

const TestSearchBar: React.FC = () => {
  console.log("TestSearchBar is rendering!");

  return (
    <div
      style={{
        backgroundColor: "#ef4444", // red-500
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        border: "3px solid #000",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        position: "relative",
        zIndex: 99999,
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        TEST SEARCH BAR IS WORKING!
      </h1>
      <input
        type="text"
        placeholder="Test input"
        style={{
          color: "black",
          padding: "8px",
          width: "100%",
          border: "2px solid #000",
          borderRadius: "4px",
        }}
      />
      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        If you can see this, the SearchBar positioning is fixed!
      </p>
    </div>
  );
};

export default TestSearchBar;
