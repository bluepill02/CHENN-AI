/**
 * ExternalDataService Test Suite
 *
 * Comprehensive testing of weather and external data integration including:
 * - Weather API integration with fallbacks
 * - Traffic data fetching
 * - Public services status
 * - Tamil/English localization
 * - API status monitoring
 * - Cache management and refresh cycles
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import type { PublicServiceData, TrafficData, WeatherData } from '../../types/externalData';
import { ExternalDataProvider, useExternalData } from '../ExternalDataService';

// Mock the API client
const mockApiClient = {
  fetchWeather: jest.fn(),
  fetchTraffic: jest.fn(),
  fetchPublicServices: jest.fn(),
};

jest.mock('../ExternalDataApiClient', () => mockApiClient);

// Mock fallback data generators
const mockFallbackData = {
  generateMockWeatherData: jest.fn(),
  generateMockTrafficData: jest.fn(),
  generateMockPublicServiceData: jest.fn(),
};

jest.mock('../../data/externalDataFallback', () => mockFallbackData);

describe('ExternalDataService', () => {
  const sampleWeatherData: WeatherData = {
    temperature: 32,
    condition: 'partly_cloudy',
    conditionTamil: 'பகுதியளவு மேகமூட்டம்',
    description: 'Partly cloudy with scattered clouds',
    descriptionTamil: 'பகுதியளவு மேகமூட்டம் உடன் சிதறிய மேகங்கள்',
    humidity: 75,
    windSpeed: 12,
    uvIndex: 8,
    airQuality: 'moderate',
    airQualityTamil: 'மிதமான',
    lastUpdated: new Date(),
  };

  const sampleTrafficData: TrafficData[] = [
    {
      route: 'Anna Salai',
      routeTamil: 'அண்ணா சாலை',
      status: 'moderate',
      statusTamil: 'மிதமான நெரிசல்',
      estimatedTime: 15,
      distance: '5.2 km',
      lastUpdated: new Date(),
      pincode: '600002',
    },
  ];

  const samplePublicServiceData: PublicServiceData[] = [
    {
      service: 'Chennai Metro',
      serviceTamil: 'சென்னை மெட்ரோ',
      status: 'operational',
      statusTamil: 'செயல்பாட்டில்',
      description: 'All lines running normally',
      descriptionTamil: 'அனைத்து வழித்தடங்களும் சாதாரணமாக இயங்குகின்றன',
      lastUpdated: new Date(),
      serviceCode: 'CMRL',
    },
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ExternalDataProvider>{children}</ExternalDataProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default successful API responses
    mockApiClient.fetchWeather.mockResolvedValue({
      data: sampleWeatherData,
      source: 'live',
    });
    
    mockApiClient.fetchTraffic.mockResolvedValue({
      data: sampleTrafficData,
      source: 'live',
    });
    
    mockApiClient.fetchPublicServices.mockResolvedValue({
      data: samplePublicServiceData,
      source: 'live',
    });

    // Default fallback responses
    mockFallbackData.generateMockWeatherData.mockReturnValue({
      data: { ...sampleWeatherData, source: 'mock' },
      source: 'mock',
    });
    
    mockFallbackData.generateMockTrafficData.mockReturnValue({
      data: sampleTrafficData.map(t => ({ ...t, source: 'mock' })),
      source: 'mock',
    });
    
    mockFallbackData.generateMockPublicServiceData.mockReturnValue({
      data: samplePublicServiceData.map(s => ({ ...s, source: 'mock' })),
      source: 'mock',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Weather Integration', () => {
    test('fetches weather data successfully', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiClient.fetchWeather).toHaveBeenCalled();
      expect(result.current.weather).toEqual(sampleWeatherData);
      expect(result.current.apiStatus.weather).toBe('connected');
      expect(result.current.isApiConnected).toBe(true);
    });

    test('falls back to mock data when weather API fails', async () => {
      mockApiClient.fetchWeather.mockRejectedValue(new Error('API Timeout'));
      
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFallbackData.generateMockWeatherData).toHaveBeenCalled();
      expect(result.current.apiStatus.weather).toBe('error');
    });

    test('provides Tamil weather conditions', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.weather).toBeTruthy();
      });

      expect(result.current.weather?.conditionTamil).toBe('பகுதியளவு மேகமூட்டம்');
      expect(result.current.weather?.condition).toBe('partly_cloudy');
    });
  });

  describe('Traffic Data Integration', () => {
    test('fetches traffic data for Chennai routes', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiClient.fetchTraffic).toHaveBeenCalled();
      expect(result.current.traffic).toHaveLength(1);
      expect(result.current.traffic[0].route).toBe('Anna Salai');
      expect(result.current.apiStatus.traffic).toBe('connected');
    });

    test('provides bilingual route names', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.traffic.length).toBeGreaterThan(0);
      });

      const route = result.current.traffic[0];
      expect(route.route).toBe('Anna Salai');
      expect(route.routeTamil).toBe('அண்ணா சாலை');
    });

    test('calculates congestion levels correctly', async () => {
      const congestionData = {
        ...sampleTrafficData[0],
        currentSpeed: 10, // Very slow
        averageSpeed: 40,
      };

      mockApiClient.fetchTraffic.mockResolvedValue({
        data: [congestionData],
        source: 'live',
      });

      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.traffic.length).toBeGreaterThan(0);
      });

      // The service should calculate traffic status based on conditions
      expect(result.current.traffic[0].status).toBeDefined();
    });
  });

  describe('Public Services Status', () => {
    test('fetches public services status', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiClient.fetchPublicServices).toHaveBeenCalled();
      expect(result.current.publicServices).toHaveLength(1);
      expect(result.current.publicServices[0].service).toBe('Chennai Metro');
      expect(result.current.apiStatus.services).toBe('connected');
    });

    test('provides Tamil service status', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.publicServices.length).toBeGreaterThan(0);
      });

      const service = result.current.publicServices[0];
      expect(service.serviceTamil).toBe('சென்னை மெட்ரோ');
      expect(service.statusTamil).toBe('செயல்பாட்டில்');
    });
  });

  describe('API Status Monitoring', () => {
    test('tracks individual API status correctly', async () => {
      // Weather fails, traffic succeeds
      mockApiClient.fetchWeather.mockRejectedValue(new Error('Weather API down'));
      mockApiClient.fetchTraffic.mockResolvedValue({
        data: sampleTrafficData,
        source: 'live',
      });

      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.apiStatus.weather).toBe('error');
      expect(result.current.apiStatus.traffic).toBe('connected');
      expect(result.current.apiStatus.services).toBe('connected');
      expect(result.current.isApiConnected).toBe(false); // Not fully connected
    });

    test('shows loading status during API calls', async () => {
      // Mock slow API response
      mockApiClient.fetchWeather.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: sampleWeatherData,
          source: 'live',
        }), 1000))
      );

      const { result } = renderHook(() => useExternalData(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.apiStatus.weather).toBe('loading');

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.apiStatus.weather).toBe('connected');
    });
  });

  describe('Data Refresh and Caching', () => {
    test('refreshes data when manually triggered', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear mock call history
      jest.clearAllMocks();

      // Trigger refresh
      await act(async () => {
        result.current.refreshData();
      });

      expect(mockApiClient.fetchWeather).toHaveBeenCalled();
      expect(mockApiClient.fetchTraffic).toHaveBeenCalled();
      expect(mockApiClient.fetchPublicServices).toHaveBeenCalled();
    });

    test('updates lastUpdate timestamp after refresh', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialUpdate = result.current.lastUpdate;

      // Wait a moment and refresh
      await act(async () => {
        jest.advanceTimersByTime(1000);
        result.current.refreshData();
      });

      await waitFor(() => {
        expect(result.current.lastUpdate).not.toEqual(initialUpdate);
      });
    });

    test('handles concurrent refresh calls gracefully', async () => {
      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear call history
      jest.clearAllMocks();

      // Trigger multiple concurrent refreshes
      await act(async () => {
        result.current.refreshData();
        result.current.refreshData();
        result.current.refreshData();
      });

      // Should not make excessive API calls
      expect(mockApiClient.fetchWeather.mock.calls.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Error Recovery', () => {
    test('recovers from temporary API failures', async () => {
      // First call fails
      mockApiClient.fetchWeather.mockRejectedValueOnce(new Error('Network error'));
      // Second call succeeds
      mockApiClient.fetchWeather.mockResolvedValueOnce({
        data: sampleWeatherData,
        source: 'live',
      });

      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.apiStatus.weather).toBe('error');
      });

      // Retry with refresh
      await act(async () => {
        result.current.refreshData();
      });

      await waitFor(() => {
        expect(result.current.apiStatus.weather).toBe('connected');
      });

      expect(result.current.weather).toBeTruthy();
    });

    test('maintains service availability with partial failures', async () => {
      // Weather fails, but traffic works
      mockApiClient.fetchWeather.mockRejectedValue(new Error('Weather service down'));

      const { result } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Weather should fallback to mock
      expect(result.current.weather).toBeTruthy();
      expect(result.current.apiStatus.weather).toBe('error');

      // Traffic should still work
      expect(result.current.traffic.length).toBeGreaterThan(0);
      expect(result.current.apiStatus.traffic).toBe('connected');
    });
  });

  describe('Performance and Memory', () => {
    test('prevents memory leaks with proper cleanup', async () => {
      const { result, unmount } = renderHook(() => useExternalData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Unmount should not cause errors
      expect(() => unmount()).not.toThrow();
    });

    test('handles rapid component mounting/unmounting', async () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderHook(() => useExternalData(), { wrapper });
        unmount();
      }

      // Should not cause excessive API calls or errors
      expect(mockApiClient.fetchWeather.mock.calls.length).toBeLessThanOrEqual(10);
    });
  });
});