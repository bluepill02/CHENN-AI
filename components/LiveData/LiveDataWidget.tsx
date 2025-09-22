import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useLanguage } from '../../services/LanguageService';
import { useRealTimeData } from '../../services/RealTimeDataService';
import { useExternalData } from '../../services/ExternalDataService';
import { formatTimestamp, getConnectionStatusColor, getTrafficStatusColor, getServiceStatusColor, getWeatherConditionIcon } from '../../utils';
import { 
  Zap, 
  AlertTriangle, 
  Thermometer, 
  Car, 
  Phone, 
  Wifi, 
  WifiOff, 
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

interface LiveDataWidgetProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function LiveDataWidget({ isExpanded = false, onToggle, className = '' }: LiveDataWidgetProps) {
  const { language } = useLanguage();
  const { 
    alerts, 
    isConnected, 
    connectionStatus, 
    lastUpdate,
    postsCount 
  } = useRealTimeData();
  
  const { 
    weather, 
    traffic, 
    publicServices, 
    isLoading, 
    refreshData,
    isApiConnected,
    apiStatus 
  } = useExternalData();

  // Auto-updating timestamps
  const [, setUpdateTrigger] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const hasImportantData = criticalAlerts.length > 0 || 
                          (weather && weather.airQuality === 'poor') ||
                          traffic.some(route => route.status === 'blocked');

  if (!isExpanded) {
    // Compact floating widget
    return (
      <Card 
        className={`p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${className}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Zap className="w-5 h-5" />
              {hasImportantData && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <div className="font-medium text-sm">
                {language === 'ta' ? 'நேரடி தகவல்கள்' : 'Live Updates'}
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-xs">
                {isConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                <span>{language === 'ta' ? `${postsCount} புதுப்பிப்புகள்` : `${postsCount} updates`}</span>
              </div>
            </div>
          </div>
          <ChevronUp className="w-4 h-4" />
        </div>
      </Card>
    );
  }

  // Expanded widget
  return (
    <Card className={`bg-white shadow-lg border-2 border-blue-200/50 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {language === 'ta' ? 'நேரடி தகவல்கள்' : 'Live Data Center'}
            </h3>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>{language === 'ta' ? 'இணைக்கப்பட்டது' : 'Connected'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>{language === 'ta' ? 'இணைப்பு இல்லை' : 'Offline'}</span>
                </>
              )}
              {lastUpdate && (
                <>
                  <span>•</span>
                  <span>{formatTimestamp(lastUpdate, language)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshData}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-2"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        
        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {language === 'ta' ? 'அவசர எச்சரிக்கைகள்' : 'Critical Alerts'}
            </h4>
            {criticalAlerts.map((alert) => (
              <Card key={alert.id} className="border-2 border-red-500 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium text-red-900">
                      {language === 'ta' ? alert.title : alert.titleEn}
                    </h5>
                    <p className="text-red-800 text-sm">
                      {language === 'ta' ? alert.message : alert.messageEn}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-red-600 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(alert.timestamp, language)}</span>
                      <span>•</span>
                      <span>{alert.source}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div>
            <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4" />
              {language === 'ta' ? 'வானிலை' : 'Weather'}
              <Badge className={`ml-auto ${getConnectionStatusColor(apiStatus.weather)}`}>
                {apiStatus.weather}
              </Badge>
            </h4>
            <Card className="p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getWeatherConditionIcon(weather.condition)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {weather.temperature}°C • {language === 'ta' ? weather.conditionTamil : weather.condition}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {language === 'ta' ? weather.descriptionTamil : weather.description}
                    </div>
                  </div>
                </div>
                <Badge className={`${weather.airQuality === 'good' ? 'bg-green-500' : 
                                 weather.airQuality === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                  {language === 'ta' ? weather.airQualityTamil : weather.airQuality}
                </Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Traffic */}
        {traffic && traffic.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
              <Car className="w-4 h-4" />
              {language === 'ta' ? 'போக்குவரத்து' : 'Traffic'}
              <Badge className={`ml-auto ${getConnectionStatusColor(apiStatus.traffic)}`}>
                {apiStatus.traffic}
              </Badge>
            </h4>
            <div className="space-y-2">
              {traffic.slice(0, 3).map((route, index) => (
                <Card key={index} className="p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">
                        {language === 'ta' ? route.routeTamil : route.route}
                      </div>
                      <div className="text-xs text-gray-600">
                        {route.distance} • {route.estimatedTime} {language === 'ta' ? 'நிமிடங்கள்' : 'mins'}
                      </div>
                    </div>
                    <Badge className={`${getTrafficStatusColor(route.status)} text-white text-xs`}>
                      {language === 'ta' ? route.statusTamil : route.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Public Services */}
        {publicServices && publicServices.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              {language === 'ta' ? 'பொது சேவைகள்' : 'Public Services'}
              <Badge className={`ml-auto ${getConnectionStatusColor(apiStatus.services)}`}>
                {apiStatus.services}
              </Badge>
            </h4>
            <div className="space-y-2">
              {publicServices.slice(0, 4).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {service.service.includes('Metro') ? '🚇' :
                       service.service.includes('Bus') ? '🚌' :
                       service.service.includes('Electricity') ? '⚡' :
                       service.service.includes('Water') ? '💧' : '🏢'}
                    </span>
                    <span className="text-sm font-medium">
                      {language === 'ta' ? service.serviceTamil : service.service}
                    </span>
                  </div>
                  <Badge className={`${getServiceStatusColor(service.status)} text-xs`}>
                    {language === 'ta' ? service.statusTamil : service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>{language === 'ta' ? 'அமைப்பு நிலை' : 'System Status'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}