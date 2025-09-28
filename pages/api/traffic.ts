import type { NextApiRequest, NextApiResponse } from 'next';
import {
    generateMockTrafficData,
    toTrafficApiPayload
} from '../../data/externalDataFallback';
import type { ApiEnvelope, DataSource, TrafficApiPayload, TrafficData } from '../../types/externalData';

interface CachedTraffic {
  expiresAt: number;
  envelope: ApiEnvelope<TrafficApiPayload[]>;
}

const TRAFFIC_CACHE_TTL = 60 * 1000; // 1 minute
const DEFAULT_COORDINATES = { lat: 13.0827, lng: 80.2707 };
const DEFAULT_ZOOM = 12;

let cachedTraffic: CachedTraffic | null = null;

function getEnv(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  return undefined;
}

function deriveStatus(congestion?: number): Pick<TrafficData, 'status' | 'statusTamil'> {
  if (typeof congestion !== 'number') {
    return { status: 'moderate', statusTamil: 'நடுத்தர' };
  }

  if (congestion < 0.3) {
    return { status: 'clear', statusTamil: 'தெளிவு' };
  }
  if (congestion < 0.6) {
    return { status: 'moderate', statusTamil: 'நடுத்தர' };
  }
  if (congestion < 0.8) {
    return { status: 'heavy', statusTamil: 'அதிகம்' };
  }
  return { status: 'blocked', statusTamil: 'தடை' };
}

async function fetchTrafficFromApi(): Promise<{ data: TrafficData[]; source: DataSource; errors?: string[] }> {
  const apiKey = getEnv(['MAPPLS_API_KEY', 'VITE_MAPPLS_API_KEY']);
  if (!apiKey) {
    throw new Error('Mappls API key not configured');
  }

  const { lat, lng } = DEFAULT_COORDINATES;
  const zoom = Number(getEnv(['MAPPLS_TRAFFIC_ZOOM'])) || DEFAULT_ZOOM;
  const response = await fetch(
    `https://apis.mappls.com/advancedmaps/v1/${apiKey}/traffic?center=${lat},${lng}&zoom=${zoom}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Mappls traffic API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  const now = new Date();
  const base = generateMockTrafficData(now);

  const list = Array.isArray(raw?.data) ? raw.data : [];
  return {
    data: base.map((route, index) => {
      const candidate = list[index] ?? {};
      const congestion = typeof candidate.congestion === 'number'
        ? candidate.congestion
        : typeof raw?.traffic?.congestion === 'number'
          ? raw.traffic.congestion
          : undefined;

      const { status, statusTamil } = deriveStatus(congestion);

      let estimatedTime = route.estimatedTime;
      const travelTimeFromApi = candidate?.currentTravelTime ?? candidate?.avg_time ?? candidate?.travelTime;
      if (typeof travelTimeFromApi === 'number' && travelTimeFromApi > 0) {
        estimatedTime = Math.round(travelTimeFromApi);
      }

      const incidents = Array.isArray(candidate?.incidents)
        ? candidate.incidents
            .filter((item: unknown): item is string => typeof item === 'string')
        : route.incidents ?? [];

      return {
        ...route,
        status,
        statusTamil,
        estimatedTime,
        incidents,
        lastUpdated: now
      };
    }),
    source: 'live'
  };
}

function buildEnvelope(
  data: TrafficData[],
  source: DataSource,
  errors?: string[]
): ApiEnvelope<TrafficApiPayload[]> {
  return {
    success: true,
    data: toTrafficApiPayload(data),
    source,
    timestamp: new Date().toISOString(),
    errors
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiEnvelope<TrafficApiPayload[]>>
) {
  res.setHeader('Cache-Control', 'public, max-age=30');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    const fallback = generateMockTrafficData();
    return res.status(405).json({
      success: false,
      data: toTrafficApiPayload(fallback),
      source: 'fallback',
      timestamp: new Date().toISOString(),
      errors: ['Method not allowed. Use GET.']
    });
  }

  const now = Date.now();
  if (cachedTraffic && now < cachedTraffic.expiresAt) {
    return res.status(200).json(cachedTraffic.envelope);
  }

  try {
    const { data, source } = await fetchTrafficFromApi();
    const envelope = buildEnvelope(data, source);
    cachedTraffic = {
      expiresAt: now + TRAFFIC_CACHE_TTL,
      envelope
    };
    return res.status(200).json(envelope);
  } catch (error) {
    console.warn('[traffic-api] Falling back to mock traffic:', error);
    const fallbackTraffic = generateMockTrafficData();
    const errors = [
      error instanceof Error ? error.message : 'Unknown traffic API error'
    ];
    const envelope = buildEnvelope(fallbackTraffic, 'fallback', errors);
    cachedTraffic = {
      expiresAt: now + TRAFFIC_CACHE_TTL / 2,
      envelope
    };
    return res.status(200).json(envelope);
  }
}
