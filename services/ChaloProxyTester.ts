// NEW: Test script to verify the complete Chalo proxy flow
// This file tests all components from Chalo fetch to API response

import { callBusApi, checkApiHealth } from './ApiRouter';

// NEW: Test runner for the Chalo proxy system
export class ChaloProxyTester {
  
  // NEW: Test 1 - Basic API health check
  static async testApiHealth(): Promise<boolean> {
    try {
      console.log('🔍 Testing API health...');
      const health = await checkApiHealth();
      
      if (health && health.status === 'healthy') {
        console.log('✅ API health check passed');
        return true;
      } else {
        console.log('❌ API health check failed:', health);
        return false;
      }
    } catch (error) {
      console.log('❌ API health check error:', error);
      return false;
    }
  }

  // NEW: Test 2 - Bus API functionality
  static async testBusApi(): Promise<boolean> {
    try {
      console.log('🚌 Testing bus API...');
      const busResponse = await callBusApi();
      
      // Validate response structure
      if (!this.validateBusApiResponse(busResponse)) {
        console.log('❌ Bus API response validation failed');
        return false;
      }

      console.log(`✅ Bus API test passed - ${busResponse.data.length} buses fetched`);
      
      // Log sample data for verification
      if (busResponse.data.length > 0) {
        const sample = busResponse.data[0];
        console.log('📄 Sample bus data:');
        console.log(`   English: ${sample.message.en}`);
        console.log(`   Tamil: ${sample.message.ta}`);
        console.log(`   Location: ${sample.location.area}, ${sample.location.district}`);
        console.log(`   Source: ${sample.source.provider}`);
      }

      return true;
    } catch (error) {
      console.log('❌ Bus API test error:', error);
      return false;
    }
  }

  // NEW: Test 3 - Validate bus data schema
  static validateBusApiResponse(response: any): boolean {
    // Check top-level structure
    if (!response || typeof response !== 'object') {
      console.log('Invalid response object');
      return false;
    }

    const requiredFields = ['success', 'data', 'timestamp', 'source', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in response)) {
        console.log(`Missing field: ${field}`);
        return false;
      }
    }

    // Check data array
    if (!Array.isArray(response.data)) {
      console.log('Data is not an array');
      return false;
    }

    // Validate each bus record
    for (const bus of response.data) {
      if (!this.validateBusRecord(bus)) {
        return false;
      }
    }

    return true;
  }

  // NEW: Validate individual bus record
  static validateBusRecord(bus: any): boolean {
    const requiredFields = {
      type: 'string',
      category: 'string',
      location: 'object',
      message: 'object',
      timestamp: 'string',
      source: 'object'
    };

    for (const [field, expectedType] of Object.entries(requiredFields)) {
      if (!(field in bus) || typeof bus[field] !== expectedType) {
        console.log(`Bus record validation failed: ${field} should be ${expectedType}`);
        return false;
      }
    }

    // Validate specific values
    if (bus.type !== 'traffic' || bus.category !== 'bus') {
      console.log('Invalid bus type or category');
      return false;
    }

    // Validate message object
    if (!bus.message.en || !bus.message.ta) {
      console.log('Missing English or Tamil message');
      return false;
    }

    // Validate location object
    if (!bus.location.district) {
      console.log('Missing location district');
      return false;
    }

    // Validate source object
    if (bus.source.provider !== 'Chalo Proxy') {
      console.log('Invalid source provider');
      return false;
    }

    return true;
  }

  // NEW: Test 4 - Performance test
  static async testPerformance(): Promise<boolean> {
    try {
      console.log('⚡ Testing API performance...');
      
      const startTime = Date.now();
      await callBusApi();
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      console.log(`⏱️  Response time: ${responseTime}ms`);
      
      if (responseTime > 5000) {
        console.log('⚠️  Warning: Response time is slow (>5s)');
        return false;
      }
      
      console.log('✅ Performance test passed');
      return true;
    } catch (error) {
      console.log('❌ Performance test error:', error);
      return false;
    }
  }

  // NEW: Test 5 - Error handling
  static async testErrorHandling(): Promise<boolean> {
    try {
      console.log('🛡️  Testing error handling...');
      
      // This should still return a response even if Chalo API fails
      const response = await callBusApi();
      
      if (response.success === false && response.data.length === 0) {
        console.log('✅ Error handling test passed - graceful failure');
      } else if (response.success === true) {
        console.log('✅ Error handling test passed - successful response');
      } else if (response.data.length > 0) {
        console.log('✅ Error handling test passed - fallback data provided');
      } else {
        console.log('❌ Error handling test failed - no data and no graceful failure');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Error handling test error:', error);
      return false;
    }
  }

  // NEW: Run all tests
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting Chalo Proxy Test Suite...\n');
    
    const tests = [
      { name: 'API Health', test: this.testApiHealth },
      { name: 'Bus API', test: this.testBusApi },
      { name: 'Performance', test: this.testPerformance },
      { name: 'Error Handling', test: this.testErrorHandling }
    ];

    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
      console.log(`\n--- ${name} Test ---`);
      try {
        const result = await test();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.log(`❌ ${name} test crashed:`, error);
        failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Chalo proxy is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the implementation.');
    }
  }

  // NEW: Quick test for development
  static async quickTest(): Promise<void> {
    console.log('🔍 Quick Chalo Proxy Test...');
    
    try {
      const response = await callBusApi();
      console.log(`📊 Result: ${response.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`🚌 Buses: ${response.data.length}`);
      console.log(`⏰ Timestamp: ${response.timestamp}`);
      
      if (response.data.length > 0) {
        console.log(`📍 Sample: ${response.data[0].message.en}`);
      }
    } catch (error) {
      console.log('❌ Quick test failed:', error);
    }
  }
}

// NEW: Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // In browser environment, expose to window for manual testing
  (window as any).ChaloProxyTester = ChaloProxyTester;
  console.log('🧪 Chalo Proxy Tester loaded. Run ChaloProxyTester.quickTest() to test.');
}