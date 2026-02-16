import { useState } from 'react';
import { useExternalData } from '../../services/ExternalDataService';
import { useLanguage } from '../../services/LanguageService';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { RefreshCw, Cloud, Car, AlertTriangle, Thermometer, Wind } from 'lucide-react';
import AutoShareCard from '../AutoShareCard';

interface LiveDataWidgetProps {
  pincode?: string;
}

export default function LiveDataWidget({ pincode = "600020" }: LiveDataWidgetProps) {
  const { weather, traffic, busRoutes, isLoading, error, refreshData } = useExternalData();
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {language === 'ta' ? 'நேரடி தகவல்கள்' : 'Live Data'}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {language === 'ta' ? 'புதுப்பி' : 'Refresh'}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
            <p className="text-sm text-gray-600">
              {language === 'ta' ? 'தரவு ஏற்றுகிறது...' : 'Loading data...'}
            </p>
          </div>
        </Card>
      )}

      {/* Weather Section */}
      {!isLoading && weather && (
        <Card className="p-4 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {language === 'ta' ? 'வானிலை' : 'Weather'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-2xl font-bold">{weather.temp || 'N/A'}°C</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {weather.condition || 'Unknown'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Humidity</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {weather.humidity || 'N/A'}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Traffic Section */}
      {!isLoading && traffic && (
        <Card className="p-4 border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">
              {language === 'ta' ? 'போக்குவரத்து' : 'Traffic'}
            </h3>
          </div>
          <div className="space-y-2">
            {traffic.level && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Status:</span>
                <Badge className={
                  traffic.level === 'low' ? 'bg-green-100 text-green-700' :
                    traffic.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                }>
                  {traffic.level.toUpperCase()}
                </Badge>
              </div>
            )}
            {traffic.roads && traffic.roads.length > 0 && (
              <div className="mt-2 space-y-1">
                {traffic.roads.slice(0, 2).map((road, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-700">{road.name}</span>
                    <span className="text-gray-500">{road.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bus Routes Section */}
      {!isLoading && busRoutes && busRoutes.length > 0 && (
        <Card className="p-4 border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            {language === 'ta' ? 'பேருந்து வழித்தடங்கள்' : 'Bus Routes'}
          </h3>
          <div className="space-y-2">
            {busRoutes.slice(0, 3).map((route, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{route.number}</span>
                <span className="text-xs text-gray-600">{route.frequency} • {route.duration}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Auto Share Card */}
      <AutoShareCard pincode={pincode} />
    </div>
  );
}