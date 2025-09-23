// NEW: Frontend component to display Chalo bus data
// Integrates with the existing app structure and shows live Chennai bus information

import { Bus, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BusApiResponse, handleBusApiRequest } from '../services/BusApiHandler';
import { NormalizedBusData } from '../services/ChaloProxyService';
import { useLanguage } from '../services/LanguageService';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface ChaloBusDisplayProps {
  className?: string;
  maxItems?: number;
  showRefreshButton?: boolean;
}

// NEW: Component to display live Chennai bus data from Chalo
export function ChaloBusDisplay({ 
  className = '', 
  maxItems = 5, 
  showRefreshButton = true 
}: ChaloBusDisplayProps) {
  const { language } = useLanguage();
  const [busData, setBusData] = useState<NormalizedBusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState(60);

  // NEW: Fetch bus data from our API handler
  const fetchBusData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: BusApiResponse = await handleBusApiRequest();
      
      if (response.success) {
        setBusData(response.data);
        setLastUpdate(new Date());
        setNextUpdateIn(response.metadata.next_update_in);
      } else {
        setError(response.error || 'Failed to fetch bus data');
        // Still show fallback data if available
        setBusData(response.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setBusData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Auto-fetch data on component mount and set up refresh timer
  useEffect(() => {
    fetchBusData();
    
    // Set up auto-refresh every minute
    const interval = setInterval(fetchBusData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Countdown timer for next update
  useEffect(() => {
    if (!lastUpdate) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      const remaining = Math.max(0, nextUpdateIn - elapsed);
      setNextUpdateIn(remaining);
      
      if (remaining <= 0) {
        fetchBusData(); // Auto-refresh when countdown reaches 0
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdate, nextUpdateIn]);

  // NEW: Get status color based on data freshness
  const getStatusColor = () => {
    if (error) return 'bg-red-100 text-red-800 border-red-300';
    if (isLoading) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  // NEW: Format time ago
  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return language === 'ta' ? 'இப்போது' : 'Just now';
    if (minutes === 1) return language === 'ta' ? '1 நிமிடம் முன்' : '1 minute ago';
    return language === 'ta' ? `${minutes} நிமிடங்கள் முன்` : `${minutes} minutes ago`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* NEW: Header with title and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bus className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">
            {language === 'ta' ? 'நேரடி பஸ் தகவல்' : 'Live Bus Info'}
          </h3>
          <Badge className={getStatusColor()}>
            {error ? (language === 'ta' ? 'பிழை' : 'Error') :
             isLoading ? (language === 'ta' ? 'ஏற்றுகிறது' : 'Loading') :
             (language === 'ta' ? 'நேரடி' : 'Live')}
          </Badge>
        </div>
        
        {/* NEW: Refresh button */}
        {showRefreshButton && (
          <button
            onClick={fetchBusData}
            disabled={isLoading}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            title={language === 'ta' ? 'புதுப்பிக்க' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* NEW: Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            {language === 'ta' ? 'பிழை:' : 'Error:'} {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {language === 'ta' 
              ? 'மாற்று தரவு காட்டப்படுகிறது' 
              : 'Showing fallback data'}
          </p>
        </div>
      )}

      {/* NEW: Bus data list */}
      <div className="space-y-3">
        {busData.length === 0 && !isLoading ? (
          <div className="text-center py-4 text-gray-500">
            <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === 'ta' ? 'பஸ் தகவல் இல்லை' : 'No bus data available'}
            </p>
          </div>
        ) : (
          busData.slice(0, maxItems).map((bus, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'ta' ? bus.message.ta : bus.message.en}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{bus.location.area}, {bus.location.district}</span>
                    {bus.source.route && (
                      <>
                        <span>•</span>
                        <span>{language === 'ta' ? 'வழி:' : 'Route:'} {bus.source.route}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {language === 'ta' ? 'நேரடி' : 'Live'}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(bus.timestamp).toLocaleTimeString(
                    language === 'ta' ? 'ta-IN' : 'en-IN',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* NEW: Footer with last update info */}
      {lastUpdate && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {language === 'ta' ? 'கடைசி புதுப்பிப்பு:' : 'Last updated:'} {formatTimeAgo(lastUpdate)}
              </span>
            </div>
            <div>
              {nextUpdateIn > 0 && (
                <span>
                  {language === 'ta' ? 'அடுத்த புதுப்பிப்பு:' : 'Next update:'} {nextUpdateIn}s
                </span>
              )}
            </div>
          </div>
          <div className="mt-1">
            <p className="text-xs text-gray-400">
              {language === 'ta' ? 'தகவல் மூலம்:' : 'Data source:'} Chalo Proxy • 
              {language === 'ta' ? ` ${busData.length} பஸ்கள்` : ` ${busData.length} buses`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// NEW: Export the component as default
export default ChaloBusDisplay;