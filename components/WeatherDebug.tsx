import { useExternalData } from '../services/ExternalDataService';
import { useLanguage } from '../services/LanguageService';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

// Debug component to verify WeatherAPI integration
export function WeatherDebug() {
  const { weather, apiStatus, isLoading, refreshData } = useExternalData();
  const { language } = useLanguage();

  if (!weather) {
    return (
      <Card className="p-4 m-4">
        <h3>Weather Debug</h3>
        <p>No weather data available</p>
        <Badge className={apiStatus.weather === 'loading' ? 'bg-yellow-500' : 'bg-red-500'}>
          {apiStatus.weather}
        </Badge>
      </Card>
    );
  }

  return (
    <Card className="p-4 m-4">
      <div className="flex items-center justify-between mb-4">
        <h3>Weather Debug - Chennai</h3>
        <div className="flex items-center gap-2">
          <Badge className={
            apiStatus.weather === 'connected' ? 'bg-green-500' :
            apiStatus.weather === 'loading' ? 'bg-yellow-500' : 'bg-red-500'
          }>
            {apiStatus.weather}
          </Badge>
          <button 
            onClick={refreshData} 
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Temperature:</strong> {weather.temperature}°C
        </div>
        <div>
          <strong>Condition:</strong> {weather.condition}
        </div>
        <div>
          <strong>Tamil Condition:</strong> {weather.conditionTamil}
        </div>
        <div>
          <strong>Humidity:</strong> {Math.round(weather.humidity)}%
        </div>
        <div>
          <strong>Wind Speed:</strong> {Math.round(weather.windSpeed)} km/h
        </div>
        <div>
          <strong>UV Index:</strong> {weather.uvIndex}
        </div>
        <div>
          <strong>Air Quality:</strong> {weather.airQuality}
        </div>
        <div>
          <strong>Tamil Air Quality:</strong> {weather.airQualityTamil}
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div>
          <strong>Description (EN):</strong> {weather.description}
        </div>
        <div>
          <strong>Description (TA):</strong> {weather.descriptionTamil}
        </div>
        <div>
          <strong>Last Updated:</strong> {weather.lastUpdated.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}