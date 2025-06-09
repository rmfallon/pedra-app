// components/PlaceDetails.tsx
import React from "react";
import { Clock, MapPin, Phone, Globe, Star, X, Navigation } from "lucide-react";

interface PlaceDetailsProps {
  place: any;
  onClose: () => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onClose }) => {
  const formatOpeningHours = (hours: any) => {
    if (!hours?.periods) return "Hours not available";
    const today = new Date().getDay();
    const todayHours = hours.periods.find(
      (period: any) => period.open?.day === today,
    );
    if (!todayHours) return "Closed today";
    return `${todayHours.open?.time.replace(/(\d{2})(\d{2})/, "$1:$2")} - ${todayHours.close?.time.replace(
      /(\d{2})(\d{2})/,
      "$1:$2",
    )}`;
  };

  const getBusinessStatus = () => {
    if (!place.current_opening_hours?.open_now) return "🔴 Closed";
    return "🟢 Open";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md">
      <div className="relative">
        {place.photos && place.photos.length > 0 && (
          <img
            src={`/api/places/photo?photo_reference=${place.photos[0].photo_reference}`}
            alt={place.name}
            className="w-full h-48 object-cover"
          />
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold">{place.name}</h2>
          {place.rating && (
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="ml-1">{place.rating}</span>
              {place.user_ratings_total && (
                <span className="text-sm text-gray-500 ml-1">
                  ({place.user_ratings_total})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
            <p className="text-gray-600">{place.formatted_address}</p>
          </div>

          {place.current_opening_hours && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <span className="font-medium">{getBusinessStatus()}</span>
                <p className="text-sm text-gray-600">
                  {formatOpeningHours(place.current_opening_hours)}
                </p>
              </div>
            </div>
          )}

          {place.formatted_phone_number && (
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <a
                href={`tel:${place.formatted_phone_number}`}
                className="text-blue-600 hover:underline"
              >
                {place.formatted_phone_number}
              </a>
            </div>
          )}

          {place.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {place.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {place.url && (
            <div className="mt-4">
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                View on Google Maps
              </a>
            </div>
          )}

          {place.price_level && (
            <div className="mt-2 text-gray-600">
              Price Level: {"$".repeat(place.price_level)}
            </div>
          )}
        </div>

        {place.reviews && place.reviews.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Latest Review</h3>
            <div className="text-sm">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{place.reviews[0].rating}</span>
              </div>
              <p className="text-gray-600">{place.reviews[0].text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;
