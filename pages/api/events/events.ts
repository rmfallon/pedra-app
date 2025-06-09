// pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    lat,
    lng,
    radius,
    ne_lat,
    ne_lng,
    sw_lat,
    sw_lng,
    start_date,
    end_date,
    category,
  } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Location coordinates are required" });
  }

  try {
    let query = supabase.from("events").select("*");

    // If we have map bounds, use them for precise filtering
    if (ne_lat && ne_lng && sw_lat && sw_lng) {
      // Use standard filtering for bounds
      query = query
        .filter("latitude", "lte", parseFloat(ne_lat as string))
        .filter("latitude", "gte", parseFloat(sw_lat as string))
        .filter("longitude", "lte", parseFloat(ne_lng as string))
        .filter("longitude", "gte", parseFloat(sw_lng as string));
    } else if (radius) {
      // For radius-based filtering, we'll use a more basic approach for compatibility
      const radiusInDegrees = parseFloat(radius as string) / 111000; // Rough conversion from meters to degrees
      const latFloat = parseFloat(lat as string);
      const lngFloat = parseFloat(lng as string);

      query = query
        .filter("latitude", "gte", latFloat - radiusInDegrees)
        .filter("latitude", "lte", latFloat + radiusInDegrees)
        .filter("longitude", "gte", lngFloat - radiusInDegrees)
        .filter("longitude", "lte", lngFloat + radiusInDegrees);
    }

    // Add date filters if provided
    if (start_date) {
      query = query.filter("start_time", "gte", start_date);
    } else {
      // By default, only show future events
      query = query.filter("start_time", "gte", new Date().toISOString());
    }

    if (end_date) {
      query = query.filter("start_time", "lte", end_date);
    }

    // Filter by category if provided
    if (category) {
      query = query.filter("category", "eq", category);
    }

    // Only return public events
    query = query.filter("visibility", "eq", "public");

    // Order by start time
    query = query.order("start_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match our Event interface
    const events = data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: event.start_time,
      endTime: event.end_time,
      locationName: event.location_name,
      coordinates: {
        lat: event.latitude,
        lng: event.longitude,
      },
      address: event.address,
      imageUrl: event.image_url,
      organizer: event.organizer,
      category: event.category,
      tags: event.tags,
      source: event.source,
      externalId: event.external_id,
      url: event.url,
      costType: event.cost_type,
      costAmount: event.cost_amount,
      visibility: event.visibility,
      ownerId: event.owner_id,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }));

    return res.status(200).json({ events });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ error: error.message });
  }
}
