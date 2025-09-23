// Real API service for Chennai Community App
import { LocationData } from './LocationService';

// API Configuration
const API_CONFIG = {
  OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY,
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  TOMTOM_API_KEY: process.env.REACT_APP_TOMTOM_API_KEY,
};

// API Endpoints
const ENDPOINTS = {
  weather: 'https://api.openweathermap.org/data/2.5/weather',
  forecast: 'https://api.openweathermap.org/data/2.5/forecast',
  traffic: 'https://api.tomtom.com/traffic/services/4/flowSegmentData',
  geocoding: 'https://api.openweathermap.org/geo/1.0/direct',
  airQuality: 'https://api.openweathermap.org/data/2.5/air_pollution',
};

export interface RealWeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  lastUpdated: Date;
}

export interface RealTrafficData {
  routeName: string;
  currentSpeed: number;
  freeFlowSpeed: number;
  currentTravelTime: number;
  freeFlowTravelTime: number;
  confidence: number;
  roadClosure: boolean;
}

export class RealDataService {
  
  // Fetch real weather data for Chennai location
  static async getWeatherData(location: LocationData): Promise<RealWeatherData> {
    try {
      const { latitude, longitude } = location;
      
      if (!latitude || !longitude) {
        throw new Error('Location coordinates not available');
      }

      const weatherResponse = await fetch(
        `${ENDPOINTS.weather}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      return {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main.toLowerCase(),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        pressure: weatherData.main.pressure,
        visibility: weatherData.visibility / 1000, // Convert to km
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Fetch air quality data
  static async getAirQualityData(location: LocationData) {
    try {
      const { latitude, longitude } = location;
      
      const response = await fetch(
        `${ENDPOINTS.airQuality}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}`
      );

      const data = await response.json();
      const aqi = data.list[0].main.aqi;
      
      // Convert AQI to readable format
      const airQualityMap = {
        1: 'good',
        2: 'fair', 
        3: 'moderate',
        4: 'poor',
        5: 'very poor'
      };

      return {
        aqi: aqi,
        quality: airQualityMap[aqi as keyof typeof airQualityMap] || 'unknown',
        components: data.list[0].components
      };
    } catch (error) {
      console.error('Error fetching air quality:', error);
      throw error;
    }
  }

  // Fetch real traffic data for Chennai routes
  static async getTrafficData(location: LocationData): Promise<RealTrafficData[]> {
    try {
      const { latitude, longitude } = location;
      
      // Define major Chennai routes based on location
      const chennaiRoutes = [
        { name: 'Anna Salai', points: ['13.0627,80.2707', '13.0878,80.2785'] },
        { name: 'Mount Road', points: ['13.0678,80.2365', '13.0727,80.2609'] },
        { name: 'ECR', points: ['12.9716,80.2590', '13.0732,80.2609'] },
        { name: 'OMR', points: ['12.9716,80.2590', '12.8438,80.2221'] },
        { name: 'GST Road', points: ['12.9951,80.1821', '13.0475,80.2208'] }
      ];

      const trafficPromises = chennaiRoutes.map(async (route) => {
        const [start, end] = route.points;
        
        const response = await fetch(
          `${ENDPOINTS.traffic}/${start}/${end}/10/-1?key=${API_CONFIG.TOMTOM_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Traffic API error for ${route.name}`);
        }

        const data = await response.json();
        const flowSegment = data.flowSegmentData;

        return {
          routeName: route.name,
          currentSpeed: flowSegment.currentSpeed,
          freeFlowSpeed: flowSegment.freeFlowSpeed,
          currentTravelTime: flowSegment.currentTravelTime,
          freeFlowTravelTime: flowSegment.freeFlowTravelTime,
          confidence: flowSegment.confidence,
          roadClosure: flowSegment.roadClosure || false
        };
      });

      return await Promise.all(trafficPromises);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      throw error;
    }
  }

  // Fetch Chennai Metro real-time data
  static async getMetroStatus() {
    try {
      // This would be Chennai Metro Rail Limited (CMRL) API
      // Currently no public API available, would need to scrape or get access
      
      // Mock implementation for now - would be replaced with real API
      return {
        blueLineStatus: 'operational',
        greenLineStatus: 'operational', 
        redLineStatus: 'under_construction',
        currentDelays: [],
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching metro status:', error);
      throw error;
    }
  }

  // Fetch Chennai Corporation water supply data
  static async getWaterSupplyStatus(pincode: string) {
    try {
      // This would integrate with Chennai Corporation APIs
      // Currently no public API available
      
      // Would fetch from: https://chennaicorporation.gov.in
      // For water supply schedules, cuts, quality reports
      
      return {
        supplyStatus: 'normal',
        nextCut: null,
        quality: 'good',
        pressure: 'adequate',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching water supply data:', error);
      throw error;
    }
  }

  // Integrate with Google Places API for local services
  static async getNearbyServices(location: LocationData, serviceType: string) {
    try {
      const { latitude, longitude } = location;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=2000&type=${serviceType}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      return data.results.map((place: any) => ({
        name: place.name,
        rating: place.rating,
        address: place.vicinity,
        isOpen: place.opening_hours?.open_now,
        priceLevel: place.price_level,
        types: place.types,
        placeId: place.place_id
      }));
    } catch (error) {
      console.error('Error fetching nearby services:', error);
      throw error;
    }
  }

  // Geocode pincode to get precise coordinates
  static async geocodePincode(pincode: string) {
    try {
      const response = await fetch(
        `${ENDPOINTS.geocoding}?q=${pincode},Chennai,IN&limit=1&appid=${API_CONFIG.OPENWEATHER_API_KEY}`
      );

      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('Pincode not found');
      }

      return {
        latitude: data[0].lat,
        longitude: data[0].lon,
        area: data[0].name,
        state: data[0].state,
        country: data[0].country
      };
    } catch (error) {
      console.error('Error geocoding pincode:', error);
      throw error;
    }
  }
}

// Environment variables needed:
// REACT_APP_OPENWEATHER_API_KEY=your_openweather_key
// REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key  
// REACT_APP_TOMTOM_API_KEY=your_tomtom_key