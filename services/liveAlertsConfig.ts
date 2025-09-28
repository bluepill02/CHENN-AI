export const LIVE_ALERTS_API_BASE_URL = import.meta.env.VITE_LIVE_ALERTS_API_BASE_URL?.trim() ?? '';

export const LIVE_ALERTS_API_KEY = import.meta.env.VITE_LIVE_ALERTS_API_KEY?.trim() ?? '';

export const LIVE_ALERTS_FEATURE_FLAGS = {
  enableBackend: LIVE_ALERTS_API_BASE_URL.length > 0,
};

export const LIVE_ALERTS_CACHE_STORAGE_KEY = 'chennai-live-alerts-cache';
export const LIVE_ALERTS_PENDING_REPORTS_STORAGE_KEY = 'chennai-live-alerts-pending-reports';

export interface LiveAlertsApiErrorShape {
  message?: string;
  code?: string;
  status?: number;
}
