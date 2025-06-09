import { Location } from "../types/location";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!;

export class GooglePlacesService {
  private baseUrl = "https://maps.googleapis.com/maps/api/place";

  // Convert Google Place to our unified Location format
  private convertToLocation(place: any): Location {
    return {
      id: `google_${place.place_id}`,
      name: place.name,
      description: place.types?.join(", "),
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      address: place.formatted_address,
      rating: place.rating,
      totalRatings: place.user_ratings_total,
      photos: place.photos?.map((photo: any) => photo.photo_reference) || [],
      website: place.website,
      phone: place.formatted_phone_number,
      hours: place.opening_hours?.periods?.map((period: any) => ({
        open: period.open?.time,
        close: period.close?.time,
        day: period.open?.day,
      })),
      priceLevel: place.price_level,
      types: place.types,
      source: "google" as const,
      sourceId: place.place_id,
      lastUpdated: new Date(),
    };
  }

  async searchNearby(params: {
    lat: number;
    lng: number;
    radius?: number;
    keyword?: string;
    type?: string;
  }): Promise<Location[]> {
    const searchParams = new URLSearchParams({
      location: `${params.lat},${params.lng}`,
      radius: (params.radius || 1000).toString(),
      key: GOOGLE_API_KEY,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.type && { type: params.type }),
    });

    try {
      const response = await fetch(`/api/places/nearby?${searchParams}`);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results.map(this.convertToLocation);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      throw error;
    }
  }

  async searchText(params: {
    query: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Location[]> {
    const searchParams = new URLSearchParams({
      q: params.query,
      ...(params.lat && { lat: params.lat.toString() }),
      ...(params.lng && { lng: params.lng.toString() }),
      ...(params.radius && { radius: params.radius.toString() }),
    });

    try {
      const response = await fetch(`/api/places/search?${searchParams}`);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.results.map(this.convertToLocation);
    } catch (error) {
      console.error("Error performing text search:", error);
      throw error;
    }
  }

  async getDetails(placeId: string): Promise<Location | null> {
    const searchParams = new URLSearchParams({
      place_id: placeId,
      key: GOOGLE_API_KEY,
      fields: [
        "name",
        "formatted_address",
        "geometry",
        "rating",
        "user_ratings_total",
        "photos",
        "website",
        "formatted_phone_number",
        "opening_hours",
        "price_level",
        "types",
      ].join(","),
    });

    try {
      const response = await fetch(`/api/places/details?${searchParams}`);
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return this.convertToLocation(data.result);
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }
}

export const googlePlacesService = new GooglePlacesService();
