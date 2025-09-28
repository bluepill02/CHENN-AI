import { Bus, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { callBusApi } from '../services/ApiRouter';
import { usePincodeContext } from '../services/PincodeContext';
import { getPincodeMetadata, getPincodeServices } from '../services/PincodeRepository';
import { Card } from './ui/card';

interface BusByPincodeProps {
  pincode?: string; // Optional - will use context if not provided
}

interface BusStopData {
  pincode: string;
  stops: string[];
  area: string;
  hasData: boolean;
  dataSource: 'live-api' | 'repository' | 'fallback';
  lastUpdated?: Date;
}

// Fallback bus stops for major Chennai areas
const fallbackBusStops: Record<string, string[]> = {
  '600001': ['Fort Railway Station', 'High Court', 'Chennai Central', 'George Town'],
  '600002': ['Anna Salai', 'LIC Building', 'Thousand Lights', 'Gemini Flyover'],
  '600003': ['Broadway', 'Parrys Corner', 'Beach Station', 'New Market'],
  '600004': ['Mylapore Bus Stand', 'Kapaleeshwarar Temple', 'Luz Corner', 'Mandaveli'],
  '600005': ['Triplicane', 'Ice House', 'Chepauk Stadium', 'Marina Beach'],
  '600006': ['Teynampet', 'Anna Flyover', 'Gemini Circle', 'Nandanam'],
  '600008': ['Egmore Railway Station', 'Government Museum', 'Pantheon Road', 'Chetpet'],
  '600010': ['Kilpauk', 'Stanley Medical College', 'Doveton Corrie', 'Purasawalkam'],
  '600020': ['Adyar', 'IIT Madras', 'Cancer Institute', 'Raj Bhavan'],
  '600040': ['Anna Nagar', 'Anna Nagar Tower', '2nd Avenue', 'Thirumangalam'],
  '600090': ['Ashok Nagar', 'Vadapalani', 'KK Nagar', 'West Mambalam'],
  '600119': ['Sholinganallur', 'OMR IT Parks', 'Navalur', 'Siruseri']
};

export const BusByPincodeCard: React.FC<BusByPincodeProps> = ({ pincode: propPincode }) => {
  const { currentPincode } = usePincodeContext();
  const pincode = propPincode || currentPincode;
  const [busData, setBusData] = useState<BusStopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate nearby stops based on area name
  const generateNearbyStops = (areaName: string): string[] => {
    const genericStops = [
      `${areaName} Bus Stand`,
      `${areaName} Metro Station`, 
      `${areaName} Main Road`,
      'Nearby Junction'
    ];
    return genericStops;
  };

  const fetchBusData = async (isRefresh: boolean = false) => {
    if (!pincode) {
      setError('No pincode provided');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // PRIORITY 1: Try real-time bus API
      try {
        console.log('🚌 Fetching live bus data for pincode:', pincode);
        const busApiResponse = await callBusApi();
        
        if (busApiResponse && busApiResponse.data && busApiResponse.data.length > 0) {
          // Extract bus stops from live API data
          const liveStops = busApiResponse.data
            .filter(bus => 
              bus.location?.area?.toLowerCase().includes(pincode) || 
              bus.location?.district?.toLowerCase().includes('chennai')
            )
            .map(bus => 
              bus.location?.area || 
              bus.source?.route || 
              bus.message?.en || 
              'Bus Stop'
            )
            .filter((stop, index, array) => array.indexOf(stop) === index) // Remove duplicates
            .slice(0, 6); // Limit to 6 stops
            
          if (liveStops.length > 0) {
            const metadata = getPincodeMetadata(pincode);
            setBusData({
              pincode,
              stops: liveStops,
              area: metadata?.area.english || 'Chennai',
              hasData: true,
              dataSource: 'live-api',
              lastUpdated: new Date()
            });
            return;
          }
        }
      } catch (apiError) {
        console.warn('Bus API failed, trying repository data:', apiError);
      }

      // PRIORITY 2: Repository data
      const services = getPincodeServices(pincode);
      const metadata = getPincodeMetadata(pincode);
      
      if (services.busStops && services.busStops.length > 0) {
        setBusData({
          pincode,
          stops: services.busStops,
          area: metadata?.area.english || 'Chennai',
          hasData: true,
          dataSource: 'repository',
          lastUpdated: new Date()
        });
        return;
      }

      // PRIORITY 3: Fallback data (clearly marked)
      const fallbackStops = fallbackBusStops[pincode] || 
        generateNearbyStops(metadata?.area.english || 'Chennai');
      
      setBusData({
        pincode,
        stops: fallbackStops,
        area: metadata?.area.english || 'Chennai',
        hasData: false,
        dataSource: 'fallback',
        lastUpdated: new Date()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bus data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, [pincode]);

  const handleRefresh = () => {
    fetchBusData(true);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bus className="h-4 w-4" />
          <h3 className="text-sm font-medium">Bus Stops</h3>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
          <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error || !busData) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bus className="h-4 w-4" />
          <h3 className="text-sm font-medium">Bus Stops</h3>
        </div>
        <p className="text-sm text-gray-500">
          {error || 'No bus stop data available'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Bus Stops</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">{busData.area} • {pincode}</span>
              {/* Data source indicator */}
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                busData.dataSource === 'live-api' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : busData.dataSource === 'repository'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {busData.dataSource === 'live-api' ? '🟢 LIVE' : 
                 busData.dataSource === 'repository' ? '🔵 OFFICIAL' : 
                 '🟡 ESTIMATED'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
          aria-label="Refresh bus data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-2">
        {busData.stops.slice(0, 4).map((stop, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            <div className="font-medium text-sm text-gray-900">
              {stop}
            </div>
          </div>
        ))}
        
        {busData.stops.length > 4 && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Showing 4 of {busData.stops.length} bus stops
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-100">
        <p className="text-xs text-gray-500">
          {busData.dataSource === 'live-api' ? 'Live data from Chennai bus API' : 
           busData.dataSource === 'repository' ? 'Data from MTC official records' : 
           'Estimated nearby bus stops'}. Services may vary.
        </p>
        {busData.lastUpdated && (
          <p className="text-xs text-gray-400 mt-1">
            Updated: {busData.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </Card>
  );
};

export default BusByPincodeCard;