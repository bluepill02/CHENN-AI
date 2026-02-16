import { AlertTriangle, CheckCircle, Loader2, Wifi, WifiOff, XCircle } from 'lucide-react';
import { useExternalData } from '../../services/ExternalDataService';
import { useLanguage } from '../../services/LanguageService';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface ApiStatusIndicatorProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function ApiStatusIndicator({ variant = 'compact', className = '' }: ApiStatusIndicatorProps) {
  const { language } = useLanguage();
  const { isApiConnected, apiStatus, isLoading } = useExternalData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'loading':
        return <Loader2 className="w-3 h-3 text-yellow-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-600" />;
      default:
        return <AlertTriangle className="w-3 h-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'loading':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const apiServices = [
    {
      name: language === 'ta' ? 'வானிலை' : 'Weather',
      status: apiStatus.weather,
      description: language === 'ta' ? 'WeatherAPI (Chennai)' : 'WeatherAPI (Chennai)'
    },
    {
      name: language === 'ta' ? 'போக்குவரத்து' : 'Traffic',
      status: apiStatus.traffic,
      description: language === 'ta' ? 'Mappls API' : 'Mappls API'
    },
    {
      name: language === 'ta' ? 'பொது சேவைகள்' : 'Services',
      status: apiStatus.services,
      description: language === 'ta' ? 'Local APIs' : 'Local APIs'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {isApiConnected ? (
            <Wifi className="w-4 h-4 text-green-200" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-200" />
          )}
          <span className="text-white/80 text-sm">
            {language === 'ta' ? 'API நிலை' : 'API Status'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {apiServices.map((service, index) => (
            <div key={index} className={`w-2 h-2 rounded-full ${
              service.status === 'connected' ? 'bg-green-400' :
              service.status === 'loading' ? 'bg-yellow-400 animate-pulse' :
              service.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
            }`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={`p-3 bg-white/10 backdrop-blur-sm border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium text-sm">
          {language === 'ta' ? 'API இணைப்பு நிலை' : 'API Connection Status'}
        </h4>
        <Badge className={`${isApiConnected ? 'bg-green-500' : 'bg-red-500'} text-white text-xs`}>
          {isApiConnected ? 
            (language === 'ta' ? 'இணைக்கப்பட்டது' : 'Connected') : 
            (language === 'ta' ? 'துண்டிக்கப்பட்டது' : 'Disconnected')
          }
        </Badge>
      </div>
      
      <div className="space-y-2">
        {apiServices.map((service, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(service.status)}
              <div>
                <div className="text-white text-sm">{service.name}</div>
                <div className="text-white/70 text-xs">{service.description}</div>
              </div>
            </div>
            <Badge className={`${getStatusColor(service.status)} text-xs`}>
              {service.status}
            </Badge>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{language === 'ta' ? 'தரவு புதுப்பிக்கப்படுகிறது...' : 'Updating data...'}</span>
          </div>
        </div>
      )}
    </Card>
  );
}