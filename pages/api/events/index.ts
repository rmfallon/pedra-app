// pages/api/events/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      return await getEvents(req, res);
    case "POST":
      return await createEvent(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// GET - Search for events
async function getEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { lat, lng, radius, start_date, end_date, category } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Location parameters are required" });
    }

    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusNum = parseFloat(radius as string) || 10; // Default 10km radius

    console.log(
      `Fetching events near ${latNum}, ${lngNum} with radius ${radiusNum}km`,
    );

    // Basic query to select all fields
    let query = supabase.from("events").select("*");

    // Now use the correct column names from your schema
    if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(radiusNum)) {
      // Calculate bounding box using the correct column names: latitude and longitude
      const maxLat = latNum + radiusNum / 111; // Approx 111km per degree of latitude
      const minLat = latNum - radiusNum / 111;
      const maxLng =
        lngNum + radiusNum / (111 * Math.cos((latNum * Math.PI) / 180));
      const minLng =
        lngNum - radiusNum / (111 * Math.cos((latNum * Math.PI) / 180));

      query = query
        .gte("latitude", minLat)
        .lte("latitude", maxLat)
        .gte("longitude", minLng)
        .lte("longitude", maxLng);
    }

    // Add date filter if provided
    if (start_date) {
      query = query.gte("start_time", start_date);
    }

    if (end_date) {
      query = query.lte("end_time", end_date);
    }

    // Add category filter if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Transform the data to match what your frontend expects
    const transformedData = data?.map((event) => ({
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
    }));

    return res.status(200).json(transformedData || []);
  } catch (error) {
    console.error("Error in getEvents:", error);
    return res.status(500).json({
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// POST - Create a new event
async function createEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      locationName,
      latitude,
      longitude,
      address,
      imageUrl,
      organizer,
      category,
      tags,
      url,
      costType,
      costAmount,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !startTime ||
      !locationName ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the event using the correct column names
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          title,
          description,
          start_time: startTime,
          end_time: endTime,
          location_name: locationName,
          latitude,
          longitude,
          address,
          image_url: imageUrl,
          organizer,
          category,
          tags,
          source: "user-created",
          url,
          cost_type: costType,
          cost_amount: costAmount,
          visibility: "public",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error in createEvent:", error);
    return res.status(500).json({
      error: "Failed to create event",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
