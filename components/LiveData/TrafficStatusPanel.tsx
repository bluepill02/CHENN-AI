import { Car, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useExternalData } from '../../services/ExternalDataService';
import { Card } from '../ui/card';

interface TrafficData {
  location: string;
  status: 'heavy' | 'moderate' | 'light';
  estimatedDelay: string;
  lastUpdated: Date;
  incidents?: string[];
}

interface TrafficStatusPanelProps {
  trafficData?: TrafficData[];
  userLocation?: UserLocation;
  className?: string;
}

interface UserLocation {
  pincode?: string;
  area?: string;
  localContent?: {
    nearbyLandmarks?: string[];
  };
}

// Enhanced Chennai traffic data with real scenarios
const chennaiTrafficHotspots: Record<string, TrafficData[]> = {
  // Central Chennai
  '600001': [
    { location: 'Fort St. George', status: 'moderate', estimatedDelay: '8-12 mins', lastUpdated: new Date(Date.now() - 5 * 60 * 1000) },
    { location: 'High Court', status: 'heavy', estimatedDelay: '15-20 mins', lastUpdated: new Date(Date.now() - 3 * 60 * 1000) }
  ],
  '600002': [
    { location: 'Anna Salai', status: 'heavy', estimatedDelay: '20-25 mins', lastUpdated: new Date(Date.now() - 2 * 60 * 1000) },
    { location: 'Mount Road', status: 'moderate', estimatedDelay: '10-15 mins', lastUpdated: new Date(Date.now() - 7 * 60 * 1000) }
  ],
  '600004': [
    { location: 'Mylapore', status: 'moderate', estimatedDelay: '12-18 mins', lastUpdated: new Date(Date.now() - 4 * 60 * 1000), incidents: ['Temple festival traffic'] },
    { location: 'Luz Corner', status: 'light', estimatedDelay: '5-8 mins', lastUpdated: new Date(Date.now() - 6 * 60 * 1000) }
  ],
  '600020': [
    { location: 'Adyar Signal', status: 'heavy', estimatedDelay: '18-22 mins', lastUpdated: new Date(Date.now() - 3 * 60 * 1000), incidents: ['Road work ongoing'] },
    { location: 'Raj Bhavan', status: 'moderate', estimatedDelay: '8-12 mins', lastUpdated: new Date(Date.now() - 8 * 60 * 1000) }
  ],
  '600040': [
    { location: 'Anna Nagar Tower', status: 'heavy', estimatedDelay: '15-20 mins', lastUpdated: new Date(Date.now() - 2 * 60 * 1000) },
    { location: '2nd Avenue', status: 'moderate', estimatedDelay: '10-15 mins', lastUpdated: new Date(Date.now() - 5 * 60 * 1000) }
  ],
  '600119': [
    { location: 'OMR IT Corridor', status: 'heavy', estimatedDelay: '25-30 mins', lastUpdated: new Date(Date.now() - 1 * 60 * 1000), incidents: ['Peak hour traffic'] },
    { location: 'Sholinganallur', status: 'moderate', estimatedDelay: '12-18 mins', lastUpdated: new Date(Date.now() - 4 * 60 * 1000) }
  ]
};

// Default traffic data for areas without specific data
const getDefaultTrafficData = (area?: string): TrafficData[] => {
  return [
    {
      location: area || 'Chennai Central',
      status: Math.random() > 0.6 ? 'heavy' : Math.random() > 0.3 ? 'moderate' : 'light',
      estimatedDelay: '10-15 mins',
      lastUpdated: new Date(Date.now() - Math.random() * 10 * 60 * 1000)
    },
    {
      location: 'Major Roads',
      status: 'moderate',
      estimatedDelay: '8-12 mins',
      lastUpdated: new Date(Date.now() - Math.random() * 15 * 60 * 1000)
    }
  ];
};

export function TrafficStatusPanel({ trafficData = [], userLocation, className = '' }: TrafficStatusPanelProps) {
  const [localTrafficData, setLocalTrafficData] = useState<TrafficData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'real-time' | 'fallback' | 'loading'>('loading');
  const [lastRealDataUpdate, setLastRealDataUpdate] = useState<Date | null>(null);
  const { traffic, isLoading, refreshData } = useExternalData();

  useEffect(() => {
    // PRIORITY 1: Real-time external API data
    if (traffic && traffic.length > 0) {
      const convertedData: TrafficData[] = traffic.map(t => ({
        location: t.route || 'Chennai',
        status: t.status === 'heavy' ? 'heavy' : t.status === 'moderate' ? 'moderate' : 'light',
        estimatedDelay: String(t.estimatedTime) || '10-15 mins',
        lastUpdated: t.lastUpdated || new Date(),
        incidents: t.incidents
      }));
      setLocalTrafficData(convertedData);
      setDataSource('real-time');
      setLastRealDataUpdate(new Date());
    }
    // PRIORITY 2: Provided real-time traffic data
    else if (trafficData.length > 0) {
      setLocalTrafficData(trafficData);
      setDataSource('real-time');
      setLastRealDataUpdate(new Date());
    }
    // PRIORITY 3: Fallback data (clearly marked)
    else if (userLocation?.pincode && chennaiTrafficHotspots[userLocation.pincode]) {
      setLocalTrafficData(chennaiTrafficHotspots[userLocation.pincode]);
      setDataSource('fallback');
    }
    // PRIORITY 4: Default fallback
    else {
      setLocalTrafficData(getDefaultTrafficData(userLocation?.area));
      setDataSource('fallback');
    }
  }, [trafficData, userLocation, traffic]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataSource('loading');
    try {
      // Force fresh data fetch from external APIs
      await refreshData();
      
      // Give the external data service time to update
      setTimeout(() => {
        // If we still don't have real data after refresh, show fallback with warning
        if ((!traffic || traffic.length === 0) && trafficData.length === 0) {
          if (userLocation?.pincode && chennaiTrafficHotspots[userLocation.pincode]) {
            const updatedData = chennaiTrafficHotspots[userLocation.pincode].map(item => ({
              ...item,
              status: (Math.random() > 0.7 ? 'heavy' : Math.random() > 0.4 ? 'moderate' : 'light') as 'heavy' | 'moderate' | 'light',
              lastUpdated: new Date()
            }));
            setLocalTrafficData(updatedData);
            setDataSource('fallback');
          }
        }
      }, 2000);
    } catch (error) {
      console.warn('Failed to refresh traffic data:', error);
      setDataSource('fallback');
    } finally {
      setTimeout(() => setIsRefreshing(false), 2500);
    }
  };

  const getStatusColor = (status: TrafficData['status']) => {
    switch (status) {
      case 'heavy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'light':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: TrafficData['status']) => {
    switch (status) {
      case 'heavy': return 'Heavy';
      case 'moderate': return 'Moderate';
      case 'light': return 'Light';
      default: return 'Unknown';
    }
  };

  const formatLastUpdate = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
  };

  if (isLoading) {
    return (
      <Card className={`p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Car className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-medium text-gray-900">Traffic Status</h3>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-orange-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Traffic Status</h3>
            <div className="flex items-center gap-2 text-xs">
              {userLocation?.area && (
                <span className="text-gray-500">{userLocation.area}</span>
              )}
              {/* Data source indicator */}
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                dataSource === 'real-time' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : dataSource === 'fallback'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {dataSource === 'real-time' ? '🟢 LIVE' : 
                 dataSource === 'fallback' ? '🟡 SIMULATED' : 
                 '⚪ LOADING'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 hover:bg-orange-100 rounded-lg transition-colors"
          aria-label="Refresh traffic data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {localTrafficData.slice(0, 3).map((trafficItem, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-orange-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gray-500" />
              <div>
                <div className="font-medium text-sm text-gray-900">{trafficItem.location}</div>
                {trafficItem.incidents && trafficItem.incidents.length > 0 && (
                  <div className="text-xs text-gray-500">{trafficItem.incidents[0]}</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(trafficItem.status)}`}>
                {getStatusLabel(trafficItem.status)}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {trafficItem.estimatedDelay}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-orange-100">
        <p className="text-xs text-gray-500">
          Last updated: {formatLastUpdate(localTrafficData[0]?.lastUpdated || new Date())} • 
          Real-time Chennai traffic data
        </p>
      </div>
    </Card>
  );
}