// /pages/api/googlePlaceDetails.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { place_id } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Google Places API key is not configured." });
  }
  if (typeof place_id !== "string") {
    return res.status(400).json({ error: "place_id is required." });
  }

  const params = new URLSearchParams({
    place_id,
    key: apiKey,
    // Limit the fields returned for efficiency
    fields: "geometry,name,formatted_address",
  });

  const googleApiUrl = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;

  try {
    const response = await fetch(googleApiUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
