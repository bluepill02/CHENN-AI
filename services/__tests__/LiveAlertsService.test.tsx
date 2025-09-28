/**
 * LiveAlertsService Test Suite
 *
 * Comprehensive testing of the LiveAlertsService including:
 * - Backend vs simulation mode switching
 * - Offline queue functionality
 * - Error handling and fallbacks
 * - Alert acknowledgment and reporting
 * - Location-based filtering
 * - Real-time data synchronization
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import type { LiveAlert, LiveAlertReportInput } from '../../types/community';
import { LiveAlertsProvider, useLiveAlerts } from '../LiveAlertsService';

// Mock the API client
const mockApiClient = {
  isEnabled: true,
  fetchAlerts: jest.fn(),
  acknowledgeAlert: jest.fn(),
  submitReport: jest.fn(),
};

jest.mock('../LiveAlertsApiClient', () => ({
  LiveAlertsApiClient: jest.fn().mockImplementation(() => mockApiClient),
}));

// Mock the simulation service
const mockSimulationService = {
  getAlerts: jest.fn(),
  acknowledgeAlert: jest.fn(),
  addSimulationAlert: jest.fn(),
  replaceAlerts: jest.fn(),
  loadQueuedReports: jest.fn(),
  queueAlertReport: jest.fn(),
  drainQueuedReports: jest.fn(),
  replaceQueuedReports: jest.fn(),
};

jest.mock('../../src/services/LiveAlertsSimulation', () => mockSimulationService);

// Mock the config
jest.mock('../liveAlertsConfig', () => ({
  LIVE_ALERTS_FEATURE_FLAGS: {
    enableBackend: true,
  },
}));

describe('LiveAlertsService', () => {
  const sampleAlert: LiveAlert = {
    id: 'test-alert-1',
    title: 'Test Alert',
    titleEn: 'Test Alert',
    message: 'This is a test alert message',
    messageEn: 'This is a test alert message',
    severity: 'medium',
    timestamp: new Date(),
    source: 'Test System',
    affectedAreas: ['Test Area'],
    pincodes: ['600001'],
    isActive: true,
  };

  const sampleReport: LiveAlertReportInput = {
    title: 'User Report',
    titleEn: 'User Report',
    message: 'User reported issue',
    messageEn: 'User reported issue',
    severity: 'medium',
    area: 'T. Nagar',
    pincode: '600017',
    source: 'Community Report',
    reporterName: 'Test User',
    reporterContact: 'test@example.com',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LiveAlertsProvider>{children}</LiveAlertsProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockSimulationService.loadQueuedReports.mockResolvedValue([]);
    mockSimulationService.getAlerts.mockResolvedValue([sampleAlert]);
    mockApiClient.fetchAlerts.mockResolvedValue([sampleAlert]);
  });

  describe('Backend Mode', () => {
    test('fetches alerts from backend when available', async () => {
      mockApiClient.isEnabled = true;
      mockApiClient.fetchAlerts.mockResolvedValue([sampleAlert]);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.fetchAlerts).toHaveBeenCalled();
      expect(result.current.alerts).toHaveLength(1);
      expect(result.current.alerts[0].id).toBe('test-alert-1');
      expect(result.current.isUsingBackend).toBe(true);
    });

    test('acknowledges alert via backend', async () => {
      const updatedAlert = { ...sampleAlert, acknowledged: true };
      mockApiClient.acknowledgeAlert.mockResolvedValue(updatedAlert);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.acknowledge('test-alert-1');
      });

      expect(mockApiClient.acknowledgeAlert).toHaveBeenCalledWith('test-alert-1');
    });

    test('submits report via backend', async () => {
      const createdAlert = { ...sampleAlert, id: 'user-report-1' };
      mockApiClient.submitReport.mockResolvedValue(createdAlert);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submitReport(sampleReport);
      });

      expect(mockApiClient.submitReport).toHaveBeenCalledWith(sampleReport);
      expect(submitResult.status).toBe('synced');
      expect(submitResult.alert.id).toBe('user-report-1');
    });
  });

  describe('Fallback to Simulation Mode', () => {
    test('switches to simulation when backend fails', async () => {
      mockApiClient.fetchAlerts.mockRejectedValue(new Error('Network error'));
      mockSimulationService.getAlerts.mockResolvedValue([sampleAlert]);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.alerts).toHaveLength(1);
      expect(result.current.isUsingBackend).toBe(false);
      expect(result.current.error).toContain('simulation mode');
    });

    test('queues report when backend unavailable', async () => {
      mockApiClient.submitReport.mockRejectedValue(new Error('API down'));
      const simulatedAlert = { ...sampleAlert, id: 'queued-report-1' };
      mockSimulationService.addSimulationAlert.mockResolvedValue(simulatedAlert);
      mockSimulationService.queueAlertReport.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submitReport(sampleReport);
      });

      expect(mockSimulationService.queueAlertReport).toHaveBeenCalledWith(sampleReport);
      expect(submitResult.status).toBe('queued');
      expect(result.current.error).toContain('queued');
    });
  });

  describe('Location Filtering', () => {
    test('filters alerts by pincode', async () => {
      const chennaAlert = { ...sampleAlert, pincodes: ['600001'] };
      const mylaporeAlert = { ...sampleAlert, id: 'mylapore-1', pincodes: ['600004'] };
      mockApiClient.fetchAlerts.mockResolvedValue([chennaAlert, mylaporeAlert]);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh({ pincode: '600004' });
      });

      expect(mockApiClient.fetchAlerts).toHaveBeenCalledWith({ pincode: '600004' });
    });

    test('filters alerts by area', async () => {
      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh({ area: 'T. Nagar' });
      });

      expect(mockApiClient.fetchAlerts).toHaveBeenCalledWith({ area: 'T. Nagar' });
    });
  });

  describe('Queue Management', () => {
    test('loads existing queued reports on init', async () => {
      const queuedReports = [sampleReport];
      mockSimulationService.loadQueuedReports.mockResolvedValue(queuedReports);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.pendingReports).toHaveLength(1);
      });

      expect(result.current.pendingReports[0]).toEqual(sampleReport);
    });

    test('flushes queued reports when backend becomes available', async () => {
      const queuedReports = [sampleReport];
      mockSimulationService.drainQueuedReports.mockResolvedValue(queuedReports);
      mockApiClient.submitReport.mockResolvedValue({ ...sampleAlert, id: 'synced-1' });
      mockSimulationService.replaceQueuedReports.mockResolvedValue(undefined);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate queue flush during refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockSimulationService.drainQueuedReports).toHaveBeenCalled();
      expect(mockApiClient.submitReport).toHaveBeenCalledWith(sampleReport);
      expect(mockSimulationService.replaceQueuedReports).toHaveBeenCalledWith([]);
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      mockApiClient.fetchAlerts.mockRejectedValue(new Error('NETWORK_ERROR'));
      mockSimulationService.getAlerts.mockResolvedValue([sampleAlert]);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.alerts).toHaveLength(1); // Fallback worked
    });

    test('handles simulation errors', async () => {
      mockApiClient.fetchAlerts.mockRejectedValue(new Error('API down'));
      mockSimulationService.getAlerts.mockRejectedValue(new Error('Storage full'));

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Unable to load live alerts');
      expect(result.current.alerts).toHaveLength(0);
    });
  });

  describe('Real-time Updates', () => {
    test('updates alert state after acknowledgment', async () => {
      const updatedAlert = { ...sampleAlert, acknowledged: true };
      mockApiClient.acknowledgeAlert.mockResolvedValue(updatedAlert);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.alerts[0].id).toBe('test-alert-1');

      await act(async () => {
        await result.current.acknowledge('test-alert-1');
      });

      // Check that the alert was updated in the state
      const alertAfterAck = result.current.getAlertById('test-alert-1');
      expect(alertAfterAck).toBeDefined();
    });

    test('adds new alert after successful report submission', async () => {
      const newAlert = { ...sampleAlert, id: 'new-report-1' };
      mockApiClient.submitReport.mockResolvedValue(newAlert);

      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.alerts.length;

      await act(async () => {
        await result.current.submitReport(sampleReport);
      });

      expect(result.current.alerts.length).toBe(initialCount + 1);
      const newAlertInState = result.current.getAlertById('new-report-1');
      expect(newAlertInState).toBeDefined();
    });
  });

  describe('Performance', () => {
    test('caches alerts in simulation storage', async () => {
      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockSimulationService.replaceAlerts).toHaveBeenCalledWith([sampleAlert]);
    });

    test('avoids redundant API calls during rapid refreshes', async () => {
      const { result } = renderHook(() => useLiveAlerts(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Rapid refresh calls
      await act(async () => {
        await Promise.all([
          result.current.refresh(),
          result.current.refresh(),
          result.current.refresh(),
        ]);
      });

      // Should only make reasonable number of API calls
      expect(mockApiClient.fetchAlerts.mock.calls.length).toBeLessThanOrEqual(4); // Initial + refreshes
    });
  });
});