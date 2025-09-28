/**
 * API Diagnostics Tool
 * 
 * This script tests the actual API endpoints being called by the 
 * application to determine if they're reachable and returning real data.
 */

import { callBusApi } from '../services/ApiRouter';
import { fetchCMRLParking } from '../services/cmrlParking';
import { fetchPublicServices, fetchTraffic, fetchWeather } from '../services/ExternalDataApiClient';
import { RealDataService } from '../services/RealApiService';

// Output formatting
const SUCCESS = '\x1b[32m✓\x1b[0m'; // Green check
const FAILURE = '\x1b[31m✗\x1b[0m'; // Red cross
const INFO = '\x1b[36m→\x1b[0m'; // Blue arrow

interface ApiTestResult {
  endpoint: string;
  success: boolean;
  source: string;
  dataCount: number;
  responseTime: number;
  error?: string;
}

async function testApi(name: string, apiCall: () => Promise<any>): Promise<ApiTestResult> {
  console.log(`${INFO} Testing ${name}...`);
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Extract data and source
    const data = result.data || result || [];
    const source = result.source || 'unknown';
    const dataCount = Array.isArray(data) ? data.length : (data ? 1 : 0);
    
    console.log(`${SUCCESS} ${name} responded in ${responseTime}ms (source: ${source}, items: ${dataCount})`);
    
    return {
      endpoint: name,
      success: true,
      source,
      dataCount,
      responseTime,
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`${FAILURE} ${name} failed after ${responseTime}ms: ${error instanceof Error ? error.message : String(error)}`);
    
    return {
      endpoint: name,
      success: false,
      source: 'error',
      dataCount: 0,
      responseTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runDiagnostics() {
  console.log('\n=== CHENN-AI API DIAGNOSTICS ===\n');
  
  const results: ApiTestResult[] = [];
  
  // Test all API endpoints
  results.push(await testApi('Weather API', () => fetchWeather()));
  results.push(await testApi('Traffic API', () => fetchTraffic()));
  results.push(await testApi('Public Services API', () => fetchPublicServices()));
  results.push(await testApi('Bus API', () => callBusApi()));
  results.push(await testApi('CMRL Parking API', () => fetchCMRLParking()));
  results.push(await testApi('Metro Status API', () => RealDataService.getMetroStatus()));
  
  // Summary
  console.log('\n=== SUMMARY ===\n');
  
  const successCount = results.filter(r => r.success).length;
  const realDataCount = results.filter(r => r.source === 'live' || r.source === 'cached').length;
  const fallbackCount = results.filter(r => r.source === 'fallback' || r.source === 'mock').length;
  
  console.log(`Total APIs tested: ${results.length}`);
  console.log(`APIs responding: ${successCount} (${Math.round(successCount/results.length*100)}%)`);
  console.log(`Real-time sources: ${realDataCount} (${Math.round(realDataCount/results.length*100)}%)`);
  console.log(`Fallback sources: ${fallbackCount} (${Math.round(fallbackCount/results.length*100)}%)`);
  
  // Detailed results table
  console.log('\n=== DETAILED RESULTS ===\n');
  
  console.log('Endpoint'.padEnd(25) + 'Status'.padEnd(10) + 'Source'.padEnd(12) + 'Items'.padEnd(8) + 'Time (ms)');
  console.log('--------'.padEnd(25) + '------'.padEnd(10) + '------'.padEnd(12) + '-----'.padEnd(8) + '---------');
  
  for (const result of results) {
    const status = result.success ? 'OK' : 'FAILED';
    console.log(
      result.endpoint.padEnd(25) +
      status.padEnd(10) +
      result.source.padEnd(12) +
      String(result.dataCount).padEnd(8) +
      result.responseTime
    );
  }
  
  // Diagnose the overall issue
  console.log('\n=== DIAGNOSIS ===\n');
  
  if (realDataCount === 0) {
    console.log('CRITICAL ISSUE: No APIs are returning real-time data!');
    console.log('Possible causes:');
    console.log('1. All API endpoints may be unreachable (network/server issue)');
    console.log('2. API client implementation is bypassing real API calls');
    console.log('3. All APIs are falling back to mock data immediately');
  } else if (realDataCount < results.length / 2) {
    console.log('MODERATE ISSUE: Less than half of APIs are returning real-time data');
    console.log('Possible causes:');
    console.log('1. Some API endpoints are unreachable');
    console.log('2. Timeout settings may be too strict');
    console.log('3. Error handling might be too aggressive with fallbacks');
  } else {
    console.log('MINOR ISSUES: Most APIs are working but some fallbacks are used');
  }
  
  return {
    results,
    summary: {
      total: results.length,
      success: successCount,
      realData: realDataCount,
      fallback: fallbackCount
    }
  };
}

// Run the diagnostics
runDiagnostics().catch(console.error);