/**
 * MSW helpers for Live Alerts API scenarios.
 *
 * Provides reusable handler factories for success, empty, and error flows, plus
 * convenience utilities for tracking query parameters and generating payloads
 * that match the app's LiveAlertsApiClient contract.
 */

import { http, HttpResponse } from 'msw';
import type { LiveAlertApiPayload } from '../../types/community';

export interface LiveAlertHandlerOptions {
  /** Base URL used by the LiveAlertsApiClient. Defaults to a local test value. */
  baseUrl?: string;
  /** Pre-seeded alerts returned by the handler. */
  alerts?: LiveAlertApiPayload[];
  /** Callback invoked with each request URL for assertion of query params. */
  onRequest?: (url: URL) => void;
}

export interface LiveAlertErrorOptions extends LiveAlertHandlerOptions {
  status?: number;
  message?: string;
  code?: string;
}

const DEFAULT_BASE_URL = 'https://mock-live-alerts.test';

/**
 * Generates a deterministic alert payload matching the API contract.
 */
export const buildLiveAlertPayload = (
  overrides: Partial<LiveAlertApiPayload> = {}
): LiveAlertApiPayload => ({
  id: 'alert-1',
  title: 'Metro service delay',
  title_en: 'Metro service delay',
  message: 'Expect 15 minute delays on the green line.',
  message_en: 'Expect 15 minute delays on the green line.',
  severity: 'high',
  timestamp: new Date('2024-05-01T08:15:00Z').toISOString(),
  source: 'CMRL Control Room',
  affected_areas: ['Washermanpet'],
  affected_pincodes: ['600021'],
  is_active: true,
  ...overrides,
});

const createAlertsPath = (baseUrl: string) => `${baseUrl.replace(/\/$/, '')}/alerts`;

/**
 * Success handler returning alerts data.
 */
export const liveAlertsSuccessHandlers = ({
  baseUrl = DEFAULT_BASE_URL,
  alerts = [buildLiveAlertPayload()],
  onRequest,
}: LiveAlertHandlerOptions = {}) => [
  http.get(createAlertsPath(baseUrl), ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    onRequest?.(url);
    return HttpResponse.json(alerts);
  }),
];

/**
 * Empty-state handler.
 */
export const liveAlertsEmptyHandlers = (options?: LiveAlertHandlerOptions) =>
  liveAlertsSuccessHandlers({ ...options, alerts: [] });

/**
 * Error handler that returns a structured API error payload.
 */
export const liveAlertsErrorHandlers = ({
  baseUrl = DEFAULT_BASE_URL,
  status = 503,
  message = 'Live Alerts temporarily unavailable',
  code = 'SERVICE_UNAVAILABLE',
  onRequest,
}: LiveAlertErrorOptions = {}) => [
  http.get(createAlertsPath(baseUrl), ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    onRequest?.(url);
    return HttpResponse.json({ message, code }, { status });
  }),
];

/**
 * Handler for acknowledging an alert, returning the updated payload.
 */
export const liveAlertsAcknowledgeHandler = ({
  baseUrl = DEFAULT_BASE_URL,
  alert = buildLiveAlertPayload({ is_active: false }),
}: {
  baseUrl?: string;
  alert?: LiveAlertApiPayload;
} = {}) =>
  http.post(`${createAlertsPath(baseUrl)}/:id/acknowledge`, () =>
    HttpResponse.json(alert)
  );

/**
 * Handler for submitting a new community alert report.
 */
export const liveAlertsReportHandler = ({
  baseUrl = DEFAULT_BASE_URL,
  alert = buildLiveAlertPayload({ id: 'alert-report', is_active: true }),
}: {
  baseUrl?: string;
  alert?: LiveAlertApiPayload;
} = {}) =>
  http.post(`${createAlertsPath(baseUrl)}/report`, async ({ request }: { request: Request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...alert,
      title: body.title ?? alert.title,
      message: body.message ?? alert.message,
      severity: body.severity ?? alert.severity,
      timestamp: new Date().toISOString(),
    });
  });
