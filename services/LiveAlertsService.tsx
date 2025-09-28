import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    acknowledgeAlert as acknowledgeSimulationAlert,
    addSimulationAlert,
    drainQueuedReports,
    getAlerts as getSimulationAlerts,
    loadQueuedReports,
    queueAlertReport,
    replaceQueuedReports,
    replaceAlerts as replaceSimulationAlerts,
} from '../src/services/LiveAlertsSimulation';
import type { LiveAlert, LiveAlertReportInput } from '../types/community';
import { LiveAlertsApiClient } from './LiveAlertsApiClient';
import {
    LIVE_ALERTS_FEATURE_FLAGS,
} from './liveAlertsConfig';

export interface LiveAlertsFilters {
  pincode?: string;
  area?: string;
  includeInactive?: boolean;
}

interface LiveAlertsContextValue {
  alerts: LiveAlert[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isUsingBackend: boolean;
  pendingReports: LiveAlertReportInput[];
  refresh: (filters?: LiveAlertsFilters) => Promise<void>;
  acknowledge: (alertId: string) => Promise<void>;
  submitReport: (
    report: LiveAlertReportInput
  ) => Promise<{ status: 'synced' | 'queued'; alert: LiveAlert | null }>;
  getAlertById: (id: string) => LiveAlert | undefined;
  currentFilters: LiveAlertsFilters;
}

const LiveAlertsContext = createContext<LiveAlertsContextValue | undefined>(undefined);

interface LiveAlertsProviderProps {
  children: ReactNode;
  initialFilters?: LiveAlertsFilters;
}

export function LiveAlertsProvider({ children, initialFilters }: LiveAlertsProviderProps) {
  const apiClientRef = useRef(new LiveAlertsApiClient());
  const backendConfigured = LIVE_ALERTS_FEATURE_FLAGS.enableBackend && apiClientRef.current.isEnabled;

  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(backendConfigured);
  const [pendingReports, setPendingReports] = useState<LiveAlertReportInput[]>([]);

  const filtersRef = useRef<LiveAlertsFilters>(initialFilters ?? {});

  const persistAlerts = useCallback((next: LiveAlert[]) => {
    void replaceSimulationAlerts(next).catch(persistError => {
      console.warn('LiveAlertsService: failed to persist alerts cache', persistError);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const queued = await loadQueuedReports();
        if (!cancelled) {
          setPendingReports(queued);
        }
      } catch (loadError) {
        console.warn('LiveAlertsService: unable to load queued reports', loadError);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const flushQueuedReports = useCallback(async () => {
    if (!backendConfigured) {
      return;
    }

    const queued = await drainQueuedReports();
    if (!queued.length) {
      setPendingReports([]);
      return;
    }

    const remaining: LiveAlertReportInput[] = [];
    for (const report of queued) {
      try {
        await apiClientRef.current.submitReport(report);
      } catch (submitError) {
        console.warn('LiveAlertsService: failed to sync queued report, keeping locally', submitError);
        remaining.push(report);
      }
    }

    await replaceQueuedReports(remaining);
    setPendingReports(remaining);
  }, [backendConfigured]);

  const refresh = useCallback(
    async (filters?: LiveAlertsFilters) => {
      const activeFilters = filters ?? filtersRef.current;
      filtersRef.current = activeFilters;

      setLoading(true);
      setError(null);

      if (backendConfigured) {
        try {
          const fetched = await apiClientRef.current.fetchAlerts(activeFilters);
          setAlerts(fetched);
          setIsUsingBackend(true);
          setLastSync(new Date());
          setError(null);
          try {
            await replaceSimulationAlerts(fetched);
          } catch (persistError) {
            console.warn('LiveAlertsService: failed to cache backend alerts', persistError);
          }
          await flushQueuedReports();
          setLoading(false);
          return;
        } catch (apiError) {
          console.warn('LiveAlertsService: backend fetch failed, switching to simulation', apiError);
          setError('Live alerts running in community simulation mode until backend reconnects.');
          setIsUsingBackend(false);
        }
      }

      try {
        const simulated = await getSimulationAlerts(activeFilters);
        setAlerts(simulated);
        setLastSync(new Date());
      } catch (simError) {
        console.error('LiveAlertsService: failed to load simulation alerts', simError);
        setError('Unable to load live alerts');
      } finally {
        setLoading(false);
      }
    },
    [backendConfigured, flushQueuedReports]
  );

  useEffect(() => {
    void refresh(filtersRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acknowledge = useCallback(
    async (alertId: string) => {
      const applyUpdate = (updatedAlert: LiveAlert) => {
        setAlerts(prev => {
          const next = prev.map(alert => (alert.id === alertId ? updatedAlert : alert));
          persistAlerts(next);
          return next;
        });
      };

      if (backendConfigured && isUsingBackend) {
        try {
          const updated = await apiClientRef.current.acknowledgeAlert(alertId);
          applyUpdate(updated);
          return;
        } catch (apiError) {
          console.warn('LiveAlertsService: backend acknowledge failed, falling back', apiError);
          setIsUsingBackend(false);
        }
      }

      const updated = await acknowledgeSimulationAlert(alertId);
      if (updated) {
        applyUpdate(updated);
      }
    },
    [backendConfigured, isUsingBackend, persistAlerts]
  );

  const submitReport = useCallback(
    async (report: LiveAlertReportInput) => {
      const addAlertToState = (newAlert: LiveAlert) => {
        setAlerts(prev => {
          const next = [newAlert, ...prev];
          persistAlerts(next);
          return next;
        });
      };

      if (backendConfigured && isUsingBackend) {
        try {
          const created = await apiClientRef.current.submitReport(report);
          addAlertToState(created);
          return { status: 'synced' as const, alert: created };
        } catch (apiError) {
          console.warn('LiveAlertsService: submit failed, queueing locally', apiError);
          setIsUsingBackend(false);
          setError('Backend unavailable. Your alert report is queued and will sync later.');
        }
      }

      await queueAlertReport(report);
      setPendingReports(prev => [...prev, report]);
      const simulated = await addSimulationAlert(report);
      addAlertToState(simulated);
      return { status: 'queued' as const, alert: simulated };
    },
    [backendConfigured, isUsingBackend, persistAlerts]
  );

  const value = useMemo<LiveAlertsContextValue>(
    () => ({
      alerts,
      loading,
      error,
      lastSync,
      isUsingBackend,
      pendingReports,
      refresh,
      acknowledge,
      submitReport,
      getAlertById: (id: string) => alerts.find(alert => alert.id === id),
      currentFilters: filtersRef.current,
    }),
    [alerts, loading, error, lastSync, isUsingBackend, pendingReports, refresh, acknowledge, submitReport]
  );

  return <LiveAlertsContext.Provider value={value}>{children}</LiveAlertsContext.Provider>;
}

export function useLiveAlerts() {
  const context = useContext(LiveAlertsContext);
  if (!context) {
    throw new Error('useLiveAlerts must be used within a LiveAlertsProvider');
  }
  return context;
}
