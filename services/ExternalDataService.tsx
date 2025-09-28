import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
    generateMockPublicServiceData,
    generateMockTrafficData,
    generateMockWeatherData
} from '../data/externalDataFallback';
import type {
    DataSource,
    PublicServiceData,
    TrafficData,
    WeatherData
} from '../types/externalData';
import {
    fetchPublicServices,
    fetchTraffic,
    fetchWeather
} from './ExternalDataApiClient';

type ApiStatus = 'connected' | 'error' | 'loading';

interface ExternalDataContextType {
  weather: WeatherData | null;
  traffic: TrafficData[];
  publicServices: PublicServiceData[];
  isLoading: boolean;
  lastUpdate: Date | null;
  refreshData: () => void;
  isApiConnected: boolean;
  apiStatus: {
    weather: ApiStatus;
    traffic: ApiStatus;
    services: ApiStatus;
  };
}

const ExternalDataContext = createContext<ExternalDataContextType | undefined>(undefined);

interface ExternalDataProviderProps {
  children: ReactNode;
}

const sourceToStatus = (source: DataSource): ApiStatus =>
  source === 'live' || source === 'cached' ? 'connected' : 'error';

export function ExternalDataProvider({ children }: ExternalDataProviderProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const [publicServices, setPublicServices] = useState<PublicServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    weather: 'loading' as ApiStatus,
    traffic: 'loading' as ApiStatus,
    services: 'loading' as ApiStatus
  });

  const refreshData = async () => {
    setIsLoading(true);
    setApiStatus({ weather: 'loading', traffic: 'loading', services: 'loading' });

    try {
      const [weatherResult, trafficResult, servicesResult] = await Promise.all([
        fetchWeather(),
        fetchTraffic(),
        fetchPublicServices()
      ]);

      setWeather(weatherResult.data);
      setTraffic(trafficResult.data);
      setPublicServices(servicesResult.data);

      setApiStatus({
        weather: sourceToStatus(weatherResult.source),
        traffic: sourceToStatus(trafficResult.source),
        services: sourceToStatus(servicesResult.source)
      });

      const hasLiveSource = [weatherResult, trafficResult, servicesResult].some(result =>
        result.source === 'live' || result.source === 'cached'
      );
      setIsApiConnected(hasLiveSource);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching external data:', error);
      setApiStatus(prev => ({
        weather: prev.weather === 'loading' ? 'error' : prev.weather,
        traffic: prev.traffic === 'loading' ? 'error' : prev.traffic,
        services: prev.services === 'loading' ? 'error' : prev.services
      }));

      if (!weather) {
        setWeather(generateMockWeatherData());
      }
      if (traffic.length === 0) {
        setTraffic(generateMockTrafficData());
      }
      if (publicServices.length === 0) {
        setPublicServices(generateMockPublicServiceData());
      }
      setIsApiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    void refreshData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (isApiConnected) {
        void refreshData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isApiConnected]);

  // Simulate real-time traffic updates more frequently
  useEffect(() => {
    const trafficInterval = setInterval(() => {
      if (isApiConnected && Math.random() < 0.3) { // 30% chance
        setTraffic(generateMockTrafficData());
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