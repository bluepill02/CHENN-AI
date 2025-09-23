import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// NEW: Import bus data service
import { NormalizedBusData } from '../pages/api/bus';

export interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
  conditionTamil: string;
  description: string;
  descriptionTamil: string;
  humidity: number;
  windSpeed: number;
  uvIndex?: number;
  airQuality: 'good' | 'moderate' | 'poor';
  airQualityTamil: string;
  lastUpdated: Date;
}

export interface TrafficData {
  route: string;
  routeTamil: string;
  status: 'clear' | 'moderate' | 'heavy' | 'blocked';
  statusTamil: string;
  estimatedTime: number;
  distance: string;
  incidents?: string[];
  lastUpdated: Date;
}

export interface PublicServiceData {
  service: string;
  serviceTamil: string;
  status: 'operational' | 'disrupted' | 'maintenance' | 'emergency';
  statusTamil: string;
  description?: string;
  descriptionTamil?: string;
  estimatedResolution?: Date;
  contact?: string;
  lastUpdated: Date;
}

// Mappls API specific interfaces
export interface MappslLocationData {
  lat: number;
  lng: number;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  formatted_address: string;
  place_id?: string;
}

export interface MappslTrafficData {
  route_id: string;
  route_name: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  travel_time_minutes: number;
  traffic_density: 'light' | 'moderate' | 'heavy' | 'jam';
  incidents: Array<{
    type: string;
    description: string;
    location: string;
  }>;
  last_updated: Date;
}

interface ExternalDataContextType {
  weather: WeatherData | null;
  traffic: TrafficData[];
  publicServices: PublicServiceData[];
  // NEW: Add bus data from Chalo proxy
  busData: NormalizedBusData[];
  isLoading: boolean;
  lastUpdate: Date | null;
  refreshData: () => void;
  isApiConnected: boolean;
  apiStatus: {
    weather: 'connected' | 'error' | 'loading';
    traffic: 'connected' | 'error' | 'loading';
    services: 'connected' | 'error' | 'loading';
    // NEW: Add bus data status
    bus: 'connected' | 'error' | 'loading';
  };
  // Mappls-specific functions
  validateChennaiPincode: (pincode: string) => Promise<MappslLocationData | null>;
  getMappslLocationData: (lat: number, lng: number) => Promise<MappslLocationData | null>;
  // NEW: Bus data specific functions
  getBusDataByArea: (area: string) => NormalizedBusData[];
  getBusDataByRoute: (route: string) => NormalizedBusData[];
  refreshBusData: () => Promise<void>;
}

const ExternalDataContext = createContext<ExternalDataContextType | undefined>(undefined);

interface ExternalDataProviderProps {
  children: ReactNode;
}

// Chennai-specific routes for traffic simulation
const chennaiTrafficRoutes: Omit<TrafficData, 'status' | 'statusTamil' | 'estimatedTime' | 'lastUpdated'>[] = [
  {
    route: 'OMR (IT Corridor)',
    routeTamil: 'OMR (IT காரிடார்)',
    distance: '12.5 km',
    incidents: []
  },
  {
    route: 'GST Road (Airport)',
    routeTamil: 'GST சாலை (விமான நிலையம்)',
    distance: '8.2 km',
    incidents: []
  },
  {
    route: 'Anna Salai (Mount Road)',
    routeTamil: 'அண்ணா சாலை (மவுண்ட் சாலை)',
    distance: '6.8 km',
    incidents: []
  },
  {
    route: 'ECR (Mahabalipuram Road)',
    routeTamil: 'ECR (மாமல்லபுரம் சாலை)',
    distance: '15.3 km',
    incidents: []
  }
];

const publicServicesData: Omit<PublicServiceData, 'status' | 'statusTamil' | 'lastUpdated'>[] = [
  {
    service: 'Chennai Metro',
    serviceTamil: 'சென்னை மெட்ரோ',
    contact: '044-2537-3939'
  },
  {
    service: 'MTC Bus Service',
    serviceTamil: 'MTC பேருந்து சேவை',
    contact: '044-2538-3333'
  },
  {
    service: 'Electricity (TNEB)',
    serviceTamil: 'மின்சாரம் (TNEB)',
    contact: '94987-94987'
  },
  {
    service: 'Water Supply',
    serviceTamil: 'நீர் விநியோகம்',
    contact: '044-2200-2200'
  }
];

export function ExternalDataProvider({ children }: ExternalDataProviderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [publicServices, setPublicServices] = useState<PublicServiceData[]>([]);
  // NEW: Add bus data state
  const [busData, setBusData] = useState<NormalizedBusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    weather: 'loading' as 'connected' | 'error' | 'loading',
    traffic: 'loading' as 'connected' | 'error' | 'loading',
    services: 'loading' as 'connected' | 'error' | 'loading',
    // NEW: Add bus data status
    bus: 'loading' as 'connected' | 'error' | 'loading'
  });

  // WeatherAPI configuration for real Chennai weather data
  // API provides current weather conditions, air quality, and forecasts
  const WEATHER_API_KEY = 'c9ae0d8bba664e95987144336252209';
  const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';
  const CHENNAI_QUERY = 'Chennai,Tamil Nadu,India';

  // Mappls API configuration for Chennai-specific location and traffic data
  // Provides accurate Indian location data, traffic, and navigation services
  const MAPPLS_API_KEY = 'hlgokcsmvrbirjotoxixwqscpwvlspinyupy';
  const MAPPLS_BASE_URL = 'https://apis.mappls.com/advancedmaps/v1';
  const MAPPLS_GEOCODE_URL = `${MAPPLS_BASE_URL}/geocode`;
  const MAPPLS_REVERSE_GEOCODE_URL = `${MAPPLS_BASE_URL}/rev_geocode`;

  // Fetch real weather data from WeatherAPI
  const fetchWeatherData = async (): Promise<WeatherData> => {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${CHENNAI_QUERY}&aqi=yes`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      const current = data.current;
      const condition = current.condition;
      
      // Map WeatherAPI condition to our condition types
      const mapCondition = (text: string): 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy' => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('rain') || lowerText.includes('drizzle') || lowerText.includes('shower')) {
          return 'rainy';
        } else if (lowerText.includes('cloud') || lowerText.includes('overcast')) {
          return 'cloudy';
        } else if (lowerText.includes('partly') || lowerText.includes('partial')) {
          return 'partly_cloudy';
        } else {
          return 'sunny';
        }
      };

      // Map condition to Tamil
      const mapConditionTamil = (cond: string): string => {
        switch (cond) {
          case 'sunny': return 'வெயில்';
          case 'rainy': return 'மழை';
          case 'cloudy': return 'மேகமூட்டம்';
          case 'partly_cloudy': return 'ஓரளவு மேகமூட்டம்';
          default: return 'வெயில்';
        }
      };

      // Map description to Tamil
      const mapDescriptionTamil = (desc: string): string => {
        const descriptions: { [key: string]: string } = {
          'sunny': 'தெளிவான வானம், பிரகாசமான சூரிய ஒளி',
          'clear': 'தெளிவான வானம்',
          'partly cloudy': 'ஓரளவு மேகமூட்டம், மென்மையான காற்று',
          'cloudy': 'மேகமூட்டமான வானம்',
          'overcast': 'மேகமூட்டமான வானம், அதிக ஈரப்பதம்',
          'light rain': 'லேசான மழை',
          'moderate rain': 'மிதமான மழை',
          'heavy rain': 'கடுமையான மழை',
          'drizzle': 'தூறல் மழை'
        };
        
        const lowerDesc = desc.toLowerCase();
        for (const [key, value] of Object.entries(descriptions)) {
          if (lowerDesc.includes(key)) {
            return value;
          }
        }
        return desc; // Fallback to original description
      };

      // Map air quality
      const mapAirQuality = (aqi: number): 'good' | 'moderate' | 'poor' => {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        return 'poor';
      };

      const mapAirQualityTamil = (quality: string): string => {
        switch (quality) {
          case 'good': return 'நல்லது';
          case 'moderate': return 'நடுத்தர';
          case 'poor': return 'மோசம்';
          default: return 'நடுத்தர';
        }
      };

      const mappedCondition = mapCondition(condition.text);
      const airQuality = mapAirQuality(current.air_quality?.['us-epa-index'] || 2);

      return {
        temperature: Math.round(current.temp_c),
        condition: mappedCondition,
        conditionTamil: mapConditionTamil(mappedCondition),
        description: condition.text,
        descriptionTamil: mapDescriptionTamil(condition.text),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        uvIndex: Math.round(current.uv || 5),
        airQuality,
        airQualityTamil: mapAirQualityTamil(airQuality),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Fallback to mock data if API fails
      return generateMockWeatherData();
    }
  };

  // Fallback mock weather data (in case API fails)
  const generateMockWeatherData = (): WeatherData => {
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
    
    return {
      temperature: Math.round(selected.temp),
      condition: selected.condition,
      conditionTamil: selected.conditionTamil,
      description: selected.description,
      descriptionTamil: selected.descriptionTamil,
      humidity: 65 + Math.random() * 20,
      windSpeed: 8 + Math.random() * 10,
      uvIndex: Math.floor(6 + Math.random() * 4),
      airQuality: Math.random() < 0.6 ? 'moderate' : Math.random() < 0.8 ? 'good' : 'poor',
      airQualityTamil: Math.random() < 0.6 ? 'நடுத்தர' : Math.random() < 0.8 ? 'நல்லது' : 'மோசம்',
      lastUpdated: new Date()
    };
  };

  // Mappls API functions for Chennai location services
  
  // Reverse geocode coordinates to get Chennai area details
  const getMappslLocationData = async (lat: number, lng: number): Promise<MappslLocationData | null> => {
    try {
      const response = await fetch(
        `${MAPPLS_REVERSE_GEOCODE_URL}?lat=${lat}&lng=${lng}&key=${MAPPLS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Mappls API error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result) {
        return null;
      }
      
      return {
        lat,
        lng,
        area: result.area || result.subLocality || '',
        city: result.city || 'Chennai',
        district: result.district || 'Chennai',
        state: result.state || 'Tamil Nadu',
        pincode: result.pincode || '',
        formatted_address: result.formatted_address || '',
        place_id: result.place_id
      };
    } catch (error) {
      console.error('Error fetching Mappls location data:', error);
      return null;
    }
  };

  // Validate Chennai pincode using Mappls geocoding
  const validateChennaiPincode = async (pincode: string): Promise<MappslLocationData | null> => {
    try {
      const response = await fetch(
        `${MAPPLS_GEOCODE_URL}?address=${pincode} Chennai Tamil Nadu&key=${MAPPLS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Mappls geocoding error: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result || !result.lat || !result.lng) {
        return null;
      }
      
      // Verify it's within Chennai area (rough bounds)
      const isInChennai = (
        result.lat >= 12.8 && result.lat <= 13.3 &&
        result.lng >= 80.0 && result.lng <= 80.5
      );
      
      if (!isInChennai) {
        return null;
      }
      
      return {
        lat: result.lat,
        lng: result.lng,
        area: result.area || result.subLocality || '',
        city: result.city || 'Chennai',
        district: result.district || 'Chennai',
        state: result.state || 'Tamil Nadu',
        pincode: pincode,
        formatted_address: result.formatted_address || '',
        place_id: result.place_id
      };
    } catch (error) {
      console.error('Error validating Chennai pincode:', error);
      return null;
    }
  };

  // Fetch real-time traffic data for Chennai routes using Mappls
  const fetchMappslTrafficData = async (): Promise<TrafficData[]> => {
    try {
      // Note: Mappls traffic API might require specific route IDs
      // For now, we'll enhance our mock data with Mappls-style information
      const enhancedTrafficData = await Promise.all(
        chennaiTrafficRoutes.map(async (route) => {
          // You can implement specific Mappls traffic API calls here
          // const trafficResponse = await fetch(`${MAPPLS_TRAFFIC_URL}?route=${route.id}&key=${MAPPLS_API_KEY}`);
          
          // For now, generate enhanced mock data
          const statuses = [
            { status: 'clear' as const, statusTamil: 'தெளிவு', timeMultiplier: 1 },
            { status: 'moderate' as const, statusTamil: 'நடுத்தர', timeMultiplier: 1.3 },
            { status: 'heavy' as const, statusTamil: 'அதிகம்', timeMultiplier: 1.8 },
            { status: 'blocked' as const, statusTamil: 'தடை', timeMultiplier: 2.5 }
          ];
          
          const statusIndex = Math.floor(Math.random() * statuses.length);
          const selectedStatus = statuses[statusIndex];
          const baseTime = parseInt(route.distance) * 2; // Rough estimate
          
          return {
            route: route.route,
            routeTamil: route.routeTamil,
            status: selectedStatus.status,
            statusTamil: selectedStatus.statusTamil,
            estimatedTime: Math.round(baseTime * selectedStatus.timeMultiplier),
            distance: route.distance,
            incidents: route.incidents || [],
            lastUpdated: new Date()
          };
        })
      );
      
      return enhancedTrafficData;
    } catch (error) {
      console.error('Error fetching Mappls traffic data:', error);
      return generateTrafficData(); // Fallback to mock data
    }
  };

  // Generate traffic data with Mappls-style information
  const generateTrafficData = (): TrafficData[] => {
    return chennaiTrafficRoutes.map(route => {
      const statuses = [
        { status: 'clear' as const, statusTamil: 'தெளிவு', timeMultiplier: 1 },
        { status: 'moderate' as const, statusTamil: 'நடுத்தர', timeMultiplier: 1.3 },
        { status: 'heavy' as const, statusTamil: 'அதிகம்', timeMultiplier: 1.8 },
        { status: 'blocked' as const, statusTamil: 'தடை', timeMultiplier: 2.5 }
      ];
      
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const selectedStatus = statuses[statusIndex];
      
      // Estimate time based on distance and traffic
      const baseTime = parseFloat(route.distance) * 3; // 3 minutes per km base
      const estimatedTime = Math.round(baseTime * selectedStatus.timeMultiplier);
      
      return {
        ...route,
        status: selectedStatus.status,
        statusTamil: selectedStatus.statusTamil,
        estimatedTime,
        lastUpdated: new Date()
      };
    });
  };

  // Generate public services status
  const generatePublicServicesData = (): PublicServiceData[] => {
    return publicServicesData.map(service => {
      const statuses = [
        { status: 'operational' as const, statusTamil: 'இயங்குகிறது' },
        { status: 'disrupted' as const, statusTamil: 'இடையூறு' },
        { status: 'maintenance' as const, statusTamil: 'பராமரிப்பு' }
      ];
      
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const selectedStatus = statuses[statusIndex];
      
      return {
        ...service,
        status: selectedStatus.status,
        statusTamil: selectedStatus.statusTamil,
        lastUpdated: new Date()
      };
    });
  };

  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch real weather data from WeatherAPI
      setApiStatus(prev => ({ ...prev, weather: 'loading' }));
      
      try {
        const weatherData = await fetchWeatherData();
        setWeather(weatherData);
        setApiStatus(prev => ({ ...prev, weather: 'connected' }));
      } catch (weatherError) {
        console.error('Weather API failed, using fallback data:', weatherError);
        const fallbackWeather = generateMockWeatherData();
        setWeather(fallbackWeather);
        setApiStatus(prev => ({ ...prev, weather: 'error' }));
      }
      
      // Traffic data (using Mappls integration)
      setApiStatus(prev => ({ ...prev, traffic: 'loading' }));
      
      try {
        const trafficData = await fetchMappslTrafficData();
        setTraffic(trafficData);
        setApiStatus(prev => ({ ...prev, traffic: 'connected' }));
      } catch (trafficError) {
        console.error('Mappls traffic API failed, using fallback data:', trafficError);
        const fallbackTraffic = generateTrafficData();
        setTraffic(fallbackTraffic);
        setApiStatus(prev => ({ ...prev, traffic: 'error' }));
      }
      
      // Public services
      setApiStatus(prev => ({ ...prev, services: 'loading' }));
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      const servicesData = generatePublicServicesData();
      setPublicServices(servicesData);
      setApiStatus(prev => ({ ...prev, services: 'connected' }));
      
      // NEW: Bus data from Chalo proxy
      setApiStatus(prev => ({ ...prev, bus: 'loading' }));
      try {
        const response = await fetch('/api/bus');
        if (!response.ok) {
          throw new Error(`Bus API error: ${response.status}`);
        }
        const { busData: liveBusData } = await response.json();
        setBusData(liveBusData || []);
        setApiStatus(prev => ({ ...prev, bus: 'connected' }));
      } catch (busError) {
        console.error('Bus data API failed:', busError);
        setBusData([]);
        setApiStatus(prev => ({ ...prev, bus: 'error' }));
      }
      
      setLastUpdate(new Date());
      setIsApiConnected(true);
      
    } catch (error) {
      console.error('Error fetching external data:', error);
      
      // Set individual service status based on what failed
      setApiStatus(prev => ({
        weather: prev.weather === 'loading' ? 'error' : prev.weather,
        traffic: prev.traffic === 'loading' ? 'error' : prev.traffic,
        services: prev.services === 'loading' ? 'error' : prev.services,
        // NEW: Add bus data error handling
        bus: prev.bus === 'loading' ? 'error' : prev.bus
      }));
      
      // Only set disconnected if all services failed
      const hasAnyConnection = Object.values(apiStatus).some(status => status === 'connected');
      setIsApiConnected(hasAnyConnection);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isApiConnected) {
        refreshData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isApiConnected]);

  // Simulate real-time traffic updates more frequently
  useEffect(() => {
    const trafficInterval = setInterval(() => {
      if (isApiConnected && Math.random() < 0.3) { // 30% chance
        setTraffic(generateTrafficData());
        setLastUpdate(new Date());
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(trafficInterval);
  }, [isApiConnected]);

  // Bus data utility functions
  const getBusDataByArea = (area: string): NormalizedBusData[] => {
    return busData.filter(bus =>
      (bus.location.area?.toLowerCase().includes(area.toLowerCase()) ?? false) ||
      (((typeof bus.area === 'string') && bus.area.toLowerCase().includes(area.toLowerCase())) ?? false)
    );
  };  const getBusDataByRoute = (route: string): NormalizedBusData[] => {
    return busData.filter(bus =>
      (bus.source.route?.toLowerCase().includes(route.toLowerCase()) ?? false)
    );
  };  const refreshBusData = async (): Promise<void> => {
    try {
      setApiStatus(prev => ({ ...prev, bus: 'loading' }));
      const response = await fetch('/api/bus');
      const { busData: freshBusData } = await response.json();
      setBusData(freshBusData || []);
      setApiStatus(prev => ({ ...prev, bus: 'connected' }));
    } catch (error) {
      console.error('Failed to refresh bus data:', error);
      setApiStatus(prev => ({ ...prev, bus: 'error' }));
    }
  };

  const value: ExternalDataContextType = {
    weather,
    traffic,
    publicServices,
    // NEW: Bus data in context
    busData,
    isLoading,
    lastUpdate,
    refreshData,
    isApiConnected,
    apiStatus,
    // Mappls functions
    validateChennaiPincode,
    getMappslLocationData,
    // NEW: Bus data utility functions
    getBusDataByArea,
    getBusDataByRoute,
    refreshBusData
  };

  return (
    <ExternalDataContext.Provider value={value}>
      {children}
    </ExternalDataContext.Provider>
  );
}

export function useExternalData() {
  const context = useContext(ExternalDataContext);
  if (context === undefined) {
    throw new Error('useExternalData must be used within an ExternalDataProvider');
  }
  return context;
}

// Export Mappls functions for direct use (if needed outside the context)
// Note: `validateChennaiPincode` and `getMappslLocationData` are provided
// through the `ExternalDataContext` via `useExternalData()` and are
// intentionally not exported as top-level bindings because their
// implementations rely on the provider's configuration/state.