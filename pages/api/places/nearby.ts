// pages/api/places/nearby.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { lat, lng, ne_lat, ne_lng, sw_lat, sw_lng } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Google Places API key is not configured." });
  }

  try {
    // Use Nearby Search to find places in the current viewport
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams(
      {
        location: `${lat},${lng}`,
        radius: "1000", // 1km radius
        type: "establishment", // Get businesses and points of interest
        key: apiKey,
      },
    )}`;

    const response = await fetch(nearbyUrl);
    const data = await response.json();

    if (data.status === "OK" && data.results) {
      // Filter results to only include places within the viewport bounds
      const filteredResults = data.results.filter((place: any) => {
        const placeLat = place.geometry.location.lat;
        const placeLng = place.geometry.location.lng;
        return (
          placeLat >= Number(sw_lat) &&
          placeLat <= Number(ne_lat) &&
          placeLng >= Number(sw_lng) &&
          placeLng <= Number(ne_lng)
        );
      });

      // Get additional details for each place
      const detailedResults = await Promise.all(
        filteredResults.map(async (place: any) => {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${new URLSearchParams(
            {
              place_id: place.place_id,
              fields: [
                "name",
                "formatted_address",
                "formatted_phone_number",
                "geometry",
                "opening_hours",
                "photos",
                "place_id",
                "price_level",
                "rating",
                "reviews",
                "types",
                "url",
                "user_ratings_total",
                "website",
                "business_status",
              ].join(","),
              key: apiKey,
            },
          )}`;

          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();

          return {
            ...place,
            ...detailsData.result,
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
