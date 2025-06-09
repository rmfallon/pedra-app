// components/EventDetails.tsx
import React from "react";

// Assuming you have an Event type defined elsewhere
interface EventDetailsProps {
  event: any; // Replace with your actual Event type
  onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md">
      <div className="relative">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
        <p className="text-gray-600 mb-4">{event.description}</p>

        <div className="flex items-center mb-2">
          <svg
            className="w-4 h-4 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center mb-4">
          <svg
            className="w-4 h-4 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>{event.location}</span>
        </div>

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors">
          RSVP
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
