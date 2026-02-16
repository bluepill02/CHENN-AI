import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function: Geolocation Proxy
 * Proxies requests to BigDataCloud reverse geocoding API
 * 
 * Query params:
 * - lat: latitude (optional)
 * - lng: longitude (optional)
 * If coordinates not provided, uses IP-based location
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    // Parse query parameters
    const { lat, lng } = request.query;

    let url = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

    // If coordinates are provided, use them. Otherwise it defaults to IP location.
    if (lat && lng) {
      const latitude = Array.isArray(lat) ? lat[0] : lat;
      const longitude = Array.isArray(lng) ? lng[0] : lng;
      url += `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    } else {
      url += `?localityLanguage=en`;
    }

    const res = await fetch(url);
    const data = await res.json();

    return response.status(200).json(data);

  } catch (error) {
    console.error('Geolocation API error:', error);
    return response.status(500).json({
      error: 'Failed to fetch location data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
