export type DbLocation = {
  id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating?: number;
  total_ratings?: number;
  photos?: string[];
  website?: string;
  phone?: string;
  hours?: {
    open: string;
    close: string;
    day: number;
  }[];
  price_level?: number;
  types?: string[];
  source: "google" | "yelp" | "osm";
  source_id: string;
  last_updated: Date;
};
