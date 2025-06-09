// /pages/api/googlePlaces.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { input, location, radius } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Google Places API key is not configured." });
  }

  if (typeof input !== "string" || input.trim() === "") {
    return res.status(400).json({ error: "Input query is required." });
  }

  // Use the provided location or default to a fallback
  const [lat, lng] = (
    typeof location === "string" ? location : "42.3976,-71.0776"
  ).split(",");

  // First, try nearby search
  const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams(
    {
      location: `${lat},${lng}`,
      radius: typeof radius === "string" ? radius : "5000",
      keyword: input,
      key: apiKey,
    },
  )}`;

  try {
    const nearbyResponse = await fetch(nearbySearchUrl);
    const nearbyData = await nearbyResponse.json();

    // If nearby search returns results, use those
    if (nearbyData.status === "OK" && nearbyData.results.length > 0) {
      // Transform nearby results to match autocomplete format
      const predictions = nearbyData.results.map((place: any) => ({
        place_id: place.place_id,
        description: `${place.name}${place.vicinity ? ` - ${place.vicinity}` : ""}`,
        structured_formatting: {
          main_text: place.name,
          secondary_text: place.vicinity || "",
        },
      }));

      return res.status(200).json({
        status: "OK",
        predictions,
      });
    }

    // Fallback to autocomplete if nearby search returns no results
    const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${new URLSearchParams(
      {
        input,
        location: `${lat},${lng}`,
        radius: typeof radius === "string" ? radius : "5000",
        key: apiKey,
        types: "establishment",
        strictbounds: "true",
      },
    )}`;

    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();

    return res.status(200).json(autocompleteData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
