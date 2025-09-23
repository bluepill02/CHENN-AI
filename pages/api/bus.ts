/**
 * Chennai Bus Data API Endpoint
 * 
 * This API endpoint serves as the bridge between the Chennai Community App frontend
 * and live bus data from Chalo's public transportation service. It provides normalized,
 * Tamil-first bus data with comprehensive error handling and caching.
 * 
 * Endpoint: GET /api/bus
 * 
 * Features:
 * - Live data from Chalo's Chennai transportation dashboard
 * - Tamil-first schema with bilingual route information
 * - 30-second intelligent caching to respect API limits
 * - Comprehensive error handling with fallback mock data
 * - Chennai area mapping and route translation
 * - CORS-enabled for frontend consumption
 * 
 * Response Format:
 * ```json
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "routeNumber": "21G",
 *       "routeName": "Anna Salai Express",
 *       "routeNameTamil": "அண்ணா சாலை எக்ஸ்பிரஸ்",
 *       "areaDisplayName": "T.Nagar Central",
 *       "areaDisplayNameTamil": "டி.நகர் மத்திய",
 *       "busStatus": "running",
 *       "busStatusTamil": "இயங்கி வருகிறது",
 *       "nextArrival": "5 mins",
 *       "busCount": 3
 *     }
 *   ],
 *   "meta": {
 *     "count": 15,
 *     "source": "live", // or "cached" or "mock"
 *     "timestamp": "2025-09-22T10:30:00.000Z"
 *   }
 * }
 * ```
 * 
 * Error Handling:
 * - Primary: Live data from Chalo API
 * - Fallback 1: Cached data (if within 30 seconds)
 * - Fallback 2: Mock Chennai bus data with realistic routes
 * - Final: Empty array with error details in meta.errors
 * 
 * Performance:
 * - 30-second cache duration
 * - 10-second fetch timeout
 * - Efficient Chennai area detection
 * - Optimized Tamil transliteration
 * 
 * @author Chennai Community App Team
 * @version 1.0.0
 * @since September 2025
 */

// NEW: API route for Chennai bus data - Tamil-first feed endpoint
// NEW: Proxies live bus data from Chalo and normalizes to our schema

import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  fetchChaloData, 
  parseChaloResponse, 
  normalizeToBusSchema, 
  generateMockBusData,
  type NormalizedBusData 
} from '../../services/ChaloProxyService';

// NEW: API response structure
interface BusApiResponse {
  success: boolean;
  data: NormalizedBusData[];
  meta: {
    count: number;
    source: 'live' | 'mock' | 'cached';
    timestamp: string;
    errors?: string[];
  };
}

// NEW: Cache to avoid hitting Chalo API too frequently
let busDataCache: {
  data: NormalizedBusData[];
  timestamp: number;
  expiry: number;
} | null = null;

const CACHE_DURATION = 30 * 1000; // NEW: 30 seconds cache

// NEW: Step 4: API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BusApiResponse>
) {
  // NEW: Set CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // NEW: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      data: [],
      meta: {
        count: 0,
        source: 'mock',
        timestamp: new Date().toISOString(),
        errors: ['Method not allowed. Use GET.']
      }
    });
  }

  const now = Date.now();
  const errors: string[] = [];

  try {
    // NEW: Check cache first
    if (busDataCache && now < busDataCache.expiry) {
      console.log('[Bus API] Returning cached data');
      return res.status(200).json({
        success: true,
        data: busDataCache.data,
        meta: {
          count: busDataCache.data.length,
          source: 'cached',
          timestamp: new Date(busDataCache.timestamp).toISOString()
        }
      });
    }

    console.log('[Bus API] Cache expired or missing, fetching fresh data');

    try {
      // NEW: Step 5: Fetch live data with error handling
      const rawData = await fetchChaloData();
      console.log(`[Bus API] Fetched ${rawData.length} raw records from Chalo`);

      if (!rawData || rawData.length === 0) {
        throw new Error('No data received from Chalo API');
      }

      // NEW: Parse and normalize the data
      const parsedData = parseChaloResponse(rawData);
      console.log(`[Bus API] Parsed ${parsedData.length} valid records`);

      if (parsedData.length === 0) {
        throw new Error('No valid bus data after parsing');
      }

      const normalizedData = normalizeToBusSchema(parsedData);
      console.log(`[Bus API] Normalized ${normalizedData.length} records`);

      // NEW: Update cache
      busDataCache = {
        data: normalizedData,
        timestamp: now,
        expiry: now + CACHE_DURATION
      };

      // NEW: Return live data
      return res.status(200).json({
        success: true,
        data: normalizedData,
        meta: {
          count: normalizedData.length,
          source: 'live',
          timestamp: new Date().toISOString()
        }
      });

    } catch (chaloError) {
      // NEW: Log the error and add to errors array
      const errorMessage = chaloError instanceof Error ? chaloError.message : 'Unknown Chalo API error';
      console.error('[Bus API] Chalo fetch failed:', errorMessage);
      errors.push(`Chalo API: ${errorMessage}`);

      // NEW: Fall back to mock data
      console.log('[Bus API] Falling back to mock data');
      const mockData = generateMockBusData();

      // NEW: Cache mock data for shorter duration
      busDataCache = {
        data: mockData,
        timestamp: now,
        expiry: now + (CACHE_DURATION / 3) // NEW: Shorter cache for mock data
      };

      return res.status(200).json({
        success: true,
        data: mockData,
        meta: {
          count: mockData.length,
          source: 'mock',
          timestamp: new Date().toISOString(),
          errors
        }
      });
    }

  } catch (error) {
    // NEW: Handle any other unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    console.error('[Bus API] Unexpected error:', errorMessage);
    errors.push(`Server: ${errorMessage}`);

    // NEW: Still try to return mock data as last resort
    try {
      const emergencyMockData = generateMockBusData();
      return res.status(500).json({
        success: false,
        data: emergencyMockData,
        meta: {
          count: emergencyMockData.length,
          source: 'mock',
          timestamp: new Date().toISOString(),
          errors: [...errors, 'Using emergency mock data']
        }
      });
    } catch (mockError) {
      // NEW: Complete failure - return empty response
      return res.status(500).json({
        success: false,
        data: [],
        meta: {
          count: 0,
          source: 'mock',
          timestamp: new Date().toISOString(),
          errors: [...errors, 'Failed to generate mock data']
        }
      });
    }
  }
}

// NEW: Export types for use in other files
export type { BusApiResponse, NormalizedBusData };