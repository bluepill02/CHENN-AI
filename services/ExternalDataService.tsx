import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { GroqDataService, WeatherData, BusRoute, TrafficData, TempleInfo, NewsItem } from './GroqDataService';
import { DuckDuckGoService } from './DuckDuckGoService';
import { DataCache, CACHE_DURATION } from '../utils/DataCache';

interface ExternalDataContextType {
  weather: WeatherData | null;
  traffic: TrafficData | null;
  busRoutes: BusRoute[];
  temples: TempleInfo[];
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refreshData: () => Promise<void>;
}

const ExternalDataContext = createContext<ExternalDataContextType | undefined>(undefined);

export function ExternalDataProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [temples, setTemples] = useState<TempleInfo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first for the entire dashboard
      const cachedDashboard = DataCache.get<any>('dashboard', CACHE_DURATION.DASHBOARD);

      if (cachedDashboard) {
        setWeather(cachedDashboard.weather);
        setTraffic(cachedDashboard.traffic);
        setBusRoutes(cachedDashboard.busRoutes?.routes || []);
        setTemples(cachedDashboard.temples?.temples || []);
        setNews(cachedDashboard.news?.news || []);
        setLastUpdate(new Date());
        setIsLoading(false);
        return;
      }

      // Fetch all data in one batch
      try {
        const dashboardData = await GroqDataService.getDashboardData();

        setWeather(dashboardData.weather);
        setTraffic(dashboardData.traffic);
        setBusRoutes(dashboardData.busRoutes?.routes || []);
        setTemples(dashboardData.temples?.temples || []);
        setNews(dashboardData.news?.news || []);

        // Cache the result
        DataCache.set('dashboard', dashboardData);
        setLastUpdate(new Date());
      } catch (err) {
        console.warn('Groq Batch Fetch failed:', err);

        // Fallback: Try to get at least weather from DDG if batch fails
        // We don't want to leave the user with nothing if possible, but we respect "no mock data"
        try {
          const fallbackWeather = await DuckDuckGoService.getWeather('Chennai');
          setWeather(fallbackWeather);
          setError('Partial data available (Weather only). Full dashboard update failed.');
        } catch (fallbackErr) {
          setError('Unable to fetch live data. Please try again later.');
          setWeather(null);
        }

        // Clear other data to avoid stale state if we want strict "live or error"
        setTraffic(null);
        setBusRoutes([]);
        setTemples([]);
        setNews([]);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 20 minutes
  useEffect(() => {
    refreshData();
    const intervalId = setInterval(refreshData, 20 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Initial load
  useEffect(() => {
    // Clear potentially "poisoned" cache (mock data stored as real data)
    // This runs once on mount to ensure we try fresh API calls
    DataCache.clearAll();
  }, []);



  const value: ExternalDataContextType = {
    weather,
    traffic,
    busRoutes,
    temples,
    news,
    isLoading,
    error,
    lastUpdate,
    refreshData
  };

  return (
    <ExternalDataContext.Provider value={value}>
      {children}
    </ExternalDataContext.Provider>
  );
}

export function useExternalData() {
  const context = useContext(ExternalDataContext);
  if (!context) {
    throw new Error('useExternalData must be used within ExternalDataProvider');
  }
  return context;
}