import servicesMarketplace from 'figma:asset/4108c802b3e078fed252c2b3f591ce76fb2675b2.png';
import {
  Building2,
  Clock,
  Filter,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import insightsGraphic from '../Figma Exports/05 Bar Chart.png';
import heroTexture from '../Figma Exports/Frame 6.png';
import { useLocation } from '../services/LocationService';
import { contactServiceApi, listServices } from '../services/ServiceDirectoryApiClient';
import type { ServiceItem } from '../src/services/ServiceDirectoryService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import BookingModal from './services/BookingModal';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

interface LocalServicesProps {
  userLocation?: any;
}

type NotificationState = { message: string; type: 'success' | 'error' } | null;

type ServiceFilters = {
  query: string;
  category: string;
  minRating?: number;
  openNow: boolean;
  sort: 'recommended' | 'distance' | 'rating';
};

const DEFAULT_FILTERS: ServiceFilters = {
  query: '',
  category: 'all',
  minRating: undefined,
  openNow: false,
  sort: 'recommended',
};

const SERVICE_SIMULATION_MESSAGE =
  'Operating in Chennai services simulation mode. Data will sync once the backend connects.';

function parseDistance(distance?: string): number {
  if (!distance) return Number.POSITIVE_INFINITY;
  const normalized = distance.trim().toLowerCase();
  const match = normalized.match(/([\d.]+)/);
  if (!match) return Number.POSITIVE_INFINITY;
  const value = Number.parseFloat(match[1]);
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY;
  return normalized.includes('km') ? value * 1000 : value;
}

function mapApiService(raw: any): ServiceItem {
  const id = Number(raw?.id ?? raw?.serviceId ?? Date.now());
  const rating = Number(raw?.rating ?? raw?.score ?? 0);
  return {
    id,
    name: raw?.name ?? raw?.title ?? 'Chennai Service',
    category: raw?.category ?? raw?.type ?? 'General',
    location: raw?.location ?? raw?.area ?? 'Near you',
    rating: Number.isFinite(rating) ? rating : 0,
    distance: raw?.distance ?? raw?.distanceText ?? '1 km',
    price: raw?.price ?? raw?.pricing,
    isOpen: Boolean(raw?.isOpen ?? raw?.openNow ?? true),
    image: raw?.image ?? raw?.imageUrl,
    speciality: raw?.speciality ?? raw?.description,
    trusted: Boolean(raw?.trusted ?? raw?.isTrusted ?? false),
    language: raw?.language ?? raw?.languages ?? 'Tamil + English',
    communityScore: raw?.communityScore ?? raw?.community_rating,
  };
}

export function LocalServices({ userLocation }: LocalServicesProps) {
  const { currentLocation, setLocationModalOpen } = useLocation();
  const activeLocation = currentLocation || userLocation;

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_FILTERS);
  const [notification, setNotification] = useState<NotificationState>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);
  const [bookingStats, setBookingStats] = useState<{ total: number }>({ total: 0 });

  const clearNotificationTimer = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
  }, []);

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      if (typeof window === 'undefined') return;
      clearNotificationTimer();
      notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification(null);
        notificationTimeoutRef.current = null;
      }, 3200);
    },
    [clearNotificationTimer]
  );

  useEffect(() => () => clearNotificationTimer(), [clearNotificationTimer]);

  const loadBookingStats = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('chennai_service_bookings_v1');
      if (!raw) {
        setBookingStats({ total: 0 });
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setBookingStats({ total: parsed.length });
      } else {
        setBookingStats({ total: 0 });
      }
    } catch (statsError) {
      console.warn('Failed to read booking stats', statsError);
      setBookingStats({ total: 0 });
    }
  }, []);

  const loadServicesFromSimulation = useCallback(async () => {
    const mod = await import('../src/services/ServiceDirectoryService');
    const getAll = (mod as any).getAllServices ?? (mod.default as any)?.getAllServices;
    if (typeof getAll === 'function') {
      return (await getAll()) as ServiceItem[];
    }
    const getFeatured = (mod as any).getFeaturedServices ?? (mod.default as any)?.getFeaturedServices;
    if (typeof getFeatured === 'function') {
      return (await getFeatured()) as ServiceItem[];
    }
    return [];
  }, []);

  const persistServicesOffline = useCallback(async (items: ServiceItem[]) => {
    try {
      const mod = await import('../src/services/ServiceDirectoryService');
      const replace = (mod as any).replaceServices ?? (mod.default as any)?.replaceServices;
      if (typeof replace === 'function') {
        await replace(items);
      }
    } catch (persistError) {
      console.warn('Failed to persist services offline', persistError);
    }
  }, []);

  const refreshServices = useCallback(
    async (options?: { silent?: boolean }) => {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const result = await listServices();
        const normalized = result.data.map(mapApiService);
        setServices(normalized);
        const usingBackend = result.source === 'live';
        setIsUsingBackend(usingBackend);
        if (usingBackend) {
          setError(null);
        } else {
          setError(SERVICE_SIMULATION_MESSAGE);
        }
        if (result.errors && result.errors.length > 0) {
          console.warn('Service directory errors:', result.errors);
        }
        const now = new Date();
        setLastSync(now);
        if (usingBackend) {
          void persistServicesOffline(normalized);
        }
      } catch (apiError) {
        console.warn('Service dashboard: listServices failed, falling back to simulation', apiError);
        setIsUsingBackend(false);
        setError(SERVICE_SIMULATION_MESSAGE);
        const simulated = await loadServicesFromSimulation();
        setServices(simulated.map(mapApiService));
        setLastSync(new Date());
      } finally {
        if (options?.silent) {
          setIsRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [loadServicesFromSimulation, persistServicesOffline]
  );

  useEffect(() => {
    void refreshServices();
    loadBookingStats();
  }, [loadBookingStats, refreshServices]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    services.forEach(service => {
      if (service.category) unique.add(service.category);
    });
    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services.length) return [];
    const queryNeedle = filters.query.trim().toLowerCase();
    return services
      .filter(service => {
        if (filters.category !== 'all' && service.category !== filters.category) {
          return false;
        }
        if (filters.openNow && !service.isOpen) {
          return false;
        }
        if (typeof filters.minRating === 'number' && service.rating < filters.minRating) {
          return false;
        }
        if (queryNeedle) {
          const haystacks = [
            service.name,
            service.category,
            service.location,
            service.speciality,
            service.language,
          ]
            .filter((value): value is string => Boolean(value))
            .map(value => value.toLowerCase());
          if (!haystacks.some(text => text.includes(queryNeedle))) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'distance') {
          return parseDistance(a.distance) - parseDistance(b.distance);
        }
        if (filters.sort === 'rating') {
          return b.rating - a.rating;
        }
        // Recommended: trusted first, then rating, then proximity
        if (a.trusted !== b.trusted) {
          return a.trusted ? -1 : 1;
        }
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return parseDistance(a.distance) - parseDistance(b.distance);
      });
  }, [filters, services]);

  const analytics = useMemo(() => {
    const total = services.length;
    const openNow = services.filter(service => service.isOpen).length;
    const trusted = services.filter(service => service.trusted).length;
    const averageRating =
      total > 0
        ? services.reduce((sum, service) => sum + service.rating, 0) / total
        : 0;
    const categoryCounts = services.reduce<Record<string, number>>((acc, service) => {
      if (!service.category) return acc;
      acc[service.category] = (acc[service.category] ?? 0) + 1;
      return acc;
    }, {});
    const topCategoryEntry = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0];
    return {
      total,
      openNow,
      trusted,
      averageRating,
      topCategory: topCategoryEntry?.[0] ?? null,
    };
  }, [services]);

  const hasFiltersApplied = useMemo(() => {
    return (
      Boolean(filters.query.trim()) ||
      (filters.category !== 'all') ||
      filters.openNow ||
      typeof filters.minRating === 'number' ||
      filters.sort !== 'recommended'
    );
  }, [filters]);

  const statusAccent = error
    ? 'bg-red-50 border-red-200'
    : isUsingBackend
    ? 'bg-emerald-50 border-emerald-200'
    : 'bg-amber-50 border-amber-200';
  const statusText = error
    ? 'text-red-800'
    : isUsingBackend
    ? 'text-emerald-800'
    : 'text-amber-800';
  const lastSyncLabel = lastSync ? lastSync.toLocaleString('en-IN') : 'Not synced yet';

  const openBooking = (service: ServiceItem) => {
    setBookingService(service);
    setBookingOpen(true);
  };

  const handleBookingConfirmed = useCallback(
    (booking: any) => {
      loadBookingStats();
      const message = typeof booking?.message === 'string' && booking.message.trim().length > 0
        ? booking.message
        : 'Booking confirmed';
      showNotification(message, 'success');
    },
    [loadBookingStats, showNotification]
  );

  const handleContactService = useCallback(
    async (service: ServiceItem) => {
      try {
        const result = await contactServiceApi(service.id);
        showNotification(result.message, result.ok ? 'success' : 'error');
      } catch (apiError) {
        console.error('Failed to contact service', apiError);
        showNotification('Failed to contact service', 'error');
      }
    },
    [showNotification]
  );

  const handleRefreshClick = () => {
    void refreshServices({ silent: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="fixed inset-0 opacity-15 md:opacity-10 pointer-events-none">
        <ImageWithFallback
          src={servicesMarketplace}
          alt="Chennai Services Marketplace"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10">
        {notification && (
          <div
            role="status"
            className={`fixed top-6 right-6 z-50 rounded-md px-4 py-2 shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {notification.message}
          </div>
        )}

        <header className="rounded-b-[2.75rem] bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-6 py-10 text-white shadow-lg">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-amber-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                  <Sparkles className="h-4 w-4 text-amber-100" />
                  {analytics.total} services curated for Chennai
                </span>
                {analytics.topCategory && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                    <Building2 className="h-4 w-4 text-amber-100" />
                    Top demand: {analytics.topCategory}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight">
                நம்ம சென்னை சேவை பலகை
                <span className="block text-2xl font-light text-amber-100">
                  Chennai’s trusted service directory
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-amber-100">
                Handpicked electricians, tutors, home chefs, wellness experts மற்றும் இன்னும் பல —
                அனைத்தும் verified neighbors ready to help.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-amber-100">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> 100% community verified partners
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4" /> {bookingStats.total} recent neighborhood bookings
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                  <MapPin className="h-4 w-4" />
                  {activeLocation
                    ? `${activeLocation.area}, ${activeLocation.pincode}`
                    : 'Set your location for hyper-local results'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocationModalOpen(true)}
                  className="text-white hover:bg-white/15"
                >
                  <Navigation className="mr-1 h-3 w-3" /> Change area
                </Button>
              </div>
            </div>

            <div className="relative hidden justify-self-end lg:flex">
              <div className="absolute inset-0 -translate-y-4 translate-x-4 rounded-[2rem] bg-white/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/40 shadow-xl">
                <ImageWithFallback
                  src={heroTexture}
                  alt="Services hero"
                  className="h-60 w-72 object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-xl">
            <div className="rounded-2xl border border-white/30 bg-white/15 p-4 backdrop-blur-sm">
              <Label htmlFor="service-search" className="text-xs uppercase tracking-wide text-amber-100">
                Instant search
              </Label>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3">
                <span className="text-xl">🔍</span>
                <Input
                  id="service-search"
                  value={filters.query}
                  onChange={event => setFilters(prev => ({ ...prev, query: event.target.value }))}
                  placeholder="என்ன தேவை? Try electrician, idli, tuition…"
                  className="border-none bg-transparent text-base text-gray-700 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <Card className={`mb-8 border ${statusAccent} ${statusText}`}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white/80 p-2">
                  <RefreshCw
                    className={`h-5 w-5 ${loading || isRefreshing ? 'animate-spin text-orange-600' : 'text-orange-600'}`}
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {isUsingBackend ? 'Connected to Chennai services backend' : 'Community simulation active'}
                  </p>
                  <p className="text-sm opacity-80">
                    {error ?? `Last sync: ${lastSyncLabel}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white/80 px-4 py-3 text-center shadow-sm">
                  <div>
                    <p className="text-xs uppercase text-gray-500">Total</p>
                    <p className="text-lg font-semibold text-gray-900">{analytics.total}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Open now</p>
                    <p className="text-lg font-semibold text-gray-900">{analytics.openNow}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Trusted</p>
                    <p className="text-lg font-semibold text-gray-900">{analytics.trusted}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500">Avg rating</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {analytics.total > 0 ? analytics.averageRating.toFixed(1) : '—'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefreshClick}
                  disabled={loading || isRefreshing}
                  className="border-orange-300 bg-white/90 text-orange-600 hover:bg-white"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh services
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mb-10 border border-amber-100 bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Refine your service picks</h2>
                  <p className="text-sm text-gray-500">
                    Pick categories, Tamil-speaking providers, open status, or rating thresholds.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasFiltersApplied}
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-orange-600 hover:bg-orange-100 disabled:text-gray-400"
              >
                Clear filters
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="service-category" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </Label>
                <Select
                  value={filters.category}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="service-category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Minimum rating
                </Label>
                <Select
                  value={filters.minRating ? filters.minRating.toString() : 'any'}
                  onValueChange={(value: string) =>
                    setFilters(prev => ({
                      ...prev,
                      minRating: value === 'any' ? undefined : Number.parseFloat(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="4.5">4.5+</SelectItem>
                    <SelectItem value="4.0">4.0+</SelectItem>
                    <SelectItem value="3.5">3.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Sorting
                </Label>
                <Select
                  value={filters.sort}
                  onValueChange={(value: string) =>
                    setFilters(prev => ({ ...prev, sort: value as ServiceFilters['sort'] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Recommended" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="distance">Nearest first</SelectItem>
                    <SelectItem value="rating">Highest rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Availability
                </Label>
                <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-white px-4 py-3">
                  <Switch
                    checked={filters.openNow}
                    onCheckedChange={(checked: boolean) =>
                      setFilters(prev => ({ ...prev, openNow: Boolean(checked) }))
                    }
                    aria-label="Open now only"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Open now only</p>
                    <p className="text-xs text-gray-500">Filter to currently available partners</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <section className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border border-orange-200 bg-white/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Community bookings</p>
                  <p className="text-lg font-semibold text-gray-900">{bookingStats.total} this week</p>
                  <p className="text-xs text-gray-500">100% protected via neighbor trust program</p>
                </div>
              </div>
            </Card>

            <Card className="border border-sky-200 bg-white/90 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Quick assistance</p>
                  <p className="text-lg font-semibold text-gray-900">{analytics.openNow} experts live now</p>
                  <p className="text-xs text-gray-500">Instant callbacks for emergencies</p>
                </div>
              </div>
            </Card>

            <Card className="hidden border border-amber-200 bg-white/90 backdrop-blur xl:block">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
                  <ImageWithFallback
                    src={insightsGraphic}
                    alt="Service insights"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Insights</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : '—'} average ★ rating
                  </p>
                  <p className="text-xs text-gray-500">Powered by Chennai neighborhood feedback</p>
                </div>
              </div>
            </Card>
          </section>

          <section className="pb-24">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Service directory</h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredServices.length} of {services.length} providers
                </p>
              </div>
            </div>

            {loading && services.length === 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="h-40 animate-pulse border border-orange-100 bg-white/70" />
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <Card className="border border-dashed border-orange-200 bg-white/80 p-8 text-center">
                <p className="text-lg font-semibold text-gray-800">
                  No services match your filters yet
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Try broadening the rating or category filters. We’re onboarding more Chennai providers every day.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredServices.map(service => (
                  <Card
                    key={service.id}
                    className="border border-orange-200 bg-white/90 p-4 shadow-sm transition hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="md:w-32">
                        <div className="overflow-hidden rounded-xl border border-orange-100 bg-white shadow-sm">
                          <ImageWithFallback
                            src={service.image}
                            alt={service.name}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {service.distance ?? '—'}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                {service.category}
                              </Badge>
                              {service.trusted && (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  <ShieldCheck className="mr-1 h-3 w-3" />
                                  Trusted
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{service.location}</p>
                          </div>

                          <div className="shrink-0 rounded-xl bg-orange-50 px-4 py-2 text-center">
                            <p className="text-xs uppercase text-orange-600">Rating</p>
                            <p className="text-lg font-semibold text-orange-700">
                              <Star className="mr-1 inline-block h-4 w-4 fill-current text-orange-500" />
                              {service.rating.toFixed(1)}
                            </p>
                            {service.communityScore && (
                              <p className="text-xs text-orange-600/80">Community {service.communityScore}</p>
                            )}
                          </div>
                        </div>

                        {service.speciality && (
                          <p className="mt-3 text-sm text-gray-700">{service.speciality}</p>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                            <Clock className="h-3 w-3" />
                            {service.isOpen ? 'Open now' : 'Opens soon'}
                          </span>
                          {service.price && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                              ₹ {service.price}
                            </span>
                          )}
                          {service.language && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                              {service.language}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleContactService(service)}
                            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
                          >
                            <Phone className="mr-2 h-4 w-4" /> Call & reserve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                            onClick={() => showNotification('Launching maps (simulated)', 'success')}
                          >
                            Navigate
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                            onClick={() => openBooking(service)}
                          >
                            Book slot
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </main>

        {bookingService && (
          <BookingModal
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            serviceId={bookingService?.id ?? null}
            serviceName={bookingService?.name}
            onBooked={handleBookingConfirmed}
          />
        )}
      </div>
    </div>
  );
}
