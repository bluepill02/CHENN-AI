import type {
    Dish,
    FoodHuntSuggestion,
    FoodHuntSuggestionInput,
    Vendor,
} from '../types/foodhunt';
import {
    FOODHUNT_API_BASE_URL,
    FOODHUNT_API_KEY,
    type FoodHuntApiErrorShape,
} from './foodHuntConfig';

interface FoodVendorPayload {
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
  dishes?: FoodDishPayload[];
}

interface FoodDishPayload {
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

interface FoodHuntSuggestionPayload {
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

export class FoodHuntApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string = FOODHUNT_API_BASE_URL, apiKey: string = FOODHUNT_API_KEY) {
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
      throw new Error('Food Hunt API client is not enabled. Provide VITE_FOODHUNT_API_BASE_URL.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
    });

    if (!response.ok) {
      let errorBody: FoodHuntApiErrorShape | undefined;
      try {
        errorBody = await response.json();
      } catch (error) {
        // ignore - response may not contain JSON
      }

      const message = errorBody?.message || `Food Hunt API request failed with status ${response.status}`;
      const error = new Error(message);
      (error as Error & FoodHuntApiErrorShape).code = errorBody?.code;
      (error as Error & FoodHuntApiErrorShape).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async fetchVendors(): Promise<Vendor[]> {
    const payloads = await this.request<FoodVendorPayload[]>('/food-hunt/vendors');
    return payloads.map(deserializeVendor);
  }

  async submitSuggestion(input: FoodHuntSuggestionInput): Promise<FoodHuntSuggestion> {
    const body = serializeSuggestion(input);
    const created = await this.request<FoodHuntSuggestionPayload>('/food-hunt/suggestions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return deserializeSuggestion(created);
  }
}

function deserializeVendor(payload: FoodVendorPayload): Vendor {
  return {
    id: payload.id,
    nameEn: payload.name,
    nameTa: payload.name_ta || payload.name,
    areaEn: payload.area,
    areaTa: payload.area_ta || payload.area,
    cuisines: payload.cuisines,
    vegType: payload.veg_type,
    priceLevel: payload.price_level,
    rating: payload.rating,
    openNow: payload.open_now,
    distanceKm: payload.distance_km ?? 0,
    features: payload.features,
    tags: payload.tags,
    lastUpdated: payload.last_updated,
    contactNumber: payload.contact_number,
    instagramHandle: payload.instagram_handle,
    whatsappNumber: payload.whatsapp_number,
    submissionStatus: 'synced',
    dishes: (payload.dishes ?? []).map(deserializeDish),
  };
}

function deserializeDish(payload: FoodDishPayload): Dish {
  return {
    id: payload.id,
    nameEn: payload.name,
    nameTa: payload.name_ta || payload.name,
    price: payload.price,
    rating: payload.rating,
    spicyLevel: payload.spicy_level ?? 0,
    isSignature: payload.is_signature,
    tags: payload.tags,
    imageUrl: payload.image_url,
    description: payload.description,
    category: payload.category,
    availability: payload.availability,
    allergens: payload.allergens,
  };
}

function serializeSuggestion(input: FoodHuntSuggestionInput) {
  return {
    vendor_name: input.vendorNameEn,
    vendor_name_ta: input.vendorNameTa,
    area: input.areaEn,
    area_ta: input.areaTa,
    cuisines: input.cuisines,
    veg_type: input.vegType,
    price_level: input.priceLevel,
    contact_number: input.contactNumber,
    instagram_handle: input.instagramHandle,
    whatsapp_number: input.whatsappNumber,
    signature_dish: input.signatureDish
      ? {
          name: input.signatureDish.nameEn,
          name_ta: input.signatureDish.nameTa,
          price: input.signatureDish.price,
          rating: input.signatureDish.rating,
          spicy_level: input.signatureDish.spicyLevel,
          is_signature: input.signatureDish.isSignature,
          tags: input.signatureDish.tags,
          description: input.signatureDish.description,
          category: input.signatureDish.category,
          availability: input.signatureDish.availability,
        }
      : undefined,
    notes: input.notes,
    submitted_by: input.submittedBy,
    submitted_by_contact: input.submittedByContact,
  };
}

function deserializeSuggestion(payload: FoodHuntSuggestionPayload): FoodHuntSuggestion {
  return {
    id: payload.id,
    vendorNameEn: payload.vendor_name,
    vendorNameTa: payload.vendor_name_ta,
    areaEn: payload.area,
    areaTa: payload.area_ta,
    cuisines: payload.cuisines,
    vegType: payload.veg_type,
    priceLevel: payload.price_level,
    contactNumber: payload.contact_number,
    instagramHandle: payload.instagram_handle,
    whatsappNumber: payload.whatsapp_number,
    signatureDish: payload.signature_dish
      ? {
          nameEn: payload.signature_dish.name,
          nameTa: payload.signature_dish.name_ta,
          price: payload.signature_dish.price,
          rating: payload.signature_dish.rating,
          spicyLevel: payload.signature_dish.spicy_level,
          isSignature: payload.signature_dish.is_signature,
          tags: payload.signature_dish.tags,
          description: payload.signature_dish.description,
          category: payload.signature_dish.category,
          availability: payload.signature_dish.availability,
        }
      : undefined,
    notes: payload.notes,
    submittedBy: payload.submitted_by,
    submittedByContact: payload.submitted_by_contact,
    status: payload.status,
    createdAt: payload.created_at,
  };
}
