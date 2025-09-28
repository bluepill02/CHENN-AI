import type {
    LiveAlert,
    LiveAlertApiPayload,
    LiveAlertReportInput,
} from '../types/community';
import {
    LIVE_ALERTS_API_BASE_URL,
    LIVE_ALERTS_API_KEY,
    type LiveAlertsApiErrorShape,
} from './liveAlertsConfig';

type FetchAlertsParams = {
  pincode?: string;
  area?: string;
  includeInactive?: boolean;
};

interface AcknowledgeResponse extends LiveAlertApiPayload {}
interface SubmitReportResponse extends LiveAlertApiPayload {}

export class LiveAlertsApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string = LIVE_ALERTS_API_BASE_URL, apiKey: string = LIVE_ALERTS_API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || undefined;
  }

  get isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  private buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return {
      ...headers,
      ...extra,
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.isEnabled) {
      throw new Error('LiveAlertsApiClient is disabled. Provide VITE_LIVE_ALERTS_API_BASE_URL.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
    });

    if (!response.ok) {
      let errorBody: LiveAlertsApiErrorShape | undefined;
      try {
        errorBody = await response.json();
      } catch (error) {
        // ignore parsing errors
      }

      const message = errorBody?.message ?? `Live Alerts API failed with status ${response.status}`;
      const error = new Error(message) as Error & LiveAlertsApiErrorShape;
      error.code = errorBody?.code;
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async fetchAlerts(params: FetchAlertsParams = {}): Promise<LiveAlert[]> {
    const search = new URLSearchParams();
    if (params.pincode) search.set('pincode', params.pincode);
    if (params.area) search.set('area', params.area);
    if (params.includeInactive) search.set('includeInactive', 'true');

    const query = search.toString();
    const path = query.length ? `/alerts?${query}` : '/alerts';
    const alerts = await this.request<LiveAlertApiPayload[]>(path);
    return alerts.map(deserializeLiveAlert);
  }

  async acknowledgeAlert(alertId: string): Promise<LiveAlert> {
    const payload = await this.request<AcknowledgeResponse>(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
    return deserializeLiveAlert(payload);
  }

  async submitReport(report: LiveAlertReportInput): Promise<LiveAlert> {
    const payload = await this.request<SubmitReportResponse>('/alerts/report', {
      method: 'POST',
      body: JSON.stringify(serializeReport(report)),
    });
    return deserializeLiveAlert(payload);
  }
}

function deserializeLiveAlert(payload: LiveAlertApiPayload): LiveAlert {
  return {
    id: payload.id,
    title: payload.title,
    titleEn: payload.title_en ?? payload.title,
    message: payload.message,
    messageEn: payload.message_en ?? payload.message,
    severity: payload.severity,
    timestamp: new Date(payload.timestamp),
    source: payload.source,
    affectedAreas: payload.affected_areas,
    pincodes: payload.affected_pincodes,
    isActive: payload.is_active,
  };
}

function serializeReport(report: LiveAlertReportInput) {
  return {
    title: report.title,
    title_en: report.titleEn,
    message: report.message,
    message_en: report.messageEn,
    severity: report.severity,
    area: report.area,
    pincode: report.pincode,
    source: report.source,
    reporter_name: report.reporterName,
    reporter_contact: report.reporterContact,
  } satisfies Record<string, unknown>;
}
