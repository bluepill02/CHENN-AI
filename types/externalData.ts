export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
export type AirQuality = 'good' | 'moderate' | 'poor';

export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  conditionTamil: string;
  description: string;
  descriptionTamil: string;
  humidity: number;
  windSpeed: number;
  uvIndex?: number;
  airQuality: AirQuality;
  airQualityTamil: string;
  lastUpdated: Date;
}

export type WeatherApiPayload = Omit<WeatherData, 'lastUpdated'> & { lastUpdated: string };

export type TrafficStatus = 'clear' | 'moderate' | 'heavy' | 'blocked';

export interface TrafficData {
  route: string;
  routeTamil: string;
  status: TrafficStatus;
  statusTamil: string;
  estimatedTime: number;
  distance: string;
  incidents?: string[];
  lastUpdated: Date;
  pincode?: string;
  corridor?: string;
}

export type TrafficApiPayload = Omit<TrafficData, 'lastUpdated'> & { lastUpdated: string };

export type PublicServiceStatus = 'operational' | 'disrupted' | 'maintenance' | 'emergency';

export interface PublicServiceData {
  service: string;
  serviceTamil: string;
  status: PublicServiceStatus;
  statusTamil: string;
  description?: string;
  descriptionTamil?: string;
  estimatedResolution?: string;
  contact?: string;
  lastUpdated: Date;
  serviceCode?: string;
}

export type PublicServiceApiPayload = Omit<PublicServiceData, 'lastUpdated'> & { lastUpdated: string };

export type DataSource = 'live' | 'cached' | 'fallback' | 'mock';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  source: DataSource;
  timestamp: string;
  errors?: string[];
  meta?: Record<string, unknown>;
}

export interface ExternalDataSnapshot {
  weather?: WeatherApiPayload;
  traffic?: TrafficApiPayload[];
  publicServices?: PublicServiceApiPayload[];
}
