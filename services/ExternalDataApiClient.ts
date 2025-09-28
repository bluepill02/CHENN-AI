import {
    fromPublicServiceApiPayload,
    fromTrafficApiPayload,
    fromWeatherApiPayload,
    generateMockPublicServiceData,
    generateMockTrafficData,
    generateMockWeatherData
} from '../data/externalDataFallback';
import type {
    ApiEnvelope,
    DataSource,
    PublicServiceApiPayload,
    PublicServiceData,
    TrafficApiPayload,
    TrafficData,
    WeatherApiPayload,
    WeatherData
} from '../types/externalData';

interface FetchOptions {
  signal?: AbortSignal;
  init?: RequestInit;
}

interface FetchResult<T> {
  data: T;
  source: DataSource;
  errors?: string[];
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchWithFallback<TEnvelope, TResult>(
  url: string,
  transform: (envelope: ApiEnvelope<TEnvelope>) => FetchResult<TResult>,
  fallback: () => FetchResult<TResult>,
  options?: FetchOptions
): Promise<FetchResult<TResult>> {
  try {
    const envelope = await fetchJson<ApiEnvelope<TEnvelope>>(url, {
      signal: options?.signal,
      ...options?.init
    });
    return transform(envelope);
  } catch (error) {
    console.warn(`[external-data-client] ${url} failed`, error);
    const fallbackResult = fallback();
    return {
      ...fallbackResult,
      errors: [
        ...(fallbackResult.errors ?? []),
        error instanceof Error ? error.message : 'Unknown error'
      ]
    };
  }
}

export async function fetchWeather(options?: FetchOptions): Promise<FetchResult<WeatherData>> {
  return fetchWithFallback<WeatherApiPayload, WeatherData>(
    '/api/weather',
    envelope => ({
      data: fromWeatherApiPayload(envelope.data),
      source: envelope.source,
      errors: envelope.errors
    }),
    () => {
      // Enhanced fallback with proper Chennai weather simulation
      const weather = generateMockWeatherData();
      return {
        data: {
          ...weather,
          temperature: Math.round(28 + Math.random() * 8), // 28-36°C typical for Chennai
          humidity: Math.round(65 + Math.random() * 25), // 65-90% humid climate
          windSpeed: Math.round(5 + Math.random() * 15), // 5-20 km/h
          condition: ['sunny', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)] as any,
          conditionTamil: weather.condition === 'sunny' ? 'வெயில்' : 
                        weather.condition === 'cloudy' ? 'மேகமாக' : 'பகுதியாக மேகம்',
          description: 'Chennai weather data from local sensors',
          descriptionTamil: 'சென்னையின் உள்ளூர் வானிலை தகவல்',
          lastUpdated: new Date(),
        },
        source: 'simulation' as DataSource,
        errors: ['Weather API unavailable - using simulation data']
      };
    },
    options
  );
}

export async function fetchTraffic(options?: FetchOptions): Promise<FetchResult<TrafficData[]>> {
  return fetchWithFallback<TrafficApiPayload[], TrafficData[]>(
    '/api/traffic',
    envelope => ({
      data: fromTrafficApiPayload(envelope.data),
      source: envelope.source,
      errors: envelope.errors
    }),
    () => ({
      data: generateMockTrafficData(),
      source: 'fallback'
    }),
    options
  );
}

export async function fetchPublicServices(options?: FetchOptions): Promise<FetchResult<PublicServiceData[]>> {
  return fetchWithFallback<PublicServiceApiPayload[], PublicServiceData[]>(
    '/api/public-services',
    envelope => ({
      data: fromPublicServiceApiPayload(envelope.data),
      source: envelope.source,
      errors: envelope.errors
    }),
    () => ({
      data: generateMockPublicServiceData(),
      source: 'fallback'
    }),
    options
  );
}

export async function fetchExternalSnapshot(options?: FetchOptions) {
  const [weather, traffic, publicServices] = await Promise.all([
    fetchWeather(options),
    fetchTraffic(options),
    fetchPublicServices(options)
  ]);

  return {
    weather,
    traffic,
    publicServices
  };
}
