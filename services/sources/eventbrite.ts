import { Event } from "../types/event";

const EVENTBRITE_API_KEY = process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY!;

export class EventbriteService {
  private baseUrl = "https://www.eventbriteapi.com/v3";

  // Convert Eventbrite event to our unified Event format
  private convertToEvent(event: any): Event {
    return {
      id: `eventbrite_${event.id}`,
      title: event.name.text,
      description: event.description?.text,
      startTime: new Date(event.start.utc),
      endTime: new Date(event.end.utc),
      locationName: event.venue?.name || "",
      coordinates: {
        lat: event.venue?.latitude ? parseFloat(event.venue.latitude) : 0,
        lng: event.venue?.longitude ? parseFloat(event.venue.longitude) : 0,
      },
      address: event.venue?.address?.localized_address_display,
      imageUrl: event.logo?.url,
      organizer: event.organizer?.name,
      category: event.category_id
        ? `eventbrite_category_${event.category_id}`
        : undefined,
      source: "eventbrite",
      externalId: event.id,
      url: event.url,
      costType: event.is_free ? "free" : "paid",
      visibility: "public",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async searchEvents(params: {
    lat: number;
    lng: number;
    radius?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    // We'll call our API endpoint instead of directly calling Eventbrite API
    const searchParams = new URLSearchParams({
      lat: params.lat.toString(),
      lng: params.lng.toString(),
      radius: (params.radius || 10000).toString(), // Default 10km radius
      ...(params.startDate && { start_date: params.startDate.toISOString() }),
      ...(params.endDate && { end_date: params.endDate.toISOString() }),
    });

    try {
      const response = await fetch(`/api/events/eventbrite?${searchParams}`);
      const data = await response.json();

      if (!data.events) {
        throw new Error("Error fetching Eventbrite events");
      }

      return data.events.map(this.convertToEvent);
    } catch (error) {
      console.error("Error fetching Eventbrite events:", error);
      return [];
    }
  }
}

export const eventbriteService = new EventbriteService();
