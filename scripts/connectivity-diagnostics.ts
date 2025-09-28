/**
 * CHENN-AI Connectivity Diagnostics Tool
 * 
 * This script tests all API connections, analyzes the configuration,
 * and provides recommendations for fixing real-time data flow issues.
 */

import { callBusApi, checkApiHealth, testAllEndpoints } from '../services/ApiRouter';
import { fetchPublicServices, fetchTraffic, fetchWeather } from '../services/ExternalDataApiClient';
import { RealDataService } from '../services/RealApiService';

// Environment variables check
const API_KEYS = {
  OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY,
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  TOMTOM_API_KEY: process.env.REACT_APP_TOMTOM_API_KEY,
};

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m'; // Green check
const FAILURE = '\x1b[31m✗\x1b[0m'; // Red cross
const WARNING = '\x1b[33m⚠\x1b[0m'; // Yellow warning
const INFO = '\x1b[36m→\x1b[0m'; // Blue arrow
const HEADING = '\x1b[35m■\x1b[0m'; // Purple square

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  recommendation?: string;
}

async function testApiEndpoint(name: string, apiCall: () => Promise<any>): Promise<DiagnosticResult> {
  console.log(`${INFO} Testing ${name}...`);
  
  try {
    const startTime = Date.now();
    const result = await apiCall();
    const responseTime = Date.now() - startTime;
    
    // Extract data source and check if it's using real data or fallbacks
    const source = result.source || (result.data?.source) || 'unknown';
    const isRealData = source === 'live' || source === 'cached';
    const isFallback = source === 'fallback' || source === 'mock' || source === 'simulation';
    
    if (isRealData) {
      console.log(`${SUCCESS} ${name} responded with REAL data in ${responseTime}ms (source: ${source})`);
      return {
        status: 'success',
        message: `${name} is working correctly with real-time data`,
        details: `Response time: ${responseTime}ms, Source: ${source}`
      };
    } else if (isFallback) {
      console.log(`${WARNING} ${name} responded with FALLBACK data in ${responseTime}ms (source: ${source})`);
      return {
        status: 'warning',
        message: `${name} is using fallback data instead of real-time data`,
        details: `Source: ${source}`,
        recommendation: 'Check API credentials and network connectivity'
      };
    } else {
      console.log(`${WARNING} ${name} responded in ${responseTime}ms but source is unclear: ${source}`);
      return {
        status: 'warning',
        message: `${name} responded but data source is unclear`,
        details: `Source: ${source}`,
        recommendation: 'Investigate response data structure'
      };
    }
  } catch (error) {
    console.log(`${FAILURE} ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      status: 'error',
      message: `${name} failed to connect`,
      details: error instanceof Error ? error.message : String(error),
      recommendation: 'Check endpoint URL and credentials'
    };
  }
}

async function checkEnvironmentVariables(): Promise<DiagnosticResult> {
  console.log(`${INFO} Checking environment variables...`);
  
  const missingKeys = Object.entries(API_KEYS)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingKeys.length === 0) {
    console.log(`${SUCCESS} All required API keys are configured`);
    return {
      status: 'success',
      message: 'All required API keys are configured'
    };
  } else {
    console.log(`${WARNING} Missing API keys: ${missingKeys.join(', ')}`);
    return {
      status: 'warning',
      message: `Missing API keys: ${missingKeys.join(', ')}`,
      recommendation: 'Add the missing API keys to your .env file'
    };
  }
}

async function checkApiImplementation(): Promise<DiagnosticResult> {
  console.log(`${INFO} Analyzing API implementation...`);
  
  // Analyze the paths used in the API clients
  const apiEndpoints = [
    { path: '/api/weather', client: 'ExternalDataApiClient' },
    { path: '/api/traffic', client: 'ExternalDataApiClient' },
    { path: '/api/public-services', client: 'ExternalDataApiClient' },
    { path: '/api/bus', client: 'ApiRouter' }
  ];
  
  // Check if any of the API endpoints conflict with API router paths
  try {
    const registeredRoutes = await testAllEndpoints();
    
    const missingRoutes = apiEndpoints.filter(endpoint => 
      !Object.keys(registeredRoutes).includes(endpoint.path)
    );
    
    if (missingRoutes.length > 0) {
      console.log(`${WARNING} Some API paths referenced in clients are not registered in API router:`);
      missingRoutes.forEach(route => console.log(`  - ${route.path} (used in ${route.client})`));
      
      return {
        status: 'warning',
        message: 'API path mismatch between clients and router',
        details: `Unregistered paths: ${missingRoutes.map(r => r.path).join(', ')}`,
        recommendation: 'Register these paths in ApiRouter or update client endpoints'
      };
    } else {
      console.log(`${SUCCESS} API client paths match registered routes`);
      return {
        status: 'success',
        message: 'API client paths match registered routes'
      };
    }
  } catch (error) {
    console.log(`${FAILURE} Error analyzing API implementation: ${error instanceof Error ? error.message : String(error)}`);
    return {
      status: 'error',
      message: 'Error analyzing API implementation',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runDiagnostics() {
  console.log(`\n${HEADING} CHENN-AI CONNECTIVITY DIAGNOSTICS\n`);

  // Test results
  const results: Record<string, DiagnosticResult> = {};
  
  // 1. Environment variables
  results.environment = await checkEnvironmentVariables();
  
  // 2. API router health
  try {
    const apiHealth = await checkApiHealth();
    console.log(`${SUCCESS} API Router health check: ${apiHealth?.status}`);
    results.apiRouter = {
      status: 'success',
      message: 'API Router is working correctly',
      details: JSON.stringify(apiHealth)
    };
  } catch (error) {
    console.log(`${FAILURE} API Router health check failed`);
    results.apiRouter = {
      status: 'error',
      message: 'API Router health check failed',
      details: error instanceof Error ? error.message : String(error),
      recommendation: 'Ensure API Router is properly initialized'
    };
  }
  
  // 3. API implementation check
  results.apiImplementation = await checkApiImplementation();
  
  // 4. API endpoints check
  try {
    const chennaiLocation = { 
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
    
    // Test all API endpoints
    results.weatherApi = await testApiEndpoint('Weather API', () => fetchWeather());
    results.trafficApi = await testApiEndpoint('Traffic API', () => fetchTraffic());
    results.publicServicesApi = await testApiEndpoint('Public Services API', () => fetchPublicServices());
    results.busApi = await testApiEndpoint('Bus API', () => callBusApi());
    results.metroApi = await testApiEndpoint('Metro Status API', () => RealDataService.getMetroStatus());
    results.weatherRealApi = await testApiEndpoint('OpenWeather API', () => 
      RealDataService.getWeatherData(chennaiLocation));
    
  } catch (error) {
    console.error('Error during API testing:', error);
  }
  
  // Summary
  console.log(`\n${HEADING} DIAGNOSTIC SUMMARY\n`);
  
  const errorCount = Object.values(results).filter(r => r.status === 'error').length;
  const warningCount = Object.values(results).filter(r => r.status === 'warning').length;
  const successCount = Object.values(results).filter(r => r.status === 'success').length;
  
  console.log(`Tests run: ${Object.keys(results).length}`);
  console.log(`${SUCCESS} Success: ${successCount}`);
  console.log(`${WARNING} Warnings: ${warningCount}`);
  console.log(`${FAILURE} Errors: ${errorCount}`);
  
  // Recommendations
  console.log(`\n${HEADING} RECOMMENDATIONS\n`);
  
  if (errorCount === 0 && warningCount === 0) {
    console.log(`${SUCCESS} All systems are working properly. No issues detected.`);
  } else {
    // Print all recommendations
    Object.entries(results)
      .filter(([_, result]) => result.recommendation)
      .forEach(([key, result]) => {
        console.log(`${result.status === 'error' ? FAILURE : WARNING} ${key}: ${result.recommendation}`);
      });

    // Root cause analysis
    console.log(`\n${HEADING} ROOT CAUSE ANALYSIS\n`);
    
    if (results.environment.status !== 'success') {
      console.log(`${FAILURE} Missing API keys are preventing real data connections`);
      console.log(`  Add the required API keys to your .env file and restart the application`);
    }
    else if (results.apiRouter.status !== 'success') {
      console.log(`${FAILURE} API Router is not functioning properly`);
      console.log(`  Check the ApiRouter implementation and ensure it's properly initialized`);
    }
    else if (Object.values(results).some(r => r.status === 'error')) {
      console.log(`${FAILURE} Some API endpoints are failing completely`);
      console.log(`  Check network connectivity and API endpoint configurations`);
    }
    else if (Object.values(results).every(r => r.status === 'warning')) {
      console.log(`${WARNING} All APIs are falling back to mock data`);
      console.log(`  This could be due to:
  1. API keys are configured but incorrect or expired
  2. Network connectivity issues to external APIs
  3. CORS issues preventing browser requests
  4. API rate limits may be exceeded
  5. Implementation might be bypassing real API calls`);
    }
  }
  
  return results;
}

// Run the diagnostics
console.log('Starting CHENN-AI connectivity diagnostics...');
runDiagnostics().catch(console.error);