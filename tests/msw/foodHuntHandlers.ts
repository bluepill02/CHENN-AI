/**
 * MSW helpers for the Chennai Food Hunt API contract.
 *
 * Provides reusable handler factories for success, empty, and error flows
 * against the `/food-hunt/vendors` endpoint plus utilities for submitting
 * community suggestions. Mirrors the FoodHuntApiClient payload structure to
 * keep tests aligned with the backend contract.
 */

import { http, HttpResponse } from 'msw';

export interface FoodHuntVendorPayload {
  id: string;
  name: string;
  name_ta?: string;
  area: string;
  area_ta?: string;
  cuisines: string[];
  veg_type: 'veg' | 'non-veg' | 'mixed';
  price_level: 1 | 2 | 3;
  rating: number;
  open_now: boolean;
  distance_km?: number;
  features?: string[];
  tags?: string[];
  last_updated?: string;
  contact_number?: string;
  instagram_handle?: string;
  whatsapp_number?: string;
  dishes?: FoodHuntDishPayload[];
}

export interface FoodHuntDishPayload {
  id: string;
  name: string;
  name_ta?: string;
  price: number;
  rating: number;
  spicy_level?: number;
  is_signature?: boolean;
  tags?: string[];
  image_url?: string;
  description?: string;
  category?: string;
  availability?: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  allergens?: string[];
}

export interface FoodHuntSuggestionPayload {
  id: string;
  vendor_name: string;
  vendor_name_ta?: string;
  area: string;
  area_ta?: string;
  cuisines: string[];
  veg_type: 'veg' | 'non-veg' | 'mixed';
  price_level: 1 | 2 | 3;
  contact_number?: string;
  instagram_handle?: string;
  whatsapp_number?: string;
  signature_dish?: {
    name: string;
    name_ta?: string;
    price?: number;
    rating?: number;
    spicy_level?: number;
    is_signature?: boolean;
    tags?: string[];
    description?: string;
    category?: string;
    availability?: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  };
  notes?: string;
  submitted_by?: string;
  submitted_by_contact?: string;
  status: 'pending' | 'synced';
  created_at: string;
}

export interface FoodHuntHandlerOptions {
  baseUrl?: string;
  vendors?: FoodHuntVendorPayload[];
  onRequest?: (url: URL) => void;
}

export interface FoodHuntErrorOptions extends FoodHuntHandlerOptions {
  status?: number;
  message?: string;
  code?: string;
}

const DEFAULT_BASE_URL = 'https://food-hunt.test';

const normalizeBase = (baseUrl: string) => baseUrl.replace(/\/$/, '');
const createVendorsPath = (baseUrl: string) => `${normalizeBase(baseUrl)}/food-hunt/vendors`;
const createSuggestionsPath = (baseUrl: string) => `${normalizeBase(baseUrl)}/food-hunt/suggestions`;

export const buildFoodHuntDishPayload = (
  overrides: Partial<FoodHuntDishPayload> = {}
): FoodHuntDishPayload => ({
  id: 'dish-supari-bajji',
  name: 'Supari Bajji',
  name_ta: 'சுபாரி பஜ்ஜி',
  price: 45,
  rating: 4.6,
  spicy_level: 2,
  is_signature: true,
  tags: ['street-food'],
  availability: 'all-day',
  ...overrides,
});

export const buildFoodHuntVendorPayload = (
  overrides: Partial<FoodHuntVendorPayload> = {}
): FoodHuntVendorPayload => ({
  id: 'vendor-marina-bajji',
  name: 'Marina Beach Bhajji',
  name_ta: 'மெரினா பஜ்ஜி கடை',
  area: 'Marina Beach',
  area_ta: 'மெரினா கடற்கரை',
  cuisines: ['Snacks', 'Street Food'],
  veg_type: 'veg',
  price_level: 1,
  rating: 4.5,
  open_now: true,
  distance_km: 0.8,
  features: ['sunset spot'],
  tags: ['street'],
  last_updated: new Date().toISOString(),
  dishes: [buildFoodHuntDishPayload()],
  ...overrides,
});

export const buildFoodHuntSuggestionPayload = (
  overrides: Partial<FoodHuntSuggestionPayload> = {}
): FoodHuntSuggestionPayload => ({
  id: 'suggestion-1',
  vendor_name: 'Community Stall',
  vendor_name_ta: 'சமூக கடை',
  area: 'Chromepet',
  area_ta: 'குரோம்பேட்',
  cuisines: ['Snacks'],
  veg_type: 'veg',
  price_level: 1,
  contact_number: '9876543210',
  instagram_handle: '@communitystall',
  whatsapp_number: '9876543210',
  signature_dish: {
    name: 'Budget Bonda',
    name_ta: 'பஜெட் பொண்டா',
    price: 20,
    rating: 4.2,
    spicy_level: 1,
    is_signature: true,
    tags: ['evening'],
  },
  notes: 'Open only in the evenings',
  submitted_by: 'Test Volunteer',
  submitted_by_contact: 'volunteer@test.com',
  status: 'synced',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const foodHuntVendorsSuccessHandlers = ({
  baseUrl = DEFAULT_BASE_URL,
  vendors = [buildFoodHuntVendorPayload()],
  onRequest,
}: FoodHuntHandlerOptions = {}) => [
  http.get(createVendorsPath(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onRequest?.(url);
    return HttpResponse.json(vendors);
  }),
];

export const foodHuntVendorsEmptyHandlers = (options?: FoodHuntHandlerOptions) =>
  foodHuntVendorsSuccessHandlers({ ...options, vendors: [] });

export const foodHuntVendorsErrorHandlers = ({
  baseUrl = DEFAULT_BASE_URL,
  status = 503,
  message = 'Food Hunt temporarily unavailable',
  code = 'SERVICE_UNAVAILABLE',
  onRequest,
}: FoodHuntErrorOptions = {}) => [
  http.get(createVendorsPath(baseUrl), ({ request }) => {
    const url = new URL(request.url);
    onRequest?.(url);
    return HttpResponse.json({ message, code }, { status });
  }),
];

export const foodHuntSubmitSuggestionHandler = ({
  baseUrl = DEFAULT_BASE_URL,
  suggestion = buildFoodHuntSuggestionPayload(),
}: {
  baseUrl?: string;
  suggestion?: FoodHuntSuggestionPayload;
} = {}) =>
  http.post(createSuggestionsPath(baseUrl), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      ...suggestion,
      vendor_name: (body.vendor_name as string) ?? suggestion.vendor_name,
      area: (body.area as string) ?? suggestion.area,
    });
  });
