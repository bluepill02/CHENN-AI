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
import { computeLocalityScore } from '../src/data/localities';
import {
  getLocalities as getLocalitiesOffline,
  rateLocality as rateLocalityOffline,
  replaceLocalities as replaceLocalitiesOffline,
} from '../src/services/LocalityService';
import type {
  Locality,
  LocalitySuggestion,
  LocalitySuggestionInput,
} from '../src/types/locality';
import { LocalityApiClient } from './LocalityApiClient';
import {
  LOCALITY_FEATURE_FLAGS,
  LOCALITY_PENDING_SUBMISSIONS_STORAGE_KEY,
} from './localityConfig';

export interface LocalityFilters {
  query?: string;
  area?: string;
  pincode?: string;
  minScore?: number;
}

interface LocalityAnalytics {
  total: number;
  averageScore: number;
  highestScore?: number;
  topLocalities: Locality[];
  sourcesBreakdown: Record<string, number>;
}

interface LocalityRatingsContextValue {
  localities: Locality[];
  filteredLocalities: Locality[];
  filters: LocalityFilters;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isUsingBackend: boolean;
  pendingSubmissions: LocalitySuggestion[];
  analytics: LocalityAnalytics;
  refresh: () => Promise<void>;
  getLocalityById: (id: string) => Locality | undefined;
  rateLocality: (id: string, rating: number) => Promise<Locality | null>;
  submitSuggestion: (
    input: LocalitySuggestionInput
  ) => Promise<{ status: 'synced' | 'queued'; suggestion: LocalitySuggestion }>;
  setFilters: (updates: Partial<LocalityFilters> | ((prev: LocalityFilters) => Partial<LocalityFilters>)) => void;
  clearFilters: () => void;
}

const LocalityRatingsContext = createContext<LocalityRatingsContextValue | undefined>(undefined);

interface LocalityRatingsProviderProps {
  children: ReactNode;
  initialFilters?: LocalityFilters;
}

export function LocalityRatingsProvider({ children, initialFilters }: LocalityRatingsProviderProps) {
  const apiClientRef = useRef(new LocalityApiClient());
  const backendConfigured = LOCALITY_FEATURE_FLAGS.enableBackend && apiClientRef.current.isEnabled;

  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(backendConfigured);
  const [pendingSubmissions, setPendingSubmissions] = useState<LocalitySuggestion[]>(() => {
    return loadPendingSubmissions();
  });
  const [filters, setFiltersState] = useState<LocalityFilters>(() => normalizeFilters(initialFilters ?? {}));

  const pendingRef = useRef<LocalitySuggestion[]>(pendingSubmissions);
  useEffect(() => {
    pendingRef.current = pendingSubmissions;
  }, [pendingSubmissions]);

  useEffect(() => {
    if (!initialFilters) return;
    setFiltersState(prev => {
      const shouldAdoptArea = initialFilters.area && !prev.area;
      const shouldAdoptPincode = initialFilters.pincode && !prev.pincode;

      if (!shouldAdoptArea && !shouldAdoptPincode) {
        return prev;
      }

      return normalizeFilters({
        ...prev,
        area: prev.area ?? initialFilters.area,
        pincode: prev.pincode ?? initialFilters.pincode,
      });
    });
  }, [initialFilters?.area, initialFilters?.pincode]);

  const persistPendingSubmissions = useCallback((suggestions: LocalitySuggestion[]) => {
    setPendingSubmissions(suggestions);
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        LOCALITY_PENDING_SUBMISSIONS_STORAGE_KEY,
        JSON.stringify(suggestions)
      );
    } catch (storageError) {
      console.warn('LocalityRatingsService: unable to persist pending submissions', storageError);
    }
  }, []);

  const refreshFromSimulation = useCallback(async () => {
    const data = await getLocalitiesOffline();
    setLocalities(sortLocalities(data));
    setIsUsingBackend(false);
    setLastSync(new Date());
    setLoading(false);
  }, []);

  const flushPendingSubmissions = useCallback(
    async (currentPending: LocalitySuggestion[]) => {
      if (!backendConfigured || currentPending.length === 0) return currentPending;

      const remaining: LocalitySuggestion[] = [];

      for (const suggestion of currentPending) {
        try {
          await apiClientRef.current.submitSuggestion(localSuggestionToInput(suggestion));
        } catch (flushError) {
          console.warn('LocalityRatingsService: failed to sync suggestion, keeping locally', flushError);
          remaining.push(suggestion);
        }
      }

      if (remaining.length !== currentPending.length) {
        persistPendingSubmissions(remaining);
      }

      return remaining;
    },
    [backendConfigured, persistPendingSubmissions]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (backendConfigured) {
      try {
        const fetched = await apiClientRef.current.fetchLocalities();
        const sorted = sortLocalities(fetched);
        setLocalities(sorted);
        setIsUsingBackend(true);
        setLastSync(new Date());
        await replaceLocalitiesOffline(sorted);
        await flushPendingSubmissions(pendingRef.current);
        setLoading(false);
        return;
      } catch (apiError) {
        console.warn('LocalityRatingsService: backend fetch failed, falling back to simulation', apiError);
        setError('Operating in Chennai Locality simulation mode. Data will sync once backend connects.');
      }
    }

    await refreshFromSimulation();
  }, [backendConfigured, flushPendingSubmissions, refreshFromSimulation]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalityById = useCallback(
    (id: string) => localities.find(locality => locality.id === id),
    [localities]
  );

  const rateLocality = useCallback(
    async (id: string, rating: number) => {
      if (backendConfigured && isUsingBackend) {
        try {
          const updated = await apiClientRef.current.rateLocality(id, rating);
          setLocalities(prev => {
            const next = sortLocalities(prev.map(loc => (loc.id === id ? updated : loc)));
            void replaceLocalitiesOffline(next);
            return next;
          });
          setError(null);
          return updated;
        } catch (apiError) {
          console.warn('LocalityRatingsService: backend rating failed, switching to simulation', apiError);
          setIsUsingBackend(false);
          setError('Unable to reach Chennai Locality backend. Updating local scores.');
        }
      }

      const updatedLocality = await rateLocalityOffline(id, rating);
      if (!updatedLocality) {
        return null;
      }
      setLocalities(prev => {
        const next = sortLocalities(prev.map(loc => (loc.id === id ? updatedLocality : loc)));
        return next;
      });
      return updatedLocality;
    },
    [backendConfigured, isUsingBackend]
  );

  const submitSuggestion = useCallback(
    async (input: LocalitySuggestionInput) => {
      const suggestion = buildLocalSuggestion(input);

      if (backendConfigured && isUsingBackend) {
        try {
          await apiClientRef.current.submitSuggestion(input);
          setError(null);
          return { status: 'synced' as const, suggestion };
        } catch (apiError) {
          console.warn('LocalityRatingsService: backend suggestion failed, queueing locally', apiError);
          setIsUsingBackend(false);
          setError('Offline queue active. We will sync this locality when the backend is available.');
        }
      }

      // Offline queue path
      const nextPending = [...pendingRef.current, suggestion];
      persistPendingSubmissions(nextPending);
      setLocalities(prev => {
        const next = sortLocalities([suggestionToLocality(suggestion), ...prev]);
        void replaceLocalitiesOffline(next);
        return next;
      });
      return { status: 'queued' as const, suggestion };
    },
    [backendConfigured, isUsingBackend, persistPendingSubmissions]
  );

  const filteredLocalities = useMemo(
    () => applyFilters(localities, filters),
    [localities, filters]
  );

  const analytics = useMemo(() => computeAnalytics(localities), [localities]);

  const updateFilters = useCallback(
    (updates: Partial<LocalityFilters> | ((prev: LocalityFilters) => Partial<LocalityFilters>)) => {
      setFiltersState(prev => {
        const patch = typeof updates === 'function' ? updates(prev) : updates;
        return normalizeFilters({ ...prev, ...patch });
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const value = useMemo<LocalityRatingsContextValue>(
    () => ({
      localities,
      filteredLocalities,
      filters,
      loading,
      error,
      lastSync,
      isUsingBackend,
      pendingSubmissions,
      analytics,
      refresh,
      getLocalityById,
      rateLocality,
      submitSuggestion,
      setFilters: updateFilters,
      clearFilters,
    }),
    [
      localities,
      filteredLocalities,
      filters,
      loading,
      error,
      lastSync,
      isUsingBackend,
      pendingSubmissions,
      analytics,
      refresh,
      getLocalityById,
      rateLocality,
      submitSuggestion,
      updateFilters,
      clearFilters,
    ]
  );

  return <LocalityRatingsContext.Provider value={value}>{children}</LocalityRatingsContext.Provider>;
}

export function useLocalityRatings() {
  const context = useContext(LocalityRatingsContext);
  if (!context) {
    throw new Error('useLocalityRatings must be used within a LocalityRatingsProvider');
  }
  return context;
}

function normalizeFilters(filters: LocalityFilters): LocalityFilters {
  const normalized: LocalityFilters = {};

  if (filters.query?.trim()) {
    normalized.query = filters.query.trim();
  }

  if (filters.area?.trim()) {
    normalized.area = filters.area.trim();
  }

  if (filters.pincode?.trim()) {
    normalized.pincode = filters.pincode.trim();
  }

  if (typeof filters.minScore === 'number' && !Number.isNaN(filters.minScore)) {
    const clamped = Math.max(0, Math.min(5, filters.minScore));
    normalized.minScore = Number(clamped.toFixed(1));
  }

  return normalized;
}

function applyFilters(localities: Locality[], filters: LocalityFilters): Locality[] {
  if (!localities.length) return [];
  if (!filters.query && !filters.area && !filters.pincode && typeof filters.minScore !== 'number') {
    return localities;
  }

  const queryNeedle = filters.query?.toLowerCase();
  const areaNeedle = filters.area?.toLowerCase();
  const pincodeNeedle = filters.pincode?.trim();
  const minScore = typeof filters.minScore === 'number' ? filters.minScore : undefined;

  return localities.filter(locality => {
    if (pincodeNeedle) {
      const localityPincode = locality.pincode?.trim();
      if (!localityPincode) return false;
      if (!localityPincode.startsWith(pincodeNeedle)) return false;
    }

    if (minScore !== undefined && locality.score < minScore) {
      return false;
    }

    const textSources = [
      locality.nameEn,
      locality.nameTa,
      locality.description,
      locality.descriptionTa,
      ...(locality.highlights ?? []),
      ...(locality.popularSpots ?? []),
      ...(locality.sources ?? []),
    ]
      .filter((value): value is string => Boolean(value))
      .map(value => value.toLowerCase());

    if (queryNeedle && !textSources.some(text => text.includes(queryNeedle))) {
      return false;
    }

    if (areaNeedle && !textSources.some(text => text.includes(areaNeedle))) {
      return false;
    }

    return true;
  });
}

function computeAnalytics(localities: Locality[]): LocalityAnalytics {
  if (localities.length === 0) {
    return {
      total: 0,
      averageScore: 0,
      topLocalities: [],
      sourcesBreakdown: {},
    };
  }

  const total = localities.length;
  const totalScore = localities.reduce((sum, locality) => sum + (Number.isFinite(locality.score) ? locality.score : 0), 0);
  const sourcesBreakdown = localities.reduce<Record<string, number>>((acc, locality) => {
    (locality.sources ?? []).forEach(source => {
      const key = source.trim();
      if (!key) return;
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});

  return {
    total,
    averageScore: Number((totalScore / total).toFixed(2)),
    highestScore: localities[0]?.score,
    topLocalities: localities.slice(0, 3),
    sourcesBreakdown,
  };
}

function loadPendingSubmissions(): LocalitySuggestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCALITY_PENDING_SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalitySuggestion[];
  } catch (error) {
    console.warn('LocalityRatingsService: failed to parse pending submissions, clearing', error);
    return [];
  }
}

function sortLocalities(list: Locality[]): Locality[] {
  return [...list].sort((a, b) => b.score - a.score);
}

function buildLocalSuggestion(input: LocalitySuggestionInput): LocalitySuggestion {
  return {
    id: `locality_suggestion_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    nameEn: input.nameEn,
    nameTa: input.nameTa,
    areaCode: input.areaCode,
    pincode: input.pincode,
    metrics: input.metrics,
    highlights: input.highlights,
    sources: input.sources,
    notes: input.notes,
    submittedBy: input.submittedBy,
    submittedByContact: input.submittedByContact,
  };
}

function suggestionToLocality(suggestion: LocalitySuggestion): Locality {
  const metrics = ensureMetrics(suggestion.metrics);
  const score = computeLocalityScore(metrics);

  return {
    id: suggestion.id,
    nameEn: suggestion.nameEn,
    nameTa: suggestion.nameTa ?? suggestion.nameEn,
    score,
    metrics,
    sources: suggestion.sources ?? ['community'],
    description: suggestion.notes,
    descriptionTa: suggestion.notes,
    highlights: suggestion.highlights,
    sampleTweets: [],
    pincode: suggestion.pincode,
    popularSpots: [],
    lastUpdated: suggestion.createdAt,
    isCommunitySubmission: true,
    submissionStatus: suggestion.status,
  };
}

function ensureMetrics(partial?: Partial<Locality['metrics']>): Locality['metrics'] {
  const base = {
    liveability: 3,
    connectivity: 3,
    foodCulture: 3,
    affordability: 3,
    buzz: 3,
  } as Locality['metrics'];

  if (!partial) return base;

  return {
    liveability: partial.liveability ?? base.liveability,
    connectivity: partial.connectivity ?? base.connectivity,
    foodCulture: partial.foodCulture ?? base.foodCulture,
    affordability: partial.affordability ?? base.affordability,
    buzz: partial.buzz ?? base.buzz,
  };
}

function localSuggestionToInput(suggestion: LocalitySuggestion): LocalitySuggestionInput {
  return {
    nameEn: suggestion.nameEn,
    nameTa: suggestion.nameTa,
    areaCode: suggestion.areaCode,
    pincode: suggestion.pincode,
    metrics: suggestion.metrics,
    highlights: suggestion.highlights,
    sources: suggestion.sources,
    notes: suggestion.notes,
    submittedBy: suggestion.submittedBy,
    submittedByContact: suggestion.submittedByContact,
  };
}
