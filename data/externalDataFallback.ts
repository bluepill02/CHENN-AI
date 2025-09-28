import type {
    PublicServiceApiPayload,
    PublicServiceData,
    TrafficApiPayload,
    TrafficData,
    WeatherApiPayload,
    WeatherData
} from '../types/externalData';

interface ChennaiTrafficRoute {
  route: string;
  routeTamil: string;
  distance: string;
  incidents?: string[];
  corridor?: string;
}

interface ChennaiPublicService {
  service: string;
  serviceTamil: string;
  contact?: string;
  serviceCode?: string;
}

const CHENNAI_TRAFFIC_ROUTES: ChennaiTrafficRoute[] = [
  {
    route: 'OMR (IT Corridor)',
    routeTamil: 'OMR (IT காரிடார்)',
    distance: '12.5 km',
    incidents: [],
    corridor: 'it-corridor'
  },
  {
    route: 'GST Road (Airport)',
    routeTamil: 'GST சாலை (விமான நிலையம்)',
    distance: '8.2 km',
    incidents: [],
    corridor: 'airport'
  },
  {
    route: 'Anna Salai (Mount Road)',
    routeTamil: 'அண்ணா சாலை (மவுண்ட் சாலை)',
    distance: '6.8 km',
    incidents: [],
    corridor: 'central-business'
  },
  {
    route: 'ECR (Mahabalipuram Road)',
    routeTamil: 'ECR (மாமல்லபுரம் சாலை)',
    distance: '15.3 km',
    incidents: [],
    corridor: 'coastal'
  }
];

const CHENNAI_PUBLIC_SERVICES: ChennaiPublicService[] = [
  {
    service: 'Chennai Metro',
    serviceTamil: 'சென்னை மெட்ரோ',
    contact: '044-2537-3939',
    serviceCode: 'metro'
  },
  {
    service: 'MTC Bus Service',
    serviceTamil: 'MTC பேருந்து சேவை',
    contact: '044-2538-3333',
    serviceCode: 'bus'
  },
  {
    service: 'Electricity (TNEB)',
    serviceTamil: 'மின்சாரம் (TNEB)',
    contact: '94987-94987',
    serviceCode: 'electricity'
  },
  {
    service: 'Water Supply',
    serviceTamil: 'நீர் விநியோகம்',
    contact: '044-2200-2200',
    serviceCode: 'water'
  }
];

export function generateMockWeatherData(now: Date = new Date()): WeatherData {
  const conditions = [
    {
      condition: 'sunny' as const,
      conditionTamil: 'வெயில்',
      temp: 32 + Math.random() * 6,
      description: 'Clear skies with bright sunshine',
      descriptionTamil: 'தெளிவான வானம், பிரகாசமான சூரிய ஒளி'
    },
    {
      condition: 'partly_cloudy' as const,
      conditionTamil: 'ஓரளவு மேகமூட்டம்',
      temp: 30 + Math.random() * 4,
      description: 'Partly cloudy with gentle breeze',
      descriptionTamil: 'ஓரளவு மேகமூட்டம், மென்மையான காற்று'
    },
    {
      condition: 'cloudy' as const,
      conditionTamil: 'மேகமூட்டம்',
      temp: 28 + Math.random() * 3,
      description: 'Overcast with high humidity',
      descriptionTamil: 'மேகமூட்டமான வானம், அதிக ஈரப்பதம்'
    }
  ];

  const selected = conditions[Math.floor(Math.random() * conditions.length)];
  const airQualityOptions = [
    { quality: 'moderate' as const, tamil: 'நடுத்தர' },
    { quality: 'good' as const, tamil: 'நல்லது' },
    { quality: 'poor' as const, tamil: 'மோசம்' }
  ];
  const airQuality = airQualityOptions[Math.floor(Math.random() * airQualityOptions.length)];

  return {
    temperature: Math.round(selected.temp),
    condition: selected.condition,
    conditionTamil: selected.conditionTamil,
    description: selected.description,
    descriptionTamil: selected.descriptionTamil,
    humidity: 65 + Math.random() * 20,
    windSpeed: 8 + Math.random() * 10,
    uvIndex: Math.floor(6 + Math.random() * 4),
    airQuality: airQuality.quality,
    airQualityTamil: airQuality.tamil,
    lastUpdated: now
  };
}

export function generateMockTrafficData(now: Date = new Date()): TrafficData[] {
  return CHENNAI_TRAFFIC_ROUTES.map(route => {
    const statuses = [
      { status: 'clear' as const, statusTamil: 'தெளிவு', timeMultiplier: 1 },
      { status: 'moderate' as const, statusTamil: 'நடுத்தர', timeMultiplier: 1.3 },
      { status: 'heavy' as const, statusTamil: 'அதிகம்', timeMultiplier: 1.8 },
      { status: 'blocked' as const, statusTamil: 'தடை', timeMultiplier: 2.5 }
    ];

    const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const distanceKm = Number.parseFloat(route.distance);
    const baseTime = Number.isFinite(distanceKm) ? distanceKm * 3 : 20;
    const estimatedTime = Math.round(baseTime * selectedStatus.timeMultiplier);

    return {
      ...route,
      status: selectedStatus.status,
      statusTamil: selectedStatus.statusTamil,
      estimatedTime,
      lastUpdated: now
    };
  });
}

export function generateMockPublicServiceData(now: Date = new Date()): PublicServiceData[] {
  return CHENNAI_PUBLIC_SERVICES.map(service => {
    const statuses = [
      { status: 'operational' as const, statusTamil: 'இயங்குகிறது' },
      { status: 'disrupted' as const, statusTamil: 'இடையூறு' },
      { status: 'maintenance' as const, statusTamil: 'பராமரிப்பு' }
    ];

    const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      ...service,
      status: selectedStatus.status,
      statusTamil: selectedStatus.statusTamil,
      lastUpdated: now
    };
  });
}

export function toWeatherApiPayload(data: WeatherData): WeatherApiPayload {
  return { ...data, lastUpdated: data.lastUpdated.toISOString() };
}

export function toTrafficApiPayload(data: TrafficData[]): TrafficApiPayload[] {
  return data.map(item => ({ ...item, lastUpdated: item.lastUpdated.toISOString() }));
}

export function toPublicServiceApiPayload(data: PublicServiceData[]): PublicServiceApiPayload[] {
  return data.map(item => ({ ...item, lastUpdated: item.lastUpdated.toISOString() }));
}

export function fromWeatherApiPayload(payload: WeatherApiPayload): WeatherData {
  return { ...payload, lastUpdated: new Date(payload.lastUpdated) };
}

export function fromTrafficApiPayload(payload: TrafficApiPayload[]): TrafficData[] {
  return payload.map(item => ({ ...item, lastUpdated: new Date(item.lastUpdated) }));
}

export function fromPublicServiceApiPayload(payload: PublicServiceApiPayload[]): PublicServiceData[] {
  return payload.map(item => ({ ...item, lastUpdated: new Date(item.lastUpdated) }));
}

export const ChennaiExternalSeeds = {
  trafficRoutes: CHENNAI_TRAFFIC_ROUTES,
  publicServices: CHENNAI_PUBLIC_SERVICES
};
