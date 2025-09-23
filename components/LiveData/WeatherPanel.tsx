import { Cloud, CloudRain, Droplets, Sun, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'overcast';
  humidity: number;
  windSpeed: number;
  location: string;
  lastUpdated: Date;
}

interface WeatherPanelProps {
  weatherData?: WeatherData;
  userLocation?: any;
  className?: string;
}

// Location-specific weather data based on pincode
const getLocationSpecificWeather = (userLocation: any): WeatherData => {
  const area = userLocation?.area || 'Chennai';
  const baseTemp = 30 + Math.random() * 6; // 30-36°C range for Chennai
  
  // Adjust weather based on location characteristics
  let temperature = baseTemp;
  let condition: WeatherData['condition'] = 'sunny';
  let humidity = 70 + Math.random() * 15; // 70-85% for Chennai
  
  if (area.includes('Beach') || area.includes('Marina')) {
    humidity += 5; // More humid near coast
    temperature -= 1; // Slightly cooler
    condition = Math.random() > 0.7 ? 'cloudy' : 'sunny';
  } else if (area.includes('T. Nagar') || area.includes('Anna Salai')) {
    temperature += 1; // Urban heat island effect
    condition = Math.random() > 0.8 ? 'overcast' : 'sunny';
  }
  
  return {
    temperature: Math.round(temperature),
    condition,
    humidity: Math.round(humidity),
    windSpeed: 8 + Math.random() * 8, // 8-16 km/h
    location: area,
    lastUpdated: new Date(Date.now() - Math.random() * 20 * 60 * 1000)
  };
};

export function WeatherPanel({ weatherData, userLocation, className = '' }: WeatherPanelProps) {
  const data = weatherData || getLocationSpecificWeather(userLocation);

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'overcast':
        return <Cloud className="w-8 h-8 text-gray-600" />;
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
        </div>
      </div>
    </div>
  );
}