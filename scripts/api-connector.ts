/**
 * CHENN-AI API Connector
 * 
 * A comprehensive tool to:
 * 1. Diagnose real-time data connectivity issues
 * 2. Test all API endpoints
 * 3. Provide detailed recommendations for fixing issues
 * 4. Assist with setting up proper environment variables
 * 
 * This script combines diagnostic testing with solutions that can
 * be immediately implemented to restore real-time data flow.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { callBusApi, checkApiHealth, testAllEndpoints } from '../services/ApiRouter';
import { fetchPublicServices, fetchTraffic, fetchWeather } from '../services/ExternalDataApiClient';
import type { LocationData } from '../services/LocationService';
import { RealDataService } from '../services/RealApiService';

// Convert fs functions to promises
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m'; // Green check
const FAILURE = '\x1b[31m✗\x1b[0m'; // Red cross
const WARNING = '\x1b[33m⚠\x1b[0m'; // Yellow warning
const INFO = '\x1b[36m→\x1b[0m'; // Blue arrow
const HEADING = '\x1b[35m■\x1b[0m'; // Purple square
const CMD = '\x1b[33m$\x1b[0m'; // Yellow command

// Test result types
interface TestResult {
  success: boolean;
  message: string;
  source?: string;
  data?: any;
  error?: string;
  responseTime?: number;
}

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  recommendation?: string;
}

interface ProxyStatus {
  endpoint: string;
  exists: boolean;
  registered: boolean;
  implementation: boolean;
  cors?: boolean;
}

// Check if we're in a Vite project
async function detectViteConfiguration(): Promise<DiagnosticResult> {
  try {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    const configExists = fs.existsSync(viteConfigPath);
    
    if (!configExists) {
      return {
        status: 'error',
        message: 'Vite configuration not found',
        recommendation: 'Make sure you are running this script in the root of your project'
      };
    }

    const configContent = await readFile(viteConfigPath, 'utf-8');
    
    // Check if the config has proxy settings
    const hasProxySettings = configContent.includes('proxy:') || configContent.includes('server:');
    
    if (!hasProxySettings) {
      return {
        status: 'warning',
        message: 'Vite configuration exists but no API proxy settings found',
        details: 'APIs called from the browser need CORS handling or a proxy',
        recommendation: 'Add proxy configuration to vite.config.ts for backend API calls'
      };
    }

    // Check proxy endpoints needed by our app
    const requiredEndpoints = ['/api/weather', '/api/traffic', '/api/public-services', '/api/bus'];
    const missingEndpoints = [];

    for (const endpoint of requiredEndpoints) {
      if (!configContent.includes(`'${endpoint}'`) && !configContent.includes(`"${endpoint}"`)) {
        missingEndpoints.push(endpoint);
      }
    }

    if (missingEndpoints.length > 0) {
      return {
        status: 'warning',
        message: `Vite proxy configuration missing endpoints: ${missingEndpoints.join(', ')}`,
        recommendation: 'Add these endpoints to your Vite proxy configuration'
      };
    }

    return {
      status: 'success',
      message: 'Vite configuration with proxy settings detected',
      details: 'All required API endpoints appear to be configured'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Error checking Vite configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check environment variables
async function checkEnvironmentVariables(): Promise<DiagnosticResult> {
  console.log(`${INFO} Checking environment variables...`);
  
  // Look for .env file
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  const envExists = fs.existsSync(envPath);
  const envExampleExists = fs.existsSync(envExamplePath);
  
  let envVars: Record<string, string | undefined> = {};
  
  if (envExists) {
    try {
      const envContent = await readFile(envPath, 'utf-8');
      // Very simple .env parser
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim();
        }
      });
    } catch (error) {
      console.log(`${WARNING} Could not read .env file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check for required API keys
  const requiredKeys = [
    'REACT_APP_OPENWEATHER_API_KEY',
    'REACT_APP_GOOGLE_MAPS_API_KEY',
    'REACT_APP_TOMTOM_API_KEY'
  ];
  
  const missingKeys = requiredKeys.filter(key => !process.env[key] && !envVars[key]);
  
  if (missingKeys.length === 0) {
    console.log(`${SUCCESS} All required API keys are configured`);
    return {
      status: 'success',
      message: 'All required API keys are configured'
    };
  } else {
    console.log(`${WARNING} Missing API keys: ${missingKeys.join(', ')}`);
    
    // Generate .env content suggestions
    let envSuggestion = '';
    
    if (envExampleExists) {
      try {
        envSuggestion = await readFile(envExamplePath, 'utf-8');
      } catch (error) {
        // Continue even if we can't read .env.example
      }
    }
    
    if (!envSuggestion) {
      envSuggestion = `# CHENN-AI API Keys
REACT_APP_OPENWEATHER_API_KEY=your_openweather_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
REACT_APP_TOMTOM_API_KEY=your_tomtom_key_here
`;
    }
    
    return {
      status: 'warning',
      message: `Missing API keys: ${missingKeys.join(', ')}`,
      details: `Required keys: ${requiredKeys.join(', ')}`,
      recommendation: `Create a .env file with the following content:

${envSuggestion}

Get API keys from:
- OpenWeather: https://openweathermap.org/api
- Google Maps: https://developers.google.com/maps/documentation/javascript/get-api-key
- TomTom: https://developer.tomtom.com/`
    };
  }
}

// Test API endpoints
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

// Check API server implementation (proxy or mock)
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

// Run all diagnostics
async function runDiagnostics() {
  console.log(`\n${HEADING} CHENN-AI CONNECTIVITY DIAGNOSTICS\n`);

  // Test results
  const results: Record<string, DiagnosticResult> = {};
  
  // 1. Environment variables
  results.environment = await checkEnvironmentVariables();
  
  // 2. Vite configuration check
  results.viteConfig = await detectViteConfiguration();
  
  // 3. API router health
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
  
  // 4. API implementation check
  results.apiImplementation = await checkApiImplementation();
  
  // 5. API endpoints check
  try {
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

    // Root cause analysis and fixes
    console.log(`\n${HEADING} ROOT CAUSE ANALYSIS AND SOLUTIONS\n`);
    
    if (results.environment.status !== 'success') {
      console.log(`${FAILURE} Missing API keys are preventing real data connections`);
      console.log(`  Add the required API keys to your .env file and restart the application`);
      
      // Suggest .env file creation
      console.log(`\n${HEADING} CREATE .ENV FILE\n`);
      console.log(`Create a file named .env in your project root with the following content:`);
      console.log(`
# CHENN-AI API Keys
REACT_APP_OPENWEATHER_API_KEY=your_openweather_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
REACT_APP_TOMTOM_API_KEY=your_tomtom_key_here
`);
    }
    else if (results.apiRouter.status !== 'success') {
      console.log(`${FAILURE} API Router is not functioning properly`);
      console.log(`  Check the ApiRouter implementation and ensure it's properly initialized`);
      
      // Suggest fixes
      console.log(`\n${HEADING} API ROUTER FIXES\n`);
      console.log(`1. Make sure ApiRouter is properly imported and initialized in your main app
2. Check for errors in the ApiRouter implementation
3. Verify all required endpoints are registered
4. Check for console errors during initialization`);
    }
    else if (results.viteConfig.status !== 'success') {
      console.log(`${FAILURE} Vite configuration issues affecting API proxying`);
      
      // Suggest Vite config fixes
      console.log(`\n${HEADING} VITE CONFIG FIXES\n`);
      console.log(`Update your vite.config.ts to include the following proxy configuration:`);
      console.log(`
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/weather': {
        target: 'https://api.openweathermap.org/data/2.5',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/weather/, '')
      },
      '/api/traffic': {
        target: 'https://api.tomtom.com/traffic/services/4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/traffic/, '')
      },
      '/api/public-services': {
        target: 'https://data.chennai.gov.in/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api\\/public-services/, '/services')
      },
      '/api/bus': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
`);
    }
    else if (Object.values(results).some(r => r.status === 'error')) {
      console.log(`${FAILURE} Some API endpoints are failing completely`);
      console.log(`  Check network connectivity and API endpoint configurations`);
      
      // Suggest testing the API endpoints directly
      console.log(`\n${HEADING} TEST API ENDPOINTS DIRECTLY\n`);
      console.log(`Try accessing the API endpoints directly in your browser or with curl:`);
      console.log(`
${CMD} curl https://api.openweathermap.org/data/2.5/weather?lat=13.0827&lon=80.2707&appid=YOUR_API_KEY&units=metric
${CMD} curl https://api.tomtom.com/traffic/services/4/flowSegmentData/13.0627,80.2707/13.0878,80.2785/10/-1?key=YOUR_API_KEY
`);
    }
    else if (Object.values(results).every(r => r.status === 'warning')) {
      console.log(`${WARNING} All APIs are falling back to mock data`);
      console.log(`  This could be due to:
  1. API keys are configured but incorrect or expired
  2. Network connectivity issues to external APIs
  3. CORS issues preventing browser requests
  4. API rate limits may be exceeded
  5. Implementation might be bypassing real API calls`);
      
      // Suggest modifying the ExternalDataApiClient
      console.log(`\n${HEADING} CHECK EXTERNAL DATA API CLIENT\n`);
      console.log(`Look for implementation issues in ExternalDataApiClient.ts:`);
      console.log(`
1. Verify the fetchWithFallback function is properly handling responses
2. Add console logging to see the actual API responses before transformation
3. Check if CORS issues are causing failures (see Network tab in browser DevTools)
4. Make sure real API keys are being used and not placeholders
`);
    }
  }
  
  return results;
}

// Run the diagnostics
console.log('Starting CHENN-AI connectivity diagnostics...');
runDiagnostics().catch(console.error);