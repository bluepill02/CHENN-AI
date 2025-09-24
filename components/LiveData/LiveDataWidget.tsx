import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useExternalData } from '../../services/ExternalDataService';
import { useLanguage } from '../../services/LanguageService';
import { useRealTimeData } from '../../services/RealTimeDataService';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

// Import sub-components (some may need to be created)
import BusByPincodeCard from '../BusByPincodeCard';
import TimetableCard from '../TimetableCard';
import { TrafficStatusPanel } from './TrafficStatusPanel';
import { WeatherPanel } from './WeatherPanel';

/**
 * Props interface for LiveDataWidget component
 */
export interface LiveDataWidgetProps {
  /** Additional CSS classes for styling overrides */
  className?: string;
  /** Pincode for location-specific data (bus stops, local alerts, etc.) */
  pincode?: string;
}

/**
 * LiveDataWidget - A persistent right-column component for live data.
 * 
 * This widget is designed to be a static panel within a grid layout,
 * not a floating overlay. It fills its container and scrolls internally.
 * 
 * Features:
 * - Always expanded layout (no toggle functionality)
 * - Real-time data from multiple sources
 * - Bilingual support (Tamil/English)
 * - Accessible with proper ARIA labels
 * - Modular card-based layout with independent scrolling
 * - Pincode-specific bus stops and local information
 */
export function LiveDataWidget({ 
  className = '',
  pincode = '600001' // Default to Chennai Central area
}: LiveDataWidgetProps) {
  const { language } = useLanguage();
  
  // Real-time data hooks
  const { 
    isConnected, 
    connectionStatus, 
    lastUpdate, 
    postsCount 
  } = useRealTimeData();

  const { 
    publicServices,
    isLoading,
    refreshData
  } = useExternalData();

  /**
   * Get text based on language (simple fallback implementation)
   */
  const getText = (_key: string, fallback: string) => {
    // Simple implementation - in practice this would use a translation service
    return fallback;
  };

  /**
   * Convert language to simplified type for sub-components
   */
  const getSimplifiedLanguage = (): "en" | "ta" => {
    return language === 'ta' || language === 'ta-rom' ? 'ta' : 'en';
  };

  /**
   * Format last update timestamp for display
   */
  const formatLastUpdate = (timestamp?: Date | null) => {
    if (!timestamp) return getText('noData', 'No data');
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return getText('justNow', 'Just now');
    if (diff < 3600) return getText('minutesAgo', `${Math.floor(diff / 60)}m ago`);
    return getText('hoursAgo', `${Math.floor(diff / 3600)}h ago`);
  };

  /**
   * Get connection status color for UI indicators
   */
  const getConnectionColor = () => {
    if (isConnected) return 'bg-green-500';
    if (connectionStatus === 'connecting') return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  };

  /**
   * Check if data is stale (older than 5 minutes)
   */
  const isDataStale = () => {
    if (!lastUpdate) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastUpdate < fiveMinutesAgo;
  };

  return (
    <div className={`w-full h-full flex flex-col space-y-4 p-4 ${className}`}>
      {/* Header */}
      <Card className="p-4 border-b flex-shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" aria-label={getText('connected', 'Connected')} />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" aria-label={getText('disconnected', 'Disconnected')} />
              )}
              <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`} />
            </div>

            {/* Widget Title */}
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {getText('liveData', 'Live Data')}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatLastUpdate(lastUpdate)}</span>
                {postsCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {postsCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={getText('refresh', 'Refresh data')}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Data Staleness Warning */}
        {isDataStale() && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>{getText('staleData', 'Data may be outdated')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              className="ml-auto p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50"
              aria-label={getText('refresh', 'Refresh data')}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </Card>

      {/* Content - Always Visible */}
      <div className="flex-1 space-y-4">
          {/* Loading State */}
          {isLoading && (
            <Card className="p-4 flex items-center justify-center text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              {getText('loading', 'Loading...')}
            </Card>
          )}

          {/* Data Cards */}
          {!isLoading && (
            <>
              {/* Weather Panel */}
              <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <WeatherPanel />
              </Card>

              {/* Traffic Panel */}
              <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <TrafficStatusPanel />
              </Card>

              {/* Bus Stops by Pincode */}
              <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <BusByPincodeCard 
                  pincode={pincode}
                />
              </Card>

              {/* CMRL Timetable Card */}
              <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <TimetableCard 
                  language={getSimplifiedLanguage()}
                />
              </Card>

              {/* Twitter Local Card - Placeholder */}
              {/* <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <TwitterLocalCard pincode={pincode} />
              </Card> */}

              {/* Temple Info Panel - Placeholder */}
              {/* <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                <TempleInfoPanel pincode={pincode} />
              </Card> */}

              {/* Public Services Status */}
              {publicServices && publicServices.length > 0 && (
                <Card className="p-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-[1.02]">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {getText('publicServices', 'Public Services')}
                    </h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {publicServices.length} {getText('servicesAvailable', 'services available')}
                    </div>
                </Card>
              )}
            </>
          )}

          {/* Error State */}
          {!isLoading && !isConnected && (
            <Card className="p-4 text-center text-gray-500">
              <WifiOff className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{getText('connectionLost', 'Connection lost')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="mt-2"
              >
                {getText('retry', 'Retry')}
              </Button>
            </Card>
          )}
        </div>
    </div>
  );
}
