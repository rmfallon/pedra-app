// components/CustomMarker.tsx
import React from "react";
import { Location } from "../services/types/location";

interface CustomMarkerProps {
  location: Location;
  onClick: () => void;
  isSelected: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
  location,
  onClick,
  isSelected,
}) => {
  return (
    <div
      className={`
          w-8 h-8 
          rounded-full 
          flex items-center justify-center 
          transform -translate-x-1/2 -translate-y-1/2
          cursor-pointer
          transition-all
          ${
            isSelected
              ? "bg-blue-500 text-white shadow-lg scale-110"
              : "bg-red-500 text-white shadow hover:scale-105 hover:bg-red-600"
          }
        `}
      onClick={onClick}
      title={location.name}
    >
      <div className="w-4 h-4 rounded-full bg-current flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    </div>
  );
};
