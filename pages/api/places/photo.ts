// pages/api/places/photo.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { photo_reference } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Google Places API key is not configured." });
  }

  if (!photo_reference) {
    return res.status(400).json({ error: "Photo reference is required." });
  }

  try {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo_reference}&key=${apiKey}`;
    const response = await fetch(photoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ error: "Failed to fetch photo" });
  }
}
