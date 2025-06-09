// pages/api/places/search.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { q: query, lat, lng, bounds, zoom } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Google Places API key is not configured." });
  }

  const fields = [
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
  ].join(",");

  try {
    // Parse bounds if provided
    let locationBounds;
    if (bounds) {
      try {
        locationBounds = JSON.parse(bounds as string);
      } catch (e) {
        console.error("Error parsing bounds:", e);
      }
    }

    // Calculate search radius based on zoom level
    const zoomLevel = Number(zoom) || 12;
    const radius = Math.min(
      50000,
      Math.max(1000, Math.pow(2, 16 - zoomLevel) * 100),
    );

    // Perform the search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${new URLSearchParams(
      {
        query: typeof query === "string" ? query : "",
        key: apiKey,
        location: `${lat},${lng}`,
        radius: radius.toString(),
        ...(locationBounds && {
          bounds: `${locationBounds.sw.lat},${locationBounds.sw.lng}|${locationBounds.ne.lat},${locationBounds.ne.lng}`,
        }),
      },
    )}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      // Filter results within the visible bounds if bounds are provided
      let filteredResults = data.results;
      if (locationBounds) {
        filteredResults = data.results.filter((place: any) => {
          const placeLat = place.geometry.location.lat;
          const placeLng = place.geometry.location.lng;
          return (
            placeLat >= locationBounds.sw.lat &&
            placeLat <= locationBounds.ne.lat &&
            placeLng >= locationBounds.sw.lng &&
            placeLng <= locationBounds.ne.lng
          );
        });
      }

      const detailedResults = await Promise.all(
        filteredResults.slice(0, 20).map(async (place: any) => {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${new URLSearchParams(
            {
              place_id: place.place_id,
              fields,
              key: apiKey,
            },
          )}`;

          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          return {
            ...detailsData.result,
            types: place.types,
          };
        }),
      );

      return res.status(200).json({
        status: "OK",
        results: detailedResults,
      });
    }

    return res.status(200).json({
      status: "OK",
      results: [],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
