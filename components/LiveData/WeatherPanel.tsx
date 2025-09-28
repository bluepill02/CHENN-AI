import {
    AlertTriangle,
    Clock,
    Cloud,
    CloudRain,
    CloudSnow,
    Droplets,
    RefreshCw,
    Sun,
    Wind
} from 'lucide-react';
import { useExternalData } from '../../services/ExternalDataService';
import { useLanguage } from '../../services/LanguageService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

/**
 * Props interface for WeatherPanel component
 */
export interface WeatherPanelProps {
  /** Additional CSS classes for styling overrides */
  className?: string;
  /** Optional pincode context for display */
  pincode?: string;
}

/**
 * WeatherPanel - Displays current weather information for Chennai
 * 
 * Features:
 * - Real-time weather data from OpenWeatherMap API
 * - Bilingual support (Tamil/English) 
 * - Loading states and error handling
 * - Accessible weather icons and labels
 * - Hover animations and responsive design
 */
export function WeatherPanel({ className = '', pincode }: WeatherPanelProps) {
  const { language } = useLanguage();
  const { 
    weather, 
    isLoading, 
    apiStatus, 
    refreshData 
  } = useExternalData();

  /**
   * Get appropriate weather icon based on condition
   */
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'partly_cloudy':
        return <CloudSnow className="w-6 h-6 text-gray-400" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  /**
   * Get weather condition text based on language
   */
  const getConditionText = () => {
    if (!weather) return language === 'ta' || language === 'ta-rom' ? 'தகவல் இல்லை' : 'No data';
    return language === 'ta' || language === 'ta-rom' ? weather.conditionTamil : weather.condition;
  };

  /**
   * Get description text based on language
   */
  const getDescriptionText = () => {
    if (!weather) return language === 'ta' || language === 'ta-rom' ? 'தகவல் கிடைக்கவில்லை' : 'Data unavailable';
    return language === 'ta' || language === 'ta-rom' ? weather.descriptionTamil : weather.description;
  };

  /**
   * Format last updated timestamp
   */
  const formatLastUpdate = () => {
    if (!weather?.lastUpdated) return '--:--';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - weather.lastUpdated.getTime()) / 1000);
    
    if (diff < 60) {
      return language === 'ta' || language === 'ta-rom' ? 'இப்போது' : 'Just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return language === 'ta' || language === 'ta-rom' ? `${minutes} நிமிட முன்` : `${minutes}m ago`;
    } else {
      const hours = Math.floor(diff / 3600);
      return language === 'ta' || language === 'ta-rom' ? `${hours} மணி முன்` : `${hours}h ago`;
    }
  };

  /**
   * Check if weather API has an error
   */
  const hasError = () => {
    return apiStatus.weather === 'error' || (weather as any)?.error;
  };

  /**
   * Get error message
   */
  const getErrorMessage = () => {
    const errorMsg = (weather as any)?.message || 'Weather data unavailable';
    return language === 'ta' || language === 'ta-rom' ? 'வானிலை தகவல் கிடைக்கவில்லை' : errorMsg;
  };

  return (
    <Card className={`
      p-4 transition-all duration-200 hover:shadow-md
      bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20
      border border-blue-200/50 dark:border-blue-800/50
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {language === 'ta' || language === 'ta-rom' ? 'வானிலை' : 'Weather'}
            </h3>
            {/* Data source indicator */}
            <div className={`px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${
              apiStatus.weather === 'connected' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : apiStatus.weather === 'error'
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {apiStatus.weather === 'connected' ? '🟢 LIVE API' : 
               apiStatus.weather === 'error' ? '🟡 SIMULATED' : 
               '⚪ LOADING'}
            </div>
          </div>
        </div>
        
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshData}
          disabled={isLoading}
          className="p-1.5 h-auto hover:bg-blue-100 dark:hover:bg-blue-800/50"
          aria-label={language === 'ta' || language === 'ta-rom' ? 'புதுப்பிக்க' : 'Refresh weather'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'ta' || language === 'ta-rom' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && hasError() && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {language === 'ta' || language === 'ta-rom' ? 'பிழை' : 'Error'}
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {getErrorMessage()}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/20"
          >
            {language === 'ta' || language === 'ta-rom' ? 'மீண்டும் முயற்சிக்க' : 'Try again'}
          </Button>
        </div>
      )}

      {/* Weather Data */}
      {!isLoading && !hasError() && weather && (
        <div className="space-y-3">
          {/* Main Weather Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.condition)}
              <div>
                <div 
                  className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  aria-label={`${weather.temperature} degrees celsius`}
                >
                  {weather.temperature}°C
                </div>
                <div 
                  className="text-sm text-gray-600 dark:text-gray-400 capitalize"
                  aria-label={`Weather condition: ${getConditionText()}`}
                >
                  {getConditionText()}
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {language === 'ta' || language === 'ta-rom' ? 'சென்னை' : 'Chennai'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {language === 'ta' || language === 'ta-rom' ? 'தமிழ்நாடு' : 'Tamil Nadu'}
              </div>
              {pincode && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {language === 'ta' || language === 'ta-rom' ? `அஞ்சல் குறியீடு: ${pincode}` : `PIN: ${pincode}`}
                </div>
              )}
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200/30 dark:border-blue-800/30">
            {/* Humidity */}
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {language === 'ta' || language === 'ta-rom' ? 'ஈரப்பதம்' : 'Humidity'}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {weather.humidity}%
                </div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {language === 'ta' || language === 'ta-rom' ? 'காற்று' : 'Wind'}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {weather.windSpeed} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pt-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {getDescriptionText()}
            </p>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-200/30 dark:border-blue-800/30">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {language === 'ta' || language === 'ta-rom' ? 'புதுப்பிக்கப்பட்டது' : 'Updated'}: {formatLastUpdate()}
              </span>
            </div>
            
            {/* API Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              apiStatus.weather === 'connected' ? 'bg-green-500' :
              apiStatus.weather === 'loading' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} aria-label={`API status: ${apiStatus.weather}`} />
          </div>
        </div>
      )}
    </Card>
  );
}