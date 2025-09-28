import {
    LIVE_ALERTS_CACHE_STORAGE_KEY,
    LIVE_ALERTS_PENDING_REPORTS_STORAGE_KEY,
} from '../../services/liveAlertsConfig';
import type { LiveAlert, LiveAlertReportInput } from '../../types/community';
import { getAllSeedAlerts, getSeedAlerts, mergeAlerts } from '../data/liveAlerts';

type AlertFilterOptions = {
  pincode?: string;
  area?: string;
  includeInactive?: boolean;
};

const ALERT_STORAGE_KEY = LIVE_ALERTS_CACHE_STORAGE_KEY || 'chennai_live_alerts_store_v1';
const PENDING_REPORTS_STORAGE_KEY = LIVE_ALERTS_PENDING_REPORTS_STORAGE_KEY || 'chennai_live_alerts_pending_reports_v1';

let inMemoryAlerts: LiveAlert[] | null = null;
let inMemoryPendingReports: LiveAlertReportInput[] | null = null;

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function serializeAlert(alert: LiveAlert) {
  return {
    ...alert,
    timestamp: alert.timestamp.toISOString(),
  } satisfies Record<string, unknown>;
}

function deserializeAlert(payload: Record<string, unknown>): LiveAlert {
  return {
    id: String(payload.id),
    title: String(payload.title),
    titleEn: String(payload.titleEn),
    message: String(payload.message),
    messageEn: String(payload.messageEn),
    severity: payload.severity as LiveAlert['severity'],
    timestamp: new Date(String(payload.timestamp)),
    source: String(payload.source),
    affectedAreas: Array.isArray(payload.affectedAreas)
      ? (payload.affectedAreas as string[])
      : undefined,
    pincodes: Array.isArray(payload.pincodes)
      ? (payload.pincodes as string[])
      : undefined,
    isActive: Boolean(payload.isActive),
  };
}

async function readAlertsStore(): Promise<LiveAlert[]> {
  if (!hasLocalStorage()) {
    if (!inMemoryAlerts) {
      inMemoryAlerts = getAllSeedAlerts();
    }
    return inMemoryAlerts;
  }

  try {
    const raw = window.localStorage.getItem(ALERT_STORAGE_KEY);
    if (!raw) {
      const seeded = getAllSeedAlerts();
      window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(seeded.map(serializeAlert)));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(deserializeAlert);
  } catch (error) {
    console.warn('LiveAlertsSimulation: failed to read alerts store, reseeding defaults', error);
    const seeded = getAllSeedAlerts();
    if (hasLocalStorage()) {
      window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(seeded.map(serializeAlert)));
    }
    inMemoryAlerts = seeded;
    return seeded;
  }
}

async function writeAlertsStore(alerts: LiveAlert[]): Promise<void> {
  if (hasLocalStorage()) {
    window.localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts.map(serializeAlert)));
  } else {
    inMemoryAlerts = alerts;
  }
}

async function readPendingReports(): Promise<LiveAlertReportInput[]> {
  if (!hasLocalStorage()) {
    return inMemoryPendingReports ?? [];
  }

  try {
    const raw = window.localStorage.getItem(PENDING_REPORTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as LiveAlertReportInput[];
  } catch (error) {
    console.warn('LiveAlertsSimulation: failed to parse pending reports, resetting', error);
    if (hasLocalStorage()) {
      window.localStorage.removeItem(PENDING_REPORTS_STORAGE_KEY);
    }
    inMemoryPendingReports = [];
    return [];
  }
}

async function writePendingReports(reports: LiveAlertReportInput[]): Promise<void> {
  if (hasLocalStorage()) {
    window.localStorage.setItem(PENDING_REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } else {
    inMemoryPendingReports = reports;
  }
}

function matchesFilter(alert: LiveAlert, options: AlertFilterOptions): boolean {
  const { pincode, area, includeInactive } = options;

  if (!includeInactive && !alert.isActive) {
    return false;
  }

  const matchesPincode = pincode
    ? (alert.pincodes ?? []).some(code => code === pincode)
    : true;

  const matchesArea = area
    ? (alert.affectedAreas ?? []).some(current =>
        current.toLowerCase().includes(area.toLowerCase())
      )
    : true;

  return matchesPincode && matchesArea;
}

export async function getAlerts(options: AlertFilterOptions = {}): Promise<LiveAlert[]> {
  const alerts = await readAlertsStore();

  // Ensure we have some baseline alerts if store is empty
  if (!alerts.length) {
    const seeded = getAllSeedAlerts();
    await writeAlertsStore(seeded);
    return filterAndSort(seeded, options);
  }

  // Augment with fresh seeds to simulate rolling updates
  const seedMatches = getSeedAlerts({ pincode: options.pincode, area: options.area });
  const combined = mergeAlerts(alerts, seedMatches);
  await writeAlertsStore(combined);
  return filterAndSort(combined, options);
}

function filterAndSort(alerts: LiveAlert[], options: AlertFilterOptions): LiveAlert[] {
  return alerts
    .filter(alert => matchesFilter(alert, options))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export async function acknowledgeAlert(alertId: string): Promise<LiveAlert | null> {
  const alerts = await readAlertsStore();
  const idx = alerts.findIndex(alert => alert.id === alertId);
  if (idx === -1) {
    return null;
  }

  const updatedAlert: LiveAlert = { ...alerts[idx], isActive: false };
  const next = [...alerts];
  next[idx] = updatedAlert;
  await writeAlertsStore(next);
  return updatedAlert;
}

export async function addSimulationAlert(report: LiveAlertReportInput): Promise<LiveAlert> {
  const alerts = await readAlertsStore();
  const id = `local_alert_${Date.now()}`;
  const now = new Date();
  const newAlert: LiveAlert = {
    id,
    title: report.title,
    titleEn: report.titleEn ?? report.title,
    message: report.message,
    messageEn: report.messageEn ?? report.message,
    severity: report.severity,
    timestamp: now,
    source: report.source ?? 'Community Reporter',
    affectedAreas: report.area ? [report.area] : undefined,
    pincodes: report.pincode ? [report.pincode] : undefined,
    isActive: true,
  };

  const next = mergeAlerts(alerts, [newAlert]);
  await writeAlertsStore(next);
  return newAlert;
}

export async function queueAlertReport(report: LiveAlertReportInput): Promise<void> {
  const reports = await readPendingReports();
  reports.push(report);
  await writePendingReports(reports);
}

export async function drainQueuedReports(): Promise<LiveAlertReportInput[]> {
  const reports = await readPendingReports();
  await writePendingReports([]);
  return reports;
}

export async function loadQueuedReports(): Promise<LiveAlertReportInput[]> {
  return readPendingReports();
}

export async function replaceQueuedReports(reports: LiveAlertReportInput[]): Promise<void> {
  await writePendingReports(reports);
}

export async function replaceAlerts(alerts: LiveAlert[]): Promise<void> {
  await writeAlertsStore(alerts);
}
