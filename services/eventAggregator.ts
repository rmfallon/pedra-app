import { Event } from "./types/event";
import { eventbriteService } from "./sources/eventbrite";
import { supabase } from "../lib/supabaseClient";

export class EventAggregator {
  async searchEvents(params: {
    lat: number;
    lng: number;
    radius?: number;
    startDate?: Date;
    endDate?: Date;
    category?: string;
  }): Promise<Event[]> {
    try {
      // First check cache in Supabase
      const { data: cachedEvents, error: cacheError } = await supabase
        .from("events")
        .select("*")
        .filter(
          "ST_DWithin",
          "ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)",
          `ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)`,
          params.radius || 10000,
        )
        .filter(
          "updated_at",
          "gte",
          new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours cache
        );

      if (cacheError) {
        console.error("Error fetching from cache:", cacheError);
      }

      if (cachedEvents && cachedEvents.length > 0) {
        // Transform to our Event format
        return cachedEvents.map(this.mapDbEventToEvent);
      }

      // If not in cache, fetch from Eventbrite
      const events = await eventbriteService.searchEvents(params);

      // Cache the results
      if (events.length > 0) {
        const { error: insertError } = await supabase
          .from("events")
          .upsert(events.map(this.mapEventToDbEvent), {
            onConflict: "source,external_id",
          });

        if (insertError) {
          console.error("Error caching events:", insertError);
        }
      }

      return events;
    } catch (error) {
      console.error("Error in event aggregator:", error);
      return [];
    }
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("owner_id", userId)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching user events:", error);
      return [];
    }

    return (data || []).map(this.mapDbEventToEvent);
  }

  async createEvent(
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ): Promise<Event | null> {
    const dbEvent = this.mapEventToDbEvent({
      ...event,
      id: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { data, error } = await supabase
      .from("events")
      .insert([dbEvent])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    return this.mapDbEventToEvent(data);
  }

  // Helper to map database event to Event interface
  private mapDbEventToEvent(dbEvent: any): Event {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      startTime: new Date(dbEvent.start_time),
      endTime: dbEvent.end_time ? new Date(dbEvent.end_time) : undefined,
      locationName: dbEvent.location_name,
      coordinates: {
        lat: dbEvent.latitude,
        lng: dbEvent.longitude,
      },
      address: dbEvent.address,
      imageUrl: dbEvent.image_url,
      organizer: dbEvent.organizer,
      category: dbEvent.category,
      tags: dbEvent.tags,
      source: dbEvent.source,
      externalId: dbEvent.external_id,
      url: dbEvent.url,
      costType: dbEvent.cost_type,
      costAmount: dbEvent.cost_amount,
      visibility: dbEvent.visibility,
      ownerId: dbEvent.owner_id,
      createdAt: new Date(dbEvent.created_at),
      updatedAt: new Date(dbEvent.updated_at),
    };
  }

  // Helper to map Event interface to database format
  private mapEventToDbEvent(event: Event): any {
    return {
      id: event.id || undefined, // Let Supabase generate UUID if empty
      title: event.title,
      description: event.description,
      start_time: event.startTime.toISOString(),
      end_time: event.endTime?.toISOString(),
      location_name: event.locationName,
      latitude: event.coordinates.lat,
      longitude: event.coordinates.lng,
      address: event.address,
      image_url: event.imageUrl,
      organizer: event.organizer,
      category: event.category,
      tags: event.tags,
      source: event.source,
      external_id: event.externalId,
      url: event.url,
      cost_type: event.costType,
      cost_amount: event.costAmount,
      visibility: event.visibility,
      owner_id: event.ownerId,
      created_at: event.createdAt.toISOString(),
      updated_at: event.updatedAt.toISOString(),
    };
  }
}

export const eventAggregator = new EventAggregator();
