/**
 * Individual API Test Script
 */
import { fetchPublicServices, fetchTraffic, fetchWeather } from '../services/ExternalDataApiClient';
import { callBusApi } from '../services/ApiRouter';
import { RealDataService } from '../services/RealApiService';
import type { LocationData } from '../services/LocationService';

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m';
const FAILURE = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[36m→\x1b[0m';

async function testApi(name: string, apiCall: () => Promise<any>) {
  console.log(`${INFO} Testing ${name}...`);
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract data source
    const source = result.source || (result.data?.source) || 'unknown';
    const isRealData = source === 'live' || source === 'cached';
    
    console.log(`${SUCCESS} ${name} responded in ${responseTime}ms (source: ${source})`);
    console.log('Response:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
    
    return {
      success: true,
      source,
      responseTime,
      isRealData
    };
  } catch (error) {
    console.log(`${FAILURE} ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  const apiType = process.argv[2] || 'all';
  
  const chennaiLocation: LocationData = { 
    pincode: '600001', 
    area: 'Chennai Central',
    zone: 'Central Chennai', 
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0827, 
    longitude: 80.2707,
    verified: true,
    timestamp: Date.now()
  };

  switch (apiType) {
    case 'weather':
      await testApi('Weather API', () => fetchWeather());
      break;
    case 'traffic':
      await testApi('Traffic API', () => fetchTraffic());
      break;
    case 'public-services':
      await testApi('Public Services API', () => fetchPublicServices());
      break;
    case 'bus':
      await testApi('Bus API', () => callBusApi());
      break;
    case 'metro':
      await testApi('Metro Status API', () => RealDataService.getMetroStatus());
      break;
    case 'openweather':
      await testApi('OpenWeather API', () => RealDataService.getWeatherData(chennaiLocation));
      break;
    case 'all':
    default:
      await testApi('Weather API', () => fetchWeather());
      await testApi('Traffic API', () => fetchTraffic());
      await testApi('Public Services API', () => fetchPublicServices());
      await testApi('Bus API', () => callBusApi());
      await testApi('Metro Status API', () => RealDataService.getMetroStatus());
      await testApi('OpenWeather API', () => RealDataService.getWeatherData(chennaiLocation));
      break;
  }
}

main().catch(console.error);
