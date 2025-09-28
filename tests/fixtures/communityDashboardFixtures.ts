import type { PublicServiceApiPayload, TrafficApiPayload, WeatherApiPayload } from '../../types/externalData';

export interface BusByPincodePayload {
  pincode: string;
  stops: string[];
  twitterQueries: string[];
}

export interface TimetableFrequencyPayload {
  time: string;
  interval: string;
  intervalTamil: string;
}

export interface TimetableEntryPayload {
  line: string;
  lineTamil: string;
  from: string;
  fromTamil: string;
  to: string;
  toTamil: string;
  firstTrain: string;
  lastTrain: string;
  frequencies: TimetableFrequencyPayload[];
}

export interface TimetablePayload {
  weekdays: {
    blueLine: TimetableEntryPayload[];
    greenLine: TimetableEntryPayload[];
  };
}

export const buildWeatherApiPayload = (
  overrides: Partial<WeatherApiPayload> = {}
): WeatherApiPayload => ({
  temperature: 31,
  condition: 'sunny',
  conditionTamil: 'வெயில்',
  description: 'Bright and clear with a gentle breeze',
  descriptionTamil: 'பிரகாசமான வானம், மென்மையான காற்று',
  humidity: 62,
  windSpeed: 12,
  uvIndex: 7,
  airQuality: 'moderate',
  airQualityTamil: 'நடுத்தர',
  lastUpdated: new Date('2024-05-01T04:30:00Z').toISOString(),
  ...overrides,
});

export const buildTrafficApiPayload = (
  overrides: Partial<TrafficApiPayload>[] = []
): TrafficApiPayload[] => {
  const base: TrafficApiPayload[] = [
    {
      route: 'Anna Salai',
      routeTamil: 'அண்ணா சாலை',
      status: 'moderate',
      statusTamil: 'நடுத்தர',
      estimatedTime: 18,
      distance: '6.5 km',
      incidents: ['Metro construction slowdowns'],
      lastUpdated: new Date('2024-05-01T04:25:00Z').toISOString(),
    },
    {
      route: 'OMR IT Corridor',
      routeTamil: 'OMR ஐடி காரிடார்',
      status: 'heavy',
      statusTamil: 'அதிகம்',
      estimatedTime: 28,
      distance: '9.2 km',
      incidents: ['Peak hour congestion'],
      lastUpdated: new Date('2024-05-01T04:20:00Z').toISOString(),
    },
  ];

  return base.map((entry, index) => ({
    ...entry,
    ...(overrides[index] ?? {}),
  }));
};

export const buildPublicServiceApiPayload = (
  overrides: Partial<PublicServiceApiPayload>[] = []
): PublicServiceApiPayload[] => {
  const base: PublicServiceApiPayload[] = [
    {
      service: 'Chennai Metro',
      serviceTamil: 'சென்னை மெட்ரோ',
      status: 'operational',
      statusTamil: 'இயங்குகிறது',
      description: 'All lines running on schedule',
      descriptionTamil: 'அனைத்து வழித்தடங்களும் நேரத்திற்கு',
      estimatedResolution: undefined,
      contact: '044-2537-3939',
      lastUpdated: new Date('2024-05-01T04:15:00Z').toISOString(),
      serviceCode: 'metro',
    },
    {
      service: 'MTC Bus Service',
      serviceTamil: 'MTC பேருந்து சேவை',
      status: 'maintenance',
      statusTamil: 'பராமரிப்பு',
      description: 'Depot level checks causing 10 min delays',
      descriptionTamil: '10 நிமிட தாமதத்தை ஏற்படுத்தும் பராமரிப்பு',
      estimatedResolution: 'Expected by 11:30 AM',
      contact: '044-2538-3333',
      lastUpdated: new Date('2024-05-01T04:10:00Z').toISOString(),
      serviceCode: 'bus',
    },
  ];

  return base.map((entry, index) => ({
    ...entry,
    ...(overrides[index] ?? {}),
  }));
};

export const buildBusByPincodePayload = (
  overrides: Partial<BusByPincodePayload> = {}
): BusByPincodePayload => ({
  pincode: '600004',
  stops: [
    'Kapaleeshwarar Temple Stop',
    'RK Mutt Road Junction',
    'Mylapore Tank',
    'Mandaveli Market',
    'Luz Corner',
  ],
  twitterQueries: ['#ChennaiBus', '#MTCUpdates'],
  ...overrides,
});

export const buildTimetablePayload = (
  overrides: Partial<TimetablePayload> = {}
): TimetablePayload => ({
  weekdays: {
    blueLine: [
      {
        line: 'Blue Line',
        lineTamil: 'ப்ளூ லைன்',
        from: 'Airport',
        fromTamil: 'விமான நிலையம்',
        to: 'Wimco Nagar',
        toTamil: 'விம்கோ நகர்',
        firstTrain: '05:05',
        lastTrain: '23:00',
        frequencies: [
          { time: '06:00 - 10:00', interval: '6 mins', intervalTamil: '6 நிமிடம்' },
          { time: '10:00 - 16:00', interval: '8 mins', intervalTamil: '8 நிமிடம்' },
          { time: '16:00 - 22:00', interval: '5 mins', intervalTamil: '5 நிமிடம்' },
        ],
      },
    ],
    greenLine: [
      {
        line: 'Green Line',
        lineTamil: 'கிரீன் லைன்',
        from: 'Central',
        fromTamil: 'சென்ட்ரல்',
        to: 'St. Thomas Mount',
        toTamil: 'செயின்ட் தோமஸ் மவுண்ட்',
        firstTrain: '05:15',
        lastTrain: '22:45',
        frequencies: [
          { time: '06:00 - 10:00', interval: '7 mins', intervalTamil: '7 நிமிடம்' },
          { time: '10:00 - 16:00', interval: '9 mins', intervalTamil: '9 நிமிடம்' },
          { time: '16:00 - 22:00', interval: '6 mins', intervalTamil: '6 நிமிடம்' },
        ],
      },
    ],
  },
  ...overrides,
});
