export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  imageUrl?: string;
  organizer?: string;
  category?: string;
  tags?: string[];
  source: "eventbrite" | "meetup" | "user" | "pedra";
  externalId?: string;
  url?: string;
  costType?: "free" | "paid" | "donation";
  costAmount?: number;
  visibility: "public" | "private" | "shared";
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: "going" | "interested" | "not_going";
  createdAt: Date;
}
