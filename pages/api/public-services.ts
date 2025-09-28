import type { NextApiRequest, NextApiResponse } from 'next';
import {
    generateMockPublicServiceData,
    toPublicServiceApiPayload
} from '../../data/externalDataFallback';
import type {
    ApiEnvelope,
    DataSource,
    PublicServiceApiPayload,
    PublicServiceData
} from '../../types/externalData';

interface CachedPublicServices {
  expiresAt: number;
  envelope: ApiEnvelope<PublicServiceApiPayload[]>;
}

const SERVICES_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

let cachedPublicServices: CachedPublicServices | null = null;

function getEnv(key: string): string | undefined {
  return process.env[key];
}

const STATUS_MAP: Record<string, PublicServiceData['status']> = {
  operational: 'operational',
  normal: 'operational',
  disrupted: 'disrupted',
  maintenance: 'maintenance',
  emergency: 'emergency',
  outage: 'disrupted'
};

function normalizeStatus(value?: string): PublicServiceData['status'] {
  if (!value) return 'operational';
  const key = value.toLowerCase();
  return STATUS_MAP[key] ?? 'operational';
}

function mapStatusTamil(status: PublicServiceData['status']): string {
  switch (status) {
    case 'operational':
      return 'இயங்குகிறது';
    case 'disrupted':
      return 'இடையூறு';
    case 'maintenance':
      return 'பராமரிப்பு';
    case 'emergency':
    default:
      return 'அவசரம்';
  }
}

async function fetchPublicServicesFromApi(): Promise<{ data: PublicServiceData[]; source: DataSource; errors?: string[] }> {
  const apiUrl = getEnv('CIVIC_SERVICES_API_URL');
  if (!apiUrl) {
    throw new Error('Civic services API URL not configured');
  }

  const response = await fetch(apiUrl, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Civic services API error: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  if (!Array.isArray(raw)) {
    throw new Error('Civic services API returned unexpected payload');
  }

  const now = new Date();
  const mapped: PublicServiceData[] = raw.map(item => {
    const status = normalizeStatus(item.status ?? item.state);
    return {
      service: item.service ?? item.title ?? 'Chennai Service',
      serviceTamil: item.serviceTamil ?? item.titleTamil ?? item.service_ta ?? 'சேவை',
      status,
      statusTamil: item.statusTamil ?? item.status_ta ?? mapStatusTamil(status),
      description: item.description ?? item.message,
      descriptionTamil: item.descriptionTamil ?? item.messageTamil,
      estimatedResolution: item.estimatedResolution ?? item.resolutionTime ?? undefined,
      contact: item.contact ?? item.hotline ?? undefined,
      serviceCode: item.serviceCode ?? item.code,
      lastUpdated: now
    };
  });

  return {
    data: mapped,
    source: 'live'
  };
}

function buildEnvelope(
  data: PublicServiceData[],
  source: DataSource,
  errors?: string[]
): ApiEnvelope<PublicServiceApiPayload[]> {
  return {
    success: true,
    data: toPublicServiceApiPayload(data),
    source,
    timestamp: new Date().toISOString(),
    errors
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiEnvelope<PublicServiceApiPayload[]>>
) {
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    const fallback = generateMockPublicServiceData();
    return res.status(405).json({
      success: false,
      data: toPublicServiceApiPayload(fallback),
      source: 'fallback',
      timestamp: new Date().toISOString(),
      errors: ['Method not allowed. Use GET.']
    });
  }

  const now = Date.now();
  if (cachedPublicServices && now < cachedPublicServices.expiresAt) {
    return res.status(200).json(cachedPublicServices.envelope);
  }

  try {
    const { data, source } = await fetchPublicServicesFromApi();
    const envelope = buildEnvelope(data, source);
    cachedPublicServices = {
      expiresAt: now + SERVICES_CACHE_TTL,
      envelope
    };
    return res.status(200).json(envelope);
  } catch (error) {
    console.warn('[civic-services-api] Falling back to mock services:', error);
    const fallbackServices = generateMockPublicServiceData();
    const errors = [
      error instanceof Error ? error.message : 'Unknown civic services API error'
    ];
    const envelope = buildEnvelope(fallbackServices, 'fallback', errors);
    cachedPublicServices = {
      expiresAt: now + SERVICES_CACHE_TTL / 2,
      envelope
    };
    return res.status(200).json(envelope);
  }
}
