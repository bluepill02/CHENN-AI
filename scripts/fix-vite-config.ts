/**
 * Vite Config Generator
 * 
 * This script helps fix the CHENN-AI app's real-time data issues by
 * generating a proper Vite configuration with API proxies.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m'; // Green check
const FAILURE = '\x1b[31m✗\x1b[0m'; // Red cross
const WARNING = '\x1b[33m⚠\x1b[0m'; // Yellow warning
const INFO = '\x1b[36m→\x1b[0m'; // Blue arrow
const HEADING = '\x1b[35m■\x1b[0m'; // Purple square

async function updateViteConfig() {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  
  console.log(`${INFO} Updating Vite configuration at ${viteConfigPath}`);
  
  try {
    // Read current config
    const currentConfig = await readFile(viteConfigPath, 'utf-8');
    
    // Check if proxy is already configured
    if (currentConfig.includes('proxy:') && 
        currentConfig.includes('/api/weather') && 
        currentConfig.includes('/api/traffic')) {
      console.log(`${WARNING} API proxy already exists in Vite config. No changes made.`);
      return;
    }
    
    // Create new config with proxy
    let updatedConfig = currentConfig;
    
    // Extract server block if it exists
    const serverBlockRegex = /server:\s*{([^}]*)}/s;
    const serverMatch = currentConfig.match(serverBlockRegex);
    
    if (serverMatch) {
      // Server block exists, add proxy to it
      const serverBlock = serverMatch[0];
      const updatedServerBlock = serverBlock.replace(
        /server:\s*{/,
        `server: {
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
      }
    },`
      );
      
      updatedConfig = currentConfig.replace(serverBlock, updatedServerBlock);
    } else {
      // No server block, add one
      updatedConfig = currentConfig.replace(
        /export default defineConfig\({/,
        `export default defineConfig({
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
      }
    },
    port: 3000,
    open: true,
  },`
      );
    }
    
    // Create backup
    const backupPath = `${viteConfigPath}.backup.${Date.now()}.ts`;
    await writeFile(backupPath, currentConfig);
    console.log(`${SUCCESS} Created backup at ${backupPath}`);
    
    // Write updated config
    await writeFile(viteConfigPath, updatedConfig);
    console.log(`${SUCCESS} Updated Vite configuration with API proxies`);
    
    // Generate .env template if it doesn't exist
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      const envContent = `# CHENN-AI API Keys
# Get these keys from the respective services:
# OpenWeather: https://openweathermap.org/api
# Google Maps: https://developers.google.com/maps/documentation/javascript/get-api-key
# TomTom: https://developer.tomtom.com/

REACT_APP_OPENWEATHER_API_KEY=your_openweather_key_here
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
REACT_APP_TOMTOM_API_KEY=your_tomtom_key_here
`;
      await writeFile(envPath, envContent);
      console.log(`${SUCCESS} Created .env template at ${envPath}`);
    }
    
    console.log(`\n${HEADING} NEXT STEPS\n`);
    console.log(`1. Update your .env file with actual API keys
2. Restart your development server
3. Run the api-diagnostics.ts script to verify connectivity`);
    
  } catch (error) {
    console.error(`${FAILURE} Error updating Vite config:`, error);
  }
}

// Run the update
console.log(`\n${HEADING} CHENN-AI VITE CONFIG UPDATER\n`);
updateViteConfig().catch(console.error);