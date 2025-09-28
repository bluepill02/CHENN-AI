import {
    DEFAULT_SERVICES,
    bookService,
    contactService,
    getAllServices,
    type ServiceItem
} from '../src/services/ServiceDirectoryService';

interface ServiceQuery {
  category?: string;
  query?: string;
  open?: boolean;
  minRating?: number;
}

interface ServiceFetchResult {
  data: ServiceItem[];
  source: 'live' | 'fallback';
  errors?: string[];
}

interface ContactResult {
  ok: boolean;
  message: string;
  source: 'live' | 'fallback';
  errors?: string[];
}

interface BookingPayload {
  name: string;
  phone: string;
  time?: string;
}

interface BookingResult {
  ok: boolean;
  message: string;
  booking?: unknown;
  source: 'live' | 'fallback';
  errors?: string[];
}

function buildQueryString(query: ServiceQuery | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  if (query.category) params.set('category', query.category);
  if (query.query) params.set('query', query.query);
  if (typeof query.open === 'boolean') params.set('open', String(query.open));
  if (typeof query.minRating === 'number') params.set('minRating', String(query.minRating));
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listServices(query?: ServiceQuery): Promise<ServiceFetchResult> {
  try {
    const services = await fetchJson<ServiceItem[]>(`/api/services/all${buildQueryString(query)}`);
    return { data: services, source: 'live' };
  } catch (error) {
    console.warn('[service-directory-client] listServices fallback', error);
    try {
      const services = await getAllServices();
      return {
        data: services,
        source: 'fallback',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } catch (fallbackError) {
      console.error('[service-directory-client] fallback read failed', fallbackError);
      return {
        data: DEFAULT_SERVICES,
        source: 'fallback',
        errors: [
          error instanceof Error ? error.message : 'Unknown error',
          fallbackError instanceof Error ? fallbackError.message : 'fallback failed'
        ]
      };
    }
  }
}

export async function fetchService(id: number): Promise<ServiceItem | null> {
  try {
    const service = await fetchJson<ServiceItem>(`/api/services/${id}`);
    return service;
  } catch (error) {
    console.warn('[service-directory-client] fetchService fallback', error);
    try {
      const services = await getAllServices();
      return services.find(item => item.id === id) ?? null;
    } catch (fallbackError) {
      console.error('[service-directory-client] fetchService fallback failed', fallbackError);
      return DEFAULT_SERVICES.find(item => item.id === id) ?? null;
    }
  }
}

export async function contactServiceApi(id: number): Promise<ContactResult> {
  try {
    const response = await fetchJson<{ ok: boolean; message: string }>(`/api/services/${id}/contact`, {
      method: 'POST'
    });
    return { ...response, source: 'live' };
  } catch (error) {
    console.warn('[service-directory-client] contact fallback', error);
    try {
      const result = await contactService(id);
      return {
        ...result,
        source: 'fallback',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } catch (fallbackError) {
      console.error('[service-directory-client] contact fallback failed', fallbackError);
      return {
        ok: false,
        message: 'Unable to contact service.',
        source: 'fallback',
        errors: [
          error instanceof Error ? error.message : 'Unknown error',
          fallbackError instanceof Error ? fallbackError.message : 'fallback failed'
        ]
      };
    }
  }
}

export async function bookServiceApi(id: number, payload: BookingPayload): Promise<BookingResult> {
  try {
    const response = await fetchJson<{ ok: boolean; message: string; booking?: unknown }>(
      `/api/services/${id}/book`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    return { ...response, source: 'live' };
  } catch (error) {
    console.warn('[service-directory-client] book fallback', error);
    try {
      const booking = await bookService(id, payload);
      return {
        ok: true,
        message: 'Booking confirmed (offline mode).',
        booking,
        source: 'fallback',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } catch (fallbackError) {
      console.error('[service-directory-client] book fallback failed', fallbackError);
      return {
        ok: false,
        message: 'Unable to create booking.',
        source: 'fallback',
        errors: [
          error instanceof Error ? error.message : 'Unknown error',
          fallbackError instanceof Error ? fallbackError.message : 'fallback failed'
        ]
      };
    }
  }
}
