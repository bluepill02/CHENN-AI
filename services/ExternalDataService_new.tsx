import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

interface ExternalDataContextType {
  weather: WeatherData | null;
  traffic: TrafficData[];
  publicServices: PublicServiceData[];
  isLoading: boolean;
  lastUpdate: Date | null;
  refreshData: () => void;
  isApiConnected: boolean;
  apiStatus: {
    weather: 'connected' | 'error' | 'loading';
    traffic: 'connected' | 'error' | 'loading';
    services: 'connected' | 'error' | 'loading';
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    weather: 'loading' as 'connected' | 'error' | 'loading',
    traffic: 'loading' as 'connected' | 'error' | 'loading',
    services: 'loading' as 'connected' | 'error' | 'loading'
  });

  // OpenWeatherMap API configuration for real Chennai weather data
  // Using environment variable for API key security
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
  const CHENNAI_QUERY = 'Chennai,IN';

  // Fetch real weather data from OpenWeatherMap API
  const fetchWeatherData = async (): Promise<WeatherData> => {
    try {
      if (!WEATHER_API_KEY) {
        throw new Error('Weather API key not configured');
      }

      const response = await fetch(
        `${WEATHER_API_URL}?q=${CHENNAI_QUERY}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const current = data.main;
      const weather = data.weather[0];
      
      // Map OpenWeatherMap condition to our condition types
      const mapCondition = (main: string): 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy' => {
        switch (main.toLowerCase()) {
          case 'rain':
          case 'drizzle':
          case 'thunderstorm':
            return 'rainy';
          case 'clouds':
            return 'cloudy';
          case 'clear':
            return 'sunny';
          case 'mist':
          case 'smoke':
          case 'haze':
          case 'dust':
          case 'fog':
          case 'sand':
          case 'ash':
          case 'squall':
          case 'tornado':
            return 'partly_cloudy';
          default:
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
          'thunderstorm': 'இடிமின்னல்',
          'mist': 'பனிமூட்டம்',
          'smoke': 'புகைமூட்டம்',
          'haze': 'மங்கலான வானம்',
          'dust': 'தூசிமூட்டம்',
          'fog': 'மூடுபனி',
          'sand': 'மணல் புயல்',
          'ash': 'சாம்பல் மூட்டம்',
          'squall': 'பெருங்காற்று',
          'tornado': 'சூறாவளி'
        };
        
        return descriptions[desc.toLowerCase()] || desc;
      };

      const mappedCondition = mapCondition(weather.main);
      
      return {
        temperature: Math.round(current.temp),
        condition: mappedCondition,
        conditionTamil: mapConditionTamil(mappedCondition),
        description: weather.description,
        descriptionTamil: mapDescriptionTamil(weather.description),
        humidity: current.humidity,
        windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // Convert m/s to km/h
        uvIndex: undefined, // OpenWeatherMap free tier doesn't include UV index
        airQuality: 'moderate', // Default value, would need separate API call
        airQualityTamil: 'மிதமான',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Return fallback data structure with error indication
      throw {
        error: true,
        message: error instanceof Error ? error.message : 'Failed to fetch weather data',
        temperature: 0,
        condition: 'sunny' as const,
        conditionTamil: 'வெயில்',
        description: 'Data unavailable',
        descriptionTamil: 'தகவல் கிடைக்கவில்லை',
        humidity: 0,
        windSpeed: 0,
        airQuality: 'moderate' as const,
        airQualityTamil: 'மிதமான',
        lastUpdated: new Date()
      };
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
      // Fetch real weather data from OpenWeatherMap API
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
      
      // Traffic data (using Mappls-style simulation)
      setApiStatus(prev => ({ ...prev, traffic: 'loading' }));
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
      
      const trafficData = generateTrafficData();
      setTraffic(trafficData);
      setApiStatus(prev => ({ ...prev, traffic: 'connected' }));
      
      // Public services
      setApiStatus(prev => ({ ...prev, services: 'loading' }));
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      
      const servicesData = generatePublicServicesData();
      setPublicServices(servicesData);
      setApiStatus(prev => ({ ...prev, services: 'connected' }));
      
      setLastUpdate(new Date());
      setIsApiConnected(true);
      
    } catch (error) {
      console.error('Error fetching external data:', error);
      
      // Set individual service status based on what failed
      setApiStatus(prev => ({
        weather: prev.weather === 'loading' ? 'error' : prev.weather,
        traffic: prev.traffic === 'loading' ? 'error' : prev.traffic,
        services: prev.services === 'loading' ? 'error' : prev.services
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

  const value: ExternalDataContextType = {
    weather,
    traffic,
    publicServices,
    isLoading,
    lastUpdate,
    refreshData,
    isApiConnected,
    apiStatus
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