import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { lat, lng, radius, start_date, end_date } = req.query;
  const apiKey = process.env.EVENTBRITE_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Eventbrite API key is not configured." });
  }

  try {
    // Find venue IDs near the specified location
    const venueSearchUrl = `https://www.eventbriteapi.com/v3/venues/search/`;
    const venueResponse = await axios.get(venueSearchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        latitude: lat,
        longitude: lng,
        within: `${radius || 10}km`,
      },
    });

    const venueIds = venueResponse.data.venues.map((venue: any) => venue.id);

    // Get events for these venues
    let allEvents: any[] = [];

    // We'll create a series of requests for each venue
    const eventPromises = venueIds.map((venueId: string) => {
      return axios.get(
        `https://www.eventbriteapi.com/v3/venues/${venueId}/events/`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          params: {
            start_date: start_date || undefined,
            end_date: end_date || undefined,
            expand: "venue,organizer,ticket_classes",
          },
        },
      );
    });

    // Execute all requests in parallel
    const eventResults = await Promise.allSettled(eventPromises);

    // Process successful results
    eventResults.forEach((result) => {
      if (result.status === "fulfilled") {
        allEvents = [...allEvents, ...result.value.data.events];
      }
    });

    return res.status(200).json({
      events: allEvents,
    });
  } catch (error: any) {
    console.error(
      "Eventbrite API error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      error: "Failed to fetch events from Eventbrite",
      details: error.response?.data || error.message,
    });
  }
}
