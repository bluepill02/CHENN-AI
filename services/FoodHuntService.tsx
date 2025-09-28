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
import type {
    Dish,
    FoodHuntSuggestion,
    FoodHuntSuggestionInput,
    Vendor,
} from '../types/foodhunt';
import { mockFoodVendorsChennai } from '../utils/mockFoodVendorsChennai';
import { FoodHuntApiClient } from './FoodHuntApiClient';
import {
    FOODHUNT_FEATURE_FLAGS,
    FOODHUNT_PENDING_SUBMISSIONS_STORAGE_KEY,
    FOODHUNT_SIMULATION_STORAGE_KEY,
} from './foodHuntConfig';

export interface FoodHuntSubmissionResult {
  status: 'queued' | 'synced';
}

interface FoodHuntContextValue {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isUsingBackend: boolean;
  pendingSubmissions: FoodHuntSuggestion[];
  refresh: () => Promise<void>;
  submitSuggestion: (input: FoodHuntSuggestionInput) => Promise<FoodHuntSubmissionResult>;
  getVendorById: (vendorId: string) => Vendor | undefined;
  getDishById: (dishId: string) => { vendor: Vendor; dish: Dish } | undefined;
}

const FoodHuntContext = createContext<FoodHuntContextValue | undefined>(undefined);

interface FoodHuntProviderProps {
  children: ReactNode;
}

export function FoodHuntProvider({ children }: FoodHuntProviderProps) {
  const apiClientRef = useRef(new FoodHuntApiClient());
  const backendConfigured = FOODHUNT_FEATURE_FLAGS.enableBackend && apiClientRef.current.isEnabled;

  const [baseVendors, setBaseVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(backendConfigured);
  const [pendingSubmissions, setPendingSubmissions] = useState<FoodHuntSuggestion[]>([]);

  const pendingSubmissionsRef = useRef<FoodHuntSuggestion[]>([]);
  useEffect(() => {
    pendingSubmissionsRef.current = pendingSubmissions;
  }, [pendingSubmissions]);

  const loadSimulationVendors = useCallback((): Vendor[] => {
    if (typeof window === 'undefined') {
      return cloneVendors(mockFoodVendorsChennai);
    }

    const stored = window.localStorage.getItem(FOODHUNT_SIMULATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Vendor[];
        return cloneVendors(parsed);
      } catch (storageError) {
        console.warn('Failed to parse food hunt simulation storage', storageError);
      }
    }

    return cloneVendors(mockFoodVendorsChennai);
  }, []);

  const persistSimulationVendors = useCallback((vendorsToPersist: Vendor[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        FOODHUNT_SIMULATION_STORAGE_KEY,
        JSON.stringify(vendorsToPersist)
      );
    } catch (storageError) {
      console.warn('Failed to persist food hunt vendors', storageError);
    }
  }, []);

  const loadPendingSubmissions = useCallback((): FoodHuntSuggestion[] => {
    if (typeof window === 'undefined') {
      return [];
    }

    const stored = window.localStorage.getItem(FOODHUNT_PENDING_SUBMISSIONS_STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as FoodHuntSuggestion[];
      return parsed.map(submission => ({
        ...submission,
        status: submission.status ?? 'pending',
      }));
    } catch (storageError) {
      console.warn('Failed to parse food hunt submissions storage', storageError);
      return [];
    }
  }, []);

  const persistPendingSubmissions = useCallback((submissions: FoodHuntSuggestion[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        FOODHUNT_PENDING_SUBMISSIONS_STORAGE_KEY,
        JSON.stringify(submissions)
      );
    } catch (storageError) {
      console.warn('Failed to persist food hunt submissions', storageError);
    }
  }, []);

  const activateSimulation = useCallback((message?: string) => {
    const seeded = loadSimulationVendors();
    setBaseVendors(seeded);
    setIsUsingBackend(false);
    setLoading(false);
    setLastSync(new Date());
    setError(message ?? null);
    return seeded;
  }, [loadSimulationVendors]);

  const syncPendingSubmissions = useCallback(async () => {
    if (!backendConfigured) return;
    if (!pendingSubmissionsRef.current.length) return;

    const remaining: FoodHuntSuggestion[] = [];
    let syncedCount = 0;

    for (const submission of pendingSubmissionsRef.current) {
      try {
        await apiClientRef.current.submitSuggestion(convertSuggestionToInput(submission));
        syncedCount += 1;
      } catch (syncError) {
        console.warn('Food Hunt submission sync failed', syncError);
        remaining.push(submission);
      }
    }

    if (syncedCount > 0) {
      setPendingSubmissions(remaining);
      persistPendingSubmissions(remaining);
      if (remaining.length === 0) {
        setError(null);
      }
    }
  }, [backendConfigured, persistPendingSubmissions]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (backendConfigured) {
      try {
        const fetched = await apiClientRef.current.fetchVendors();
        setBaseVendors(cloneVendors(fetched));
        setIsUsingBackend(true);
        setLastSync(new Date());
        setLoading(false);
        persistSimulationVendors(fetched);
        await syncPendingSubmissions();
        return;
      } catch (apiError) {
        console.warn('Food Hunt backend unavailable, switching to simulation', apiError);
        activateSimulation(
          'Food Hunt simulation mode active. Data will sync once backend is reachable.'
        );
        return;
      }
    }

    activateSimulation();
  }, [activateSimulation, backendConfigured, persistSimulationVendors, syncPendingSubmissions]);

  useEffect(() => {
    setPendingSubmissions(loadPendingSubmissions());
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPendingSubmission = useCallback((submission: FoodHuntSuggestion) => {
    setPendingSubmissions(prev => {
      const next = [...prev, submission];
      persistPendingSubmissions(next);
      return next;
    });
  }, [persistPendingSubmissions]);

  const submitSuggestion = useCallback(
    async (input: FoodHuntSuggestionInput): Promise<FoodHuntSubmissionResult> => {
      const localSubmission: FoodHuntSuggestion = {
        ...input,
        id: `foodhunt_pending_${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      if (backendConfigured && isUsingBackend) {
        try {
          await apiClientRef.current.submitSuggestion(input);
          setLastSync(new Date());
          return { status: 'synced' };
        } catch (apiError) {
          console.warn('Food Hunt suggestion submission failed, storing locally', apiError);
          setError('Unable to reach Chennai Food Hunt servers. Saved locally for sync.');
          setIsUsingBackend(false);
        }
      }

      addPendingSubmission(localSubmission);
      return { status: 'queued' };
    },
    [addPendingSubmission, backendConfigured, isUsingBackend]
  );

  const derivedVendors = useMemo(() => {
    const pendingVendors = pendingSubmissions.map(suggestionToVendor);
    const map = new Map<string, Vendor>();

    for (const vendor of baseVendors) {
      map.set(vendor.id, cloneVendor(vendor));
    }

    for (const vendor of pendingVendors) {
      if (!map.has(vendor.id)) {
        map.set(vendor.id, cloneVendor(vendor));
      } else {
        const existing = map.get(vendor.id)!;
        map.set(vendor.id, {
          ...existing,
          submissionStatus: vendor.submissionStatus,
          isCommunitySubmission: vendor.isCommunitySubmission ?? existing.isCommunitySubmission,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [baseVendors, pendingSubmissions]);

  const getVendorById = useCallback(
    (vendorId: string) => derivedVendors.find(vendor => vendor.id === vendorId),
    [derivedVendors]
  );

  const getDishById = useCallback(
    (dishId: string) => {
      for (const vendor of derivedVendors) {
        const dish = vendor.dishes.find(candidate => candidate.id === dishId);
        if (dish) {
          return {
            vendor,
            dish,
          };
        }
      }
      return undefined;
    },
    [derivedVendors]
  );

  const value: FoodHuntContextValue = {
    vendors: derivedVendors,
    loading,
    error,
    lastSync,
    isUsingBackend,
    pendingSubmissions,
    refresh,
    submitSuggestion,
    getVendorById,
    getDishById,
  };

  return <FoodHuntContext.Provider value={value}>{children}</FoodHuntContext.Provider>;
}

export function useFoodHunt() {
  const context = useContext(FoodHuntContext);
  if (context === undefined) {
    throw new Error('useFoodHunt must be used within a FoodHuntProvider');
  }
  return context;
}

function convertSuggestionToInput(submission: FoodHuntSuggestion): FoodHuntSuggestionInput {
  return {
    vendorNameEn: submission.vendorNameEn,
    vendorNameTa: submission.vendorNameTa,
    areaEn: submission.areaEn,
    areaTa: submission.areaTa,
    cuisines: submission.cuisines,
    vegType: submission.vegType,
    priceLevel: submission.priceLevel,
    contactNumber: submission.contactNumber,
    instagramHandle: submission.instagramHandle,
    whatsappNumber: submission.whatsappNumber,
    signatureDish: submission.signatureDish,
    notes: submission.notes,
    submittedBy: submission.submittedBy,
    submittedByContact: submission.submittedByContact,
  };
}

function suggestionToVendor(submission: FoodHuntSuggestion): Vendor {
  const vendorId = submission.id;
  const now = new Date().toISOString();

  return {
    id: vendorId,
    nameEn: submission.vendorNameEn,
    nameTa: submission.vendorNameTa ?? submission.vendorNameEn,
    areaEn: submission.areaEn,
    areaTa: submission.areaTa ?? submission.areaEn,
    cuisines: submission.cuisines,
    vegType: submission.vegType,
    priceLevel: submission.priceLevel,
    rating: 0,
    openNow: false,
    distanceKm: 0,
    features: [],
    tags: ['community-submission'],
    lastUpdated: now,
    contactNumber: submission.contactNumber,
    instagramHandle: submission.instagramHandle,
    whatsappNumber: submission.whatsappNumber,
    isCommunitySubmission: true,
    submittedBy: submission.submittedBy,
    submissionStatus: submission.status,
    dishes: submission.signatureDish
      ? [
          {
            id: `${vendorId}_dish`,
            nameEn: submission.signatureDish.nameEn,
            nameTa: submission.signatureDish.nameTa ?? submission.signatureDish.nameEn,
            price: submission.signatureDish.price ?? 0,
            rating: submission.signatureDish.rating ?? 0,
            spicyLevel: submission.signatureDish.spicyLevel ?? 0,
            isSignature: submission.signatureDish.isSignature ?? true,
            tags: submission.signatureDish.tags ?? ['community'],
            description: submission.signatureDish.description,
            category: submission.signatureDish.category,
            availability: submission.signatureDish.availability,
          },
        ]
      : [],
  };
}

function cloneVendors(source: Vendor[]): Vendor[] {
  return source.map(cloneVendor);
}

function cloneVendor(vendor: Vendor): Vendor {
  return {
    ...vendor,
    cuisines: [...vendor.cuisines],
    features: vendor.features ? [...vendor.features] : undefined,
    tags: vendor.tags ? [...vendor.tags] : undefined,
    dishes: vendor.dishes.map(cloneDish),
  };
}

function cloneDish(dish: Dish): Dish {
  return {
    ...dish,
    tags: dish.tags ? [...dish.tags] : undefined,
    allergens: dish.allergens ? [...dish.allergens] : undefined,
  };
}
