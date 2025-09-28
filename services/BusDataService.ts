/**
 * Chennai Bus Data Service
 * 
 * A comprehensive client-side service for consuming live Chennai bus data from the Chalo proxy API.
 * This service integrates seamlessly with the existing ExternalDataService to provide real-time
 * public transportation data with Tamil-first localization.
 * 
 * Key Features:
 * - Real-time bus data fetching with automatic refresh
 * - Tamil-first data schema with bilingual support
 * - Error handling with graceful fallbacks
 * - Subscription-based data updates for React components
 * - Automatic retry logic and connection management
 * - Chennai-specific area mapping and route translation
 * 
 * Integration:
 * - Works with /api/bus endpoint (backed by ChaloProxyService)
 * - Provides useBusData() React hook for components
 * - Integrates with ExternalDataService context
 * - Supports real-time updates in LiveDataWidget
 * 
 * Usage Example:
 * ```typescript
 * const { busData, isLoading, error, refreshBusData } = useBusData();
 * 
 * // Filter by area
 * const tnBuses = busData.filter(bus => 
 *   bus.areaDisplayName.includes('T.Nagar')
 * );
 * 
 * // Manual refresh
 * await refreshBusData();
 * ```
 * 
 * @author Chennai Community App Team
 * @version 1.0.0
 * @since September 2025
 */

// NEW: Client-side service to consume Chennai bus data API
// NEW: Integrates with existing ExternalDataService for seamless bus data access

import { NormalizedBusData, BusApiResponse } from '../pages/api/bus';
import React from 'react';

// NEW: Bus service configuration
const BUS_API_CONFIG = {
  ENDPOINT: '/api/bus',
  REFRESH_INTERVAL: 45000, // NEW: 45 seconds (slightly longer than cache)
  TIMEOUT: 8000, // NEW: 8 second timeout
  MAX_RETRIES: 2
};

// NEW: Bus data state management
class BusDataService {
  private data: NormalizedBusData[] = [];
  private lastUpdate: Date | null = null;
  private isLoading: boolean = false;
  private error: string | null = null;
  private subscribers: Array<(data: NormalizedBusData[]) => void> = [];
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    // NEW: Start auto-refresh when service is created
    this.startAutoRefresh();
  }

  // NEW: Subscribe to bus data updates
  subscribe(callback: (data: NormalizedBusData[]) => void): () => void {
    this.subscribers.push(callback);
    
    // NEW: Immediately send current data to new subscriber
    if (this.data.length > 0) {
      callback(this.data);
    }
    
    // NEW: Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // NEW: Notify all subscribers of data changes
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.data);
      } catch (error) {
        console.error('[Bus Service] Subscriber callback error:', error);
      }
    });
  }

  // NEW: Fetch bus data from API with retry logic
  async fetchBusData(retryCount = 0): Promise<NormalizedBusData[]> {
    if (this.isLoading && retryCount === 0) {
      console.log('[Bus Service] Already loading, skipping duplicate request');
      return this.data;
    }

    this.isLoading = true;
    this.error = null;

    try {
      console.log(`[Bus Service] Fetching bus data (attempt ${retryCount + 1})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), BUS_API_CONFIG.TIMEOUT);

      const response = await fetch(BUS_API_CONFIG.ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: BusApiResponse = await response.json();
      
      if (!result.success && result.meta.errors) {
        console.warn('[Bus Service] API returned errors:', result.meta.errors);
      }

      // NEW: Update internal state
      this.data = result.data || [];
      this.lastUpdate = new Date();
      this.error = null;

      console.log(`[Bus Service] Successfully loaded ${this.data.length} bus records (source: ${result.meta.source})`);

      // NEW: Notify subscribers
      this.notifySubscribers();

      return this.data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Bus Service] Fetch failed (attempt ${retryCount + 1}):`, errorMessage);

      // NEW: Retry logic
      if (retryCount < BUS_API_CONFIG.MAX_RETRIES) {
        console.log(`[Bus Service] Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.fetchBusData(retryCount + 1);
      }

      // NEW: Max retries reached
      this.error = `Failed to fetch bus data: ${errorMessage}`;
      console.error('[Bus Service] Max retries reached, giving up');
      
      return this.data; // NEW: Return cached data if available
    } finally {
      this.isLoading = false;
    }
  }

  // NEW: Start automatic refresh
  private startAutoRefresh(): void {
    // NEW: Initial fetch
    this.fetchBusData().catch(error => {
      console.error('[Bus Service] Initial fetch failed:', error);
    });

    // NEW: Set up recurring refresh
    this.refreshTimer = setInterval(() => {
      this.fetchBusData().catch(error => {
        console.error('[Bus Service] Auto-refresh failed:', error);
      });
    }, BUS_API_CONFIG.REFRESH_INTERVAL);

    console.log(`[Bus Service] Auto-refresh started (every ${BUS_API_CONFIG.REFRESH_INTERVAL / 1000}s)`);
  }

  // NEW: Stop automatic refresh
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('[Bus Service] Auto-refresh stopped');
    }
  }

  // NEW: Get current bus data
  getCurrentData(): NormalizedBusData[] {
    return this.data;
  }

  // NEW: Get bus data filtered by area
  getBusDataByArea(area: string): NormalizedBusData[] {
    return this.data.filter(bus => 
      bus.location.area?.toLowerCase().includes(area.toLowerCase()) ||
      bus.message.en.toLowerCase().includes(area.toLowerCase()) ||
      bus.message.ta.includes(area)
    );
  }

  // NEW: Get bus data filtered by route
  getBusDataByRoute(route: string): NormalizedBusData[] {
    return this.data.filter(bus => 
      bus.source.route?.includes(route) ||
      bus.message.en.includes(route) ||
      bus.message.ta.includes(route)
    );
  }

  // NEW: Get service status
  getStatus(): { 
    isLoading: boolean; 
    error: string | null; 
    lastUpdate: Date | null; 
    count: number; 
  } {
    return {
      isLoading: this.isLoading,
      error: this.error,
      lastUpdate: this.lastUpdate,
      count: this.data.length
    };
  }

  // NEW: Manual refresh
  async refresh(): Promise<void> {
    await this.fetchBusData();
  }

  // NEW: Cleanup resources
  destroy(): void {
    this.stopAutoRefresh();
    this.subscribers = [];
    this.data = [];
  }
}

// NEW: Create singleton instance
const busDataService = new BusDataService();

// NEW: Export service instance and types
export default busDataService;
export type { NormalizedBusData };

// NEW: React hook for easy integration
export const useBusData = () => {
  const [data, setData] = React.useState<NormalizedBusData[]>([]);
  const [status, setStatus] = React.useState(busDataService.getStatus());

  React.useEffect(() => {
    // NEW: Subscribe to data updates
    const unsubscribe = busDataService.subscribe(setData);
    
    // NEW: Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(busDataService.getStatus());
    }, 1000);

    // NEW: Cleanup on unmount
    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  return {
    busData: data,
    ...status,
    refresh: () => busDataService.refresh(),
    getBusDataByArea: (area: string) => busDataService.getBusDataByArea(area),
    getBusDataByRoute: (route: string) => busDataService.getBusDataByRoute(route)
  };
};

// NEW: For older React versions without hooks
export const BusDataContext = React.createContext<{
  busData: NormalizedBusData[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}>({
  busData: [],
  isLoading: false,
  error: null,
  refresh: async () => {}
});

// React is imported at the top of the file
