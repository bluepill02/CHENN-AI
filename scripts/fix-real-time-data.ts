#!/usr/bin/env node

/**
 * CHENN-AI Real-Time Data Fix Tool
 * 
 * This script helps diagnose and fix real-time data flow issues in the CHENN-AI app.
 * It provides a menu-based interface to run different diagnostics and fixes.
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m'; // Green check
const FAILURE = '\x1b[31m✗\x1b[0m'; // Red cross
const WARNING = '\x1b[33m⚠\x1b[0m'; // Yellow warning
const INFO = '\x1b[36m→\x1b[0m'; // Blue arrow
const HEADING = '\x1b[35m■\x1b[0m'; // Purple square
const OPTION = '\x1b[34m●\x1b[0m'; // Blue bullet

// Removing unused interfaces to fix TypeScript errors

function clearScreen(): void {
  console.clear();
}

function showTitle(): void {
  console.log(`
\x1b[33m    ___ _  _ ___ _  _ _  _      _   _    \x1b[0m
\x1b[33m   / __| || | __| \\| | \\| |    /_\\ | |   \x1b[0m
\x1b[33m  | (__| __ | _|| .  | .  |   / _ \\| |__ \x1b[0m
\x1b[33m   \\___|_||_|___|_|\\_|_|\\_|  /_/ \\_\\____|\x1b[0m
                                        
\x1b[36m  Real-Time Data Connectivity Fix Tool\x1b[0m
`);
}

async function showMenu(): Promise<string> {
  clearScreen();
  showTitle();
  
  console.log(`\n${HEADING} DIAGNOSTIC TOOLS\n`);
  console.log(`${OPTION} 1. Run Complete API Diagnostics`);
  console.log(`${OPTION} 2. Test Individual API Endpoints`);
  console.log(`${OPTION} 3. Check Environment Variables`);
  
  console.log(`\n${HEADING} FIX TOOLS\n`);
  console.log(`${OPTION} 4. Fix Vite Configuration`);
  console.log(`${OPTION} 5. Create/Update .env File`);
  
  console.log(`\n${HEADING} UTILITY\n`);
  console.log(`${OPTION} 6. Show API Documentation`);
  console.log(`${OPTION} 0. Exit`);
  
  // Use dynamic import for readline (ES module compatibility)
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<string>((resolve) => {
    readline.question(`\n${INFO} Choose an option: `, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

async function runCommand(command: string, title: string): Promise<null> {
  console.log(`\n${HEADING} ${title}\n`);
  console.log(`${INFO} Running: ${command}\n`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) {
      console.error(`${WARNING} Errors/Warnings:`);
      console.error(stderr);
    }
  } catch (error) {
    console.error(`${FAILURE} Error executing command:`);
    console.error(error);
  }
  
  console.log(`\n${INFO} Press Enter to continue...`);
  
  // Use dynamic import for readline (ES module compatibility)
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<null>((resolve) => {
    readline.question('', () => {
      readline.close();
      resolve(null);
    });
  });
}

async function testIndividualApis(): Promise<void> {
  clearScreen();
  showTitle();
  
  console.log(`\n${HEADING} TEST INDIVIDUAL API ENDPOINTS\n`);
  console.log(`${OPTION} 1. Test Weather API`);
  console.log(`${OPTION} 2. Test Traffic API`);
  console.log(`${OPTION} 3. Test Public Services API`);
  console.log(`${OPTION} 4. Test Bus API`);
  console.log(`${OPTION} 5. Test All APIs`);
  console.log(`${OPTION} 0. Back to main menu`);
  
  // Use dynamic import for readline (ES module compatibility)
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer: string = await new Promise<string>((resolve) => {
    readline.question(`\n${INFO} Choose an API to test: `, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
  
  switch (answer) {
    case '1':
      await runCommand('npx ts-node scripts/test-api.ts weather', 'TESTING WEATHER API');
      break;
    case '2':
      await runCommand('npx ts-node scripts/test-api.ts traffic', 'TESTING TRAFFIC API');
      break;
    case '3':
      await runCommand('npx ts-node scripts/test-api.ts public-services', 'TESTING PUBLIC SERVICES API');
      break;
    case '4':
      await runCommand('npx ts-node scripts/test-api.ts bus', 'TESTING BUS API');
      break;
    case '5':
      await runCommand('npx ts-node scripts/test-api.ts all', 'TESTING ALL APIS');
      break;
    case '0':
      return;
    default:
      console.log(`${WARNING} Invalid option`);
      await testIndividualApis();
  }
}

async function checkEnvVariables(): Promise<void> {
  clearScreen();
  showTitle();
  
  console.log(`\n${HEADING} ENVIRONMENT VARIABLES CHECK\n`);
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log(`${SUCCESS} .env file found at ${envPath}`);
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      // Check required keys
      const requiredKeys = [
        'REACT_APP_OPENWEATHER_API_KEY',
        'REACT_APP_GOOGLE_MAPS_API_KEY',
        'REACT_APP_TOMTOM_API_KEY'
      ];
      
      const missingKeys: string[] = [];
      const configuredKeys: string[] = [];
      
      requiredKeys.forEach(key => {
        if (!envContent.includes(key + '=')) {
          missingKeys.push(key);
        } else if (envContent.includes(key + '=your_') || 
                 envContent.includes(key + '=') && !envContent.includes(key + '=') && !envContent.trim()) {
          missingKeys.push(key);
        } else {
          configuredKeys.push(key);
        }
      });
      
      if (missingKeys.length === 0) {
        console.log(`${SUCCESS} All required API keys are configured`);
      } else {
        console.log(`${WARNING} Missing or incomplete API keys: ${missingKeys.join(', ')}`);
        console.log(`\n${INFO} Add these keys to your .env file with valid values`);
      }
      
      console.log('\n.env file content:');
      console.log('-------------------');
      console.log(envContent);
      
    } catch (error) {
      console.error(`${FAILURE} Error reading .env file:`, error);
    }
  } else {
    console.log(`${WARNING} No .env file found at ${envPath}`);
    console.log(`${INFO} Create a .env file with the following content:`);
    console.log(`
# CHENN-AI API Keys
# Get these keys from the respective services:
# OpenWeather: https://openweathermap.org/api
# Google Maps: https://developers.google.com/maps/documentation/javascript/get-api-key
# TomTom: https://developer.tomtom.com/

REACT_APP_OPENWEATHER_API_KEY=your_openweather_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
REACT_APP_TOMTOM_API_KEY=your_tomtom_key_here
`);
  }
  
  console.log(`\n${INFO} Press Enter to continue...`);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise<void>((resolve) => {
    readline.question('', () => {
      readline.close();
      resolve();
    });
  });
}

async function createUpdateEnvFile(): Promise<void> {
  clearScreen();
  showTitle();
  
  console.log(`\n${HEADING} CREATE/UPDATE .ENV FILE\n`);
  
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);
  
  let existingContent = '';
  if (envExists) {
    try {
      existingContent = fs.readFileSync(envPath, 'utf-8');
      console.log(`${INFO} Existing .env file found`);
    } catch (error) {
      console.error(`${FAILURE} Error reading existing .env file:`, error);
    }
  }
  
  console.log(`\n${INFO} Enter your API keys (leave blank to keep existing):`);
  
  // Use dynamic import for readline (ES module compatibility)
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Helper function to get existing value
  function getExistingValue(key: string): string {
    const regex = new RegExp(`${key}=(.*)`, 'g');
    const match = regex.exec(existingContent);
    return match ? match[1] : '';
  }
  
  const openWeatherKey: string = await new Promise<string>((resolve) => {
    const existing = getExistingValue('REACT_APP_OPENWEATHER_API_KEY');
    readline.question(`OpenWeather API Key ${existing ? `(current: ${existing})` : ''}: `, (answer: string) => {
      resolve(answer || existing);
    });
  });
  
  const googleMapsKey: string = await new Promise<string>((resolve) => {
    const existing = getExistingValue('REACT_APP_GOOGLE_MAPS_API_KEY');
    readline.question(`Google Maps API Key ${existing ? `(current: ${existing})` : ''}: `, (answer: string) => {
      resolve(answer || existing);
    });
  });
  
  const tomTomKey: string = await new Promise<string>((resolve) => {
    const existing = getExistingValue('REACT_APP_TOMTOM_API_KEY');
    readline.question(`TomTom API Key ${existing ? `(current: ${existing})` : ''}: `, (answer: string) => {
      readline.close();
      resolve(answer || existing);
    });
  });
  
  const envContent = `# CHENN-AI API Keys
# Last updated: ${new Date().toISOString()}

REACT_APP_OPENWEATHER_API_KEY=${openWeatherKey}
REACT_APP_GOOGLE_MAPS_API_KEY=${googleMapsKey}
REACT_APP_TOMTOM_API_KEY=${tomTomKey}
`;
  
  try {
    // Create backup if file exists
    if (envExists) {
      const backupPath = `${envPath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, existingContent);
      console.log(`${SUCCESS} Backup created at ${backupPath}`);
    }
    
    // Write new .env file
    fs.writeFileSync(envPath, envContent);
    console.log(`${SUCCESS} .env file updated successfully`);
  } catch (error) {
    console.error(`${FAILURE} Error writing .env file:`, error);
  }
  
  console.log(`\n${INFO} Press Enter to continue...`);
  
  // Use dynamic import for readline (ES module compatibility)
  const readline2 = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise<void>((resolve) => {
    readline2.question('', () => {
      readline2.close();
      resolve();
    });
  });
}

async function showApiDocumentation(): Promise<void> {
  clearScreen();
  showTitle();
  
  console.log(`\n${HEADING} API DOCUMENTATION\n`);
  
  console.log(`${INFO} External APIs used by CHENN-AI:\n`);
  
  console.log(`${OPTION} OpenWeather API`);
  console.log(`  - Documentation: https://openweathermap.org/api`);
  console.log(`  - Used for: Weather data, air quality`);
  console.log(`  - Endpoint: https://api.openweathermap.org/data/2.5/weather\n`);
  
  console.log(`${OPTION} TomTom Traffic API`);
  console.log(`  - Documentation: https://developer.tomtom.com/`);
  console.log(`  - Used for: Traffic flow data`);
  console.log(`  - Endpoint: https://api.tomtom.com/traffic/services/4/flowSegmentData\n`);
  
  console.log(`${OPTION} Google Maps API`);
  console.log(`  - Documentation: https://developers.google.com/maps/documentation/javascript/`);
  console.log(`  - Used for: Local services, geocoding`);
  console.log(`  - Endpoint: https://maps.googleapis.com/maps/api/place/nearbysearch\n`);
  
  console.log(`${OPTION} Chennai Public Services API (simulation)`);
  console.log(`  - Used for: City services information`);
  console.log(`  - Endpoint: /api/public-services\n`);
  
  console.log(`${OPTION} CMRL (Chennai Metro) API (simulation)`);
  console.log(`  - Used for: Metro status and schedules`);
  console.log(`  - Endpoint: Internal simulation\n`);
  
  console.log(`${INFO} Press Enter to continue...`);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise<void>((resolve) => {
    readline.question('', () => {
      readline.close();
      resolve();
    });
  });
}

// Create the test-api.ts script dynamically
async function ensureTestApiScript(): Promise<void> {
  const testApiPath = path.join(process.cwd(), 'scripts', 'test-api.ts');
  
  if (!fs.existsSync(testApiPath)) {
    const scriptContent = `/**
 * Individual API Test Script
 */
import { fetchPublicServices, fetchTraffic, fetchWeather } from '../services/ExternalDataApiClient';
import { callBusApi } from '../services/ApiRouter';
import { RealDataService } from '../services/RealApiService';
import type { LocationData } from '../services/LocationService';

// Output formatting
const SUCCESS = '\\x1b[32m✓\\x1b[0m';
const FAILURE = '\\x1b[31m✗\\x1b[0m';
const INFO = '\\x1b[36m→\\x1b[0m';

async function testApi(name: string, apiCall: () => Promise<any>) {
  console.log(\`\${INFO} Testing \${name}...\`);
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract data source
    const source = result.source || (result.data?.source) || 'unknown';
    const isRealData = source === 'live' || source === 'cached';
    
    console.log(\`\${SUCCESS} \${name} responded in \${responseTime}ms (source: \${source})\`);
    console.log('Response:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
    
    return {
      success: true,
      source,
      responseTime,
      isRealData
    };
  } catch (error) {
    console.log(\`\${FAILURE} \${name} failed: \${error instanceof Error ? error.message : String(error)}\`);
    
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
`;

    try {
      if (!fs.existsSync(path.dirname(testApiPath))) {
        fs.mkdirSync(path.dirname(testApiPath), { recursive: true });
      }
      fs.writeFileSync(testApiPath, scriptContent);
    } catch (error) {
      console.error(`${FAILURE} Error creating test-api.ts script:`, error);
    }
  }
}

// Main function
async function main(): Promise<void> {
  // Ensure test script exists
  await ensureTestApiScript();
  
  while (true) {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await runCommand('npx ts-node scripts/api-connector.ts', 'COMPLETE API DIAGNOSTICS');
        break;
      case '2':
        await testIndividualApis();
        break;
      case '3':
        await checkEnvVariables();
        break;
      case '4':
        await runCommand('npx ts-node scripts/fix-vite-config.ts', 'FIXING VITE CONFIGURATION');
        break;
      case '5':
        await createUpdateEnvFile();
        break;
      case '6':
        await showApiDocumentation();
        break;
      case '0':
        clearScreen();
        console.log(`\n${SUCCESS} Thank you for using CHENN-AI Real-Time Data Fix Tool!\n`);
        process.exit(0);
      default:
        console.log(`\n${WARNING} Invalid option. Press Enter to continue...`);
        await new Promise<null>(async resolve => {
          const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
          });
          readline.question('', () => {
            readline.close();
            resolve(null);
          });
        });
    }
  }
}

// Start the app
main().catch(console.error);