// /components/POIButton.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useMap } from "../context/MapContext";

const POIButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { map } = useMap();

  const handleAddPOI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !map) return;

    const center = map.getCenter();
    const latitude = center.lat;
    const longitude = center.lng;

    const { data, error } = await supabase
      .from("pois")
      .insert([{ name, description, latitude, longitude }]);

    if (error) {
      alert("Error saving POI: " + error.message);
    } else {
      alert("POI saved successfully!");
      setShowModal(false);
      setName("");
      setDescription("");
      // Optionally trigger a refresh of the sidebar list here.
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg"
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Add New POI</h2>
            <form onSubmit={handleAddPOI}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="POI Name"
                className="w-full p-2 border border-gray-300 mb-2"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-2 border border-gray-300 mb-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default POIButton;
