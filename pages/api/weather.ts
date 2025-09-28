import type { NextApiRequest, NextApiResponse } from 'next';
import {
    generateMockWeatherData,
    toWeatherApiPayload
} from '../../data/externalDataFallback';
import type { ApiEnvelope, DataSource, WeatherApiPayload, WeatherData } from '../../types/externalData';

interface CachedWeather {
  expiresAt: number;
  envelope: ApiEnvelope<WeatherApiPayload>;
}

const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_QUERY = 'Chennai';
const DEFAULT_AQI = 'yes';

let cachedWeather: CachedWeather | null = null;

function getEnv(keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  return undefined;
}

function mapCondition(conditionText: string): WeatherData['condition'] {
  const lower = conditionText.toLowerCase();
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) {
    return 'rainy';
  }
  if (lower.includes('cloud') && !lower.includes('partly')) {
    return 'cloudy';
  }
  if (lower.includes('clear') || lower.includes('sunny')) {
    return 'sunny';
  }
  return 'partly_cloudy';
}

function mapConditionTamil(condition: WeatherData['condition']): string {
  switch (condition) {
    case 'sunny':
      return 'வெயில்';
    case 'rainy':
      return 'மழை';
    case 'cloudy':
      return 'மேகமூட்டம்';
    case 'partly_cloudy':
    default:
      return 'ஓரளவு மேகமூட்டம்';
  }
}

function mapDescriptionTamil(description: string): string {
  const lookup: Record<string, string> = {
    'clear sky': 'தெளிவான வானம்',
    'few clouds': 'சில மேகங்கள்',
    'scattered clouds': 'சிதறிய மேகங்கள்',
    'broken clouds': 'உடைந்த மேகங்கள்',
    'overcast clouds': 'மேகமூட்டமான வானம்',
    'light rain': 'லேசான மழை',
    'moderate rain': 'மிதமான மழை',
    'heavy intensity rain': 'கடுமையான மழை',
    'very heavy rain': 'மிகக் கடுமையான மழை',
    'extreme rain': 'அதிக கடுமையான மழை',
    'freezing rain': 'உறைந்த மழை',
    'light intensity shower rain': 'லேசான தூறல்',
    'shower rain': 'தூறல் மழை',
    'heavy intensity shower rain': 'கடுமையான தூறல்',
    'ragged shower rain': 'சீரற்ற தூறல்',
    thunderstorm: 'இடிமின்னல்',
    mist: 'பனிமூட்டம்',
    smoke: 'புகைமூட்டம்',
    haze: 'மங்கலான வானம்',
    dust: 'தூசிமூட்டம்',
    fog: 'மூடுபனி',
    sand: 'மணல் புயல்',
    ash: 'சாம்பல் மூட்டம்',
    squall: 'பெருங்காற்று',
    tornado: 'சூறாவளி'
  };

  const key = description.toLowerCase();
  return lookup[key] ?? description;
}

function mapAirQuality(epaIndex: number): WeatherData['airQuality'] {
  if (epaIndex <= 3) return 'good';
  if (epaIndex <= 6) return 'moderate';
  return 'poor';
}

function mapAirQualityTamil(quality: WeatherData['airQuality']): string {
  switch (quality) {
    case 'good':
      return 'நல்லது';
    case 'moderate':
      return 'நடுத்தர';
    case 'poor':
    default:
      return 'மோசம்';
  }
}

async function fetchWeatherFromApi(): Promise<{ data: WeatherData; source: DataSource; errors?: string[] }> {
  const apiKey = getEnv(['WEATHER_API_KEY', 'VITE_WEATHER_API_KEY']);
  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  const apiUrl = getEnv(['WEATHER_API_URL']) ?? 'https://api.weatherapi.com/v1/current.json';
  const query = getEnv(['WEATHER_API_QUERY']) ?? DEFAULT_QUERY;
  const response = await fetch(
    `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(query)}&aqi=${DEFAULT_AQI}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const current = payload.current;
  const conditionText: string = current?.condition?.text ?? 'Sunny';
  const mappedCondition = mapCondition(conditionText);
  const airQualityIndex = current?.air_quality?.['us-epa-index'] ?? 3;
  const mappedAirQuality = mapAirQuality(Number(airQualityIndex));

  const weather: WeatherData = {
    temperature: Math.round(current?.temp_c ?? current?.temp_f ?? 32),
    condition: mappedCondition,
    conditionTamil: mapConditionTamil(mappedCondition),
    description: conditionText,
    descriptionTamil: mapDescriptionTamil(conditionText),
    humidity: Number.isFinite(current?.humidity) ? current.humidity : 0,
    windSpeed: Math.round(current?.wind_kph ?? 0),
    uvIndex: Math.round(current?.uv ?? 5),
    airQuality: mappedAirQuality,
    airQualityTamil: mapAirQualityTamil(mappedAirQuality),
    lastUpdated: new Date()
  };

  return { data: weather, source: 'live' };
}

function buildEnvelope(
  data: WeatherData,
  source: DataSource,
  errors?: string[]
): ApiEnvelope<WeatherApiPayload> {
  return {
    success: true,
    data: toWeatherApiPayload(data),
    source,
    timestamp: new Date().toISOString(),
    errors
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiEnvelope<WeatherApiPayload>>
) {
  res.setHeader('Cache-Control', 'public, max-age=60');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      data: toWeatherApiPayload(generateMockWeatherData()),
      source: 'fallback',
      timestamp: new Date().toISOString(),
      errors: ['Method not allowed. Use GET.']
    });
  }

  const now = Date.now();
  if (cachedWeather && now < cachedWeather.expiresAt) {
    return res.status(200).json(cachedWeather.envelope);
  }

  try {
    const { data, source } = await fetchWeatherFromApi();
    const envelope = buildEnvelope(data, source);
    cachedWeather = {
      expiresAt: now + WEATHER_CACHE_TTL,
      envelope
    };
    return res.status(200).json(envelope);
  } catch (error) {
    console.warn('[weather-api] Falling back to mock weather:', error);
    const fallbackWeather = generateMockWeatherData();
    const errors = [
      error instanceof Error ? error.message : 'Unknown weather API error'
    ];
    const envelope = buildEnvelope(fallbackWeather, 'fallback', errors);
    cachedWeather = {
      expiresAt: now + WEATHER_CACHE_TTL / 2,
      envelope
    };
    return res.status(200).json(envelope);
  }
}
