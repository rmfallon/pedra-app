export interface Location {
  id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  totalRatings?: number;
  photos?: string[];
  website?: string;
  phone?: string;
  hours?: {
    open: string;
    close: string;
    day: number;
  }[];
  priceLevel?: number;
  types?: string[];
  source: "google" | "yelp" | "osm";
  sourceId: string;
  lastUpdated: Date;
}
