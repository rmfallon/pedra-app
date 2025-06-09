// pages/api/places/details-by-location.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lng } = req.query;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Google Places API key is not configured.' });
  }

  try {
    // First use Places Nearby Search to find the exact place
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams({
      location: `${lat},${lng}`,
      radius: '10', // Very small radius to get the exact place
      rankby: 'distance',
      key: apiKey
    })}`;

    const nearbyResponse = await fetch(nearbyUrl);
    const nearbyData = await nearbyResponse.json();

    if (nearbyData.status === 'OK' && nearbyData.results?.[0]) {
      // Get detailed information about the place
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${new URLSearchParams({
        place_id: nearbyData.results[0].place_id,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'geometry',
          'opening_hours',
          'photos',
          'place_id',
          'price_level',
          'rating',
          'reviews',
          'types',
          'url',
          'user_ratings_total',
          'website',
          'wheelchair_accessible_entrance',
          'business_status',
          'current_opening_hours'
        ].join(','),
        key: apiKey,
      })}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === 'OK') {
        return res.status(200).json(detailsData);
      }
    }

    // If no specific place found, fallback to reverse geocoding
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${new URLSearchParams({
      latlng: `${lat},${lng}`,
      key: apiKey
    })}`;

    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status === 'OK' && geocodeData.results?.[0]) {
      return res.status(200).json({
        result: {
          formatted_address: geocodeData.results[0].formatted_address,
          name: geocodeData.results[0].address_components[0].long_name,
          geometry: geocodeData.results[0].geometry,
          types: geocodeData.results[0].types
        }
      });
    }

    return res.status(404).json({ error: 'No place found at this location' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}