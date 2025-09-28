// NEW: API endpoint emulator for /api/bus route
// Since this is a Vite app, we simulate the API endpoint functionality
// In production, this would be served by Express, Vercel, or Netlify Functions

import { BusApiResponse, handleBusApiRequest } from './BusApiHandler';
import { handleProfileDashboardRequest } from './ProfileApiHandler';

// NEW: API Routes registry
class ApiRouter {
  private static instance: ApiRouter;
  private routes: Map<string, () => Promise<any>> = new Map();

  private constructor() {
    this.setupRoutes();
  }

  static getInstance(): ApiRouter {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter();
    }
    return ApiRouter.instance;
  }

  // NEW: Set up all API routes
  private setupRoutes() {
    // Register the /api/bus endpoint
    this.routes.set('/api/bus', this.handleBusRequest.bind(this));
    this.routes.set('/api/bus.json', this.handleBusRequest.bind(this));

  // Profile dashboard simulation endpoints
  this.routes.set('/api/profile/dashboard', this.handleProfileDashboard.bind(this));
    
    // NEW: Additional endpoints that might be useful
    this.routes.set('/api/health', this.handleHealthCheck.bind(this));
    this.routes.set('/api/status', this.handleStatusCheck.bind(this));
  }

  // NEW: Main bus API handler
  private async handleBusRequest(): Promise<BusApiResponse> {
    console.log('[API Router] Handling /api/bus request');
    return await handleBusApiRequest();
  }

  private async handleProfileDashboard() {
    console.log('[API Router] Handling /api/profile/dashboard request');
    return await handleProfileDashboardRequest();
  }

  // NEW: Health check endpoint
  private async handleHealthCheck() {
    return {
      status: 'healthy',
      service: 'Chalo Proxy API',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  // NEW: Status check endpoint
  private async handleStatusCheck() {
    try {
      const busResponse = await handleBusApiRequest();
      return {
        service: 'Chalo Proxy',
        status: busResponse.success ? 'operational' : 'degraded',
        last_fetch: busResponse.timestamp,
        data_count: busResponse.data.length,
        error: busResponse.error || null
      };
    } catch (error) {
      return {
        service: 'Chalo Proxy',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // NEW: Get handler for a specific route
  getRouteHandler(path: string): (() => Promise<any>) | undefined {
    return this.routes.get(path);
  }

  // NEW: List all available routes
  getAvailableRoutes(): string[] {
    return Array.from(this.routes.keys());
  }

  // NEW: Execute API call (simulates HTTP request)
  async call(path: string): Promise<any> {
    const handler = this.getRouteHandler(path);
    if (!handler) {
      throw new Error(`Route not found: ${path}`);
    }

    try {
      const result = await handler();
      return {
        status: 200,
        data: result,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-API-Version': '1.0.0',
          'X-Powered-By': 'Chalo Proxy'
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Internal server error',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
}

// NEW: Export the API router instance
export const apiRouter = ApiRouter.getInstance();

// NEW: Convenience function to call the bus API
export async function callBusApi(): Promise<BusApiResponse> {
  const response = await apiRouter.call('/api/bus');
  if (response.status !== 200) {
    throw new Error(response.error || 'API call failed');
  }
  return response.data;
}

// NEW: Convenience function to check API health
export async function checkApiHealth() {
  const response = await apiRouter.call('/api/health');
  return response.status === 200 ? response.data : null;
}

// NEW: Convenience function to get API status
export async function getApiStatus() {
  const response = await apiRouter.call('/api/status');
  return response.status === 200 ? response.data : null;
}

// NEW: Development helper to test all endpoints
export async function testAllEndpoints() {
  const routes = apiRouter.getAvailableRoutes();
  const results: Record<string, any> = {};

  for (const route of routes) {
    try {
      const response = await apiRouter.call(route);
      results[route] = {
        status: response.status,
        success: response.status === 200,
        data: response.status === 200 ? response.data : response.error
      };
    } catch (error) {
      results[route] = {
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  return results;
}

// NEW: Log all available API routes (development helper)
console.log('[API Router] Available routes:', apiRouter.getAvailableRoutes());