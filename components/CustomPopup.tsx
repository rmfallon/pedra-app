// components/CustomPopup.tsx
interface CustomPopupProps {
  location: Location;
  onClose: () => void;
}

const CustomPopup: React.FC<CustomPopupProps> = ({ location, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{location.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ×
        </button>
      </div>
      {location.address && (
        <p className="text-gray-600 text-sm mb-2">{location.address}</p>
      )}
      {/* Add more details as needed */}
    </div>
  );
};
