import { Cloud, Droplets, Sun, Wind, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LiveDataService } from '../../services/LiveDataService';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'overcast';
  humidity: number;
  windSpeed: number;
  location: string;
  lastUpdated: Date;
  aqi?: number;
}

interface WeatherPanelProps {
  weatherData?: WeatherData;
  userLocation?: any;
  className?: string;
}

export function WeatherPanel({ weatherData, userLocation, className = '' }: WeatherPanelProps) {
  const [data, setData] = useState<WeatherData | null>(weatherData || null);
  const [loading, setLoading] = useState(!weatherData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (weatherData) {
      setData(weatherData);
      return;
    }

    const fetchWeather = async () => {
      const area = userLocation?.area || 'Chennai';
      setLoading(true);
      setError(null);

      try {
        const realWeather = await LiveDataService.getWeather(area);

        // Map AI response to our interface
        const mappedData: WeatherData = {
          temperature: realWeather.temp,
          condition: mapConditionString(realWeather.condition),
          humidity: realWeather.humidity,
          windSpeed: 10, // Default if not provided
          location: area,
          lastUpdated: new Date(),
          aqi: realWeather.aqi,
        };

        setData(mappedData);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        setError('Unable to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [userLocation?.area, weatherData]);

  const mapConditionString = (condition: string): WeatherData['condition'] => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('shower')) return 'rainy';
    if (lower.includes('cloud') || lower.includes('overcast')) return 'cloudy';
    if (lower.includes('sun') || lower.includes('clear')) return 'sunny';
    return 'overcast';
  };

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <img src="/assets/weather_sunny.png" alt="Sunny" className="w-12 h-12" />;
      case 'cloudy':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      case 'rainy':
        return <img src="/assets/weather_rainy.png" alt="Rainy" className="w-12 h-12" />;
      case 'overcast':
        return <Cloud className="w-12 h-12 text-gray-600" />;
    }
  };

  const getConditionText = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'Sunny';
      case 'cloudy':
        return 'Cloudy';
      case 'rainy':
        return 'Rainy';
      case 'overcast':
        return 'Overcast';
    }
  };

  const getConditionBg = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
      case 'cloudy':
        return 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200';
      case 'rainy':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'overcast':
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          Weather Update
        </h3>
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 shadow-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin mr-2" />
          <span className="text-gray-600">Loading weather...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5 text-yellow-500" />
          Weather Update
        </h3>
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 shadow-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 text-sm">{error || 'Weather data unavailable'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {getWeatherIcon(data.condition)}
        Weather Update
      </h3>

      <div className={`p-4 rounded-lg border ${getConditionBg(data.condition)} shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getWeatherIcon(data.condition)}
            <div>
              <div className="text-2xl font-bold text-gray-800">{data.temperature}°C</div>
              <div className="text-sm text-gray-600">{getConditionText(data.condition)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-800">{data.location}</div>
            <div className="text-xs text-gray-500">
              Updated {Math.round((Date.now() - data.lastUpdated.getTime()) / (1000 * 60))}m ago
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Humidity</span>
            <span className="font-medium text-gray-800">{data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Wind</span>
            <span className="font-medium text-gray-800">{data.windSpeed} km/h</span>
          </div>
          {data.aqi && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <span className="text-gray-600">AQI</span>
              <span className={`font-medium ${data.aqi > 100 ? 'text-red-600' : 'text-green-600'}`}>
                {data.aqi} ({data.aqi > 100 ? 'Poor' : 'Good'})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}