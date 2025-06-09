import { Location } from "./types/location";
import { googlePlacesService } from "./sources/google";
import { supabase } from "../lib/supabaseClient";

export class LocationAggregator {
  async searchNearby(params: {
    lat: number;
    lng: number;
    radius?: number;
    keyword?: string;
  }): Promise<Location[]> {
    try {
      const radius = params.radius || 1000;

      // First check cache using the PostGIS function
      const { data: cachedLocations, error: cacheError } = await supabase.rpc(
        "search_nearby_locations",
        {
          search_lat: params.lat,
          search_lng: params.lng,
          radius_meters: radius,
          keyword: params.keyword || null,
        },
      );

      if (cacheError) {
        console.error("Error fetching from cache:", cacheError);
      }

      // Convert database format back to Location interface
      if (cachedLocations && cachedLocations.length > 0) {
        return this.convertDbToLocation(cachedLocations);
      }

      // If not in cache, fetch from Google Places
      const locations = await googlePlacesService.searchNearby(params);

      // Cache the results
      if (locations.length > 0) {
        const locationsForDb = locations.map((loc) => ({
          name: loc.name,
          description: loc.description,
          coordinates: `POINT(${loc.coordinates.lng} ${loc.coordinates.lat})`,
          address: loc.address,
          rating: loc.rating,
          total_ratings: loc.totalRatings,
          photos: loc.photos,
          website: loc.website,
          phone: loc.phone,
          hours: loc.hours,
          price_level: loc.priceLevel,
          types: loc.types,
          source: loc.source,
          source_id: loc.sourceId,
          last_updated: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from("locations")
          .upsert(locationsForDb, {
            onConflict: "source,source_id",
            ignoreDuplicates: false,
          });

        if (insertError) {
          console.error("Error caching locations:", insertError);
        }
      }

      return locations;
    } catch (error) {
      console.error("Error in location aggregator:", error);
      throw error;
    }
  }

  async searchText(
    query: string,
    params?: {
      lat?: number;
      lng?: number;
      radius?: number;
    },
  ): Promise<Location[]> {
    try {
      // Try cache first for text searches too
      if (params?.lat && params?.lng) {
        const { data: cachedLocations } = await supabase.rpc(
          "search_nearby_locations",
          {
            search_lat: params.lat,
            search_lng: params.lng,
            radius_meters: params.radius || 5000, // Larger radius for text search
            keyword: query,
          },
        );

        if (cachedLocations && cachedLocations.length > 0) {
          return this.convertDbToLocation(cachedLocations);
        }
      }

      // Fallback to Google Places API
      const locations = await googlePlacesService.searchText({
        query,
        ...params,
      });

      // Cache results if we have location context
      if (locations.length > 0 && params?.lat && params?.lng) {
        await this.cacheLocations(locations);
      }

      return locations;
    } catch (error) {
      console.error("Error in text search:", error);
      throw error;
    }
  }

  private async cacheLocations(locations: Location[]): Promise<void> {
    const locationsForDb = locations.map((loc) => ({
      name: loc.name,
      description: loc.description,
      coordinates: `POINT(${loc.coordinates.lng} ${loc.coordinates.lat})`,
      address: loc.address,
      rating: loc.rating,
      total_ratings: loc.totalRatings,
      photos: loc.photos,
      website: loc.website,
      phone: loc.phone,
      hours: loc.hours,
      price_level: loc.priceLevel,
      types: loc.types,
      source: loc.source,
      source_id: loc.sourceId,
      last_updated: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("locations")
      .upsert(locationsForDb, {
        onConflict: "source,source_id",
        ignoreDuplicates: false,
      });

    if (insertError) {
      console.error("Error caching locations:", insertError);
    }
  }

  private convertDbToLocation(dbRows: any[]): Location[] {
    return dbRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      coordinates: {
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
      },
      address: row.address,
      rating: row.rating,
      totalRatings: row.total_ratings,
      photos: row.photos || [],
      website: row.website,
      phone: row.phone,
      hours: row.hours,
      priceLevel: row.price_level,
      types: row.types || [],
      source: row.source as "google" | "yelp" | "osm",
      sourceId: row.source_id,
      lastUpdated: new Date(row.last_updated || Date.now()),
    }));
  }
}

export const locationAggregator = new LocationAggregator();
