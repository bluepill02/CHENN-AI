import type {
    Locality,
    LocalityMetrics,
    LocalitySampleTweet,
    LocalitySuggestion,
    LocalitySuggestionInput,
} from '../src/types/locality';
import {
    LOCALITY_API_BASE_URL,
    LOCALITY_API_KEY,
    type LocalityApiErrorShape,
} from './localityConfig';

interface LocalityPayload {
  id: string;
  name: string;
  name_ta?: string;
  score: number;
  metrics: {
    liveability: number;
    connectivity: number;
    food_culture: number;
    affordability: number;
    buzz: number;
  };
  sources?: string[];
  description?: string;
  description_ta?: string;
  highlights?: string[];
  sample_tweets?: SampleTweetPayload[];
  pincode?: string;
  popular_spots?: string[];
  last_updated?: string;
}

interface RateLocalityResponse extends LocalityPayload {}

interface SuggestionPayload {
  id: string;
  name: string;
  name_ta?: string;
  pincode?: string;
  notes?: string;
  submitted_by?: string;
  submitted_by_contact?: string;
  status: 'pending' | 'synced';
  created_at: string;
  metrics?: LocalityPayload['metrics'];
  highlights?: string[];
  sources?: string[];
}

type SampleTweetPayload = {
  id: string | number;
  text: string;
  user: string;
  time: string;
};

export class LocalityApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string = LOCALITY_API_BASE_URL, apiKey: string = LOCALITY_API_KEY) {
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
      throw new Error('Locality API client is not enabled. Provide VITE_LOCALITY_API_BASE_URL.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
    });

    if (!response.ok) {
      let errorBody: LocalityApiErrorShape | undefined;
      try {
        errorBody = await response.json();
      } catch (error) {
        // no-op: body might be empty
      }

      const message = errorBody?.message || `Locality API request failed with status ${response.status}`;
      const error = new Error(message);
      (error as Error & LocalityApiErrorShape).code = errorBody?.code;
      (error as Error & LocalityApiErrorShape).status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async fetchLocalities(): Promise<Locality[]> {
    const payloads = await this.request<LocalityPayload[]>('/localities');
    return payloads.map(deserializeLocality);
  }

  async rateLocality(localityId: string, rating: number): Promise<Locality> {
    const updated = await this.request<RateLocalityResponse>(`/localities/${localityId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
    return deserializeLocality(updated);
  }

  async submitSuggestion(input: LocalitySuggestionInput): Promise<LocalitySuggestion> {
    const body = serializeSuggestion(input);
    const created = await this.request<SuggestionPayload>('/localities/suggestions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return deserializeSuggestion(created);
  }
}

function deserializeLocality(payload: LocalityPayload): Locality {
  return {
    id: payload.id,
    nameEn: payload.name,
    nameTa: payload.name_ta || payload.name,
    score: payload.score,
    metrics: deserializeMetrics(payload.metrics),
    sources: payload.sources ?? [],
    description: payload.description,
    descriptionTa: payload.description_ta,
    highlights: payload.highlights,
    sampleTweets: payload.sample_tweets?.map(deserializeTweet),
    pincode: payload.pincode,
    popularSpots: payload.popular_spots,
    lastUpdated: payload.last_updated,
    isCommunitySubmission: false,
    submissionStatus: 'synced',
  };
}

function deserializeMetrics(payload: LocalityPayload['metrics']): LocalityMetrics {
  return {
    liveability: payload.liveability,
    connectivity: payload.connectivity,
    foodCulture: payload.food_culture,
    affordability: payload.affordability,
    buzz: payload.buzz,
  };
}

function deserializeTweet(payload: SampleTweetPayload): LocalitySampleTweet {
  return {
    id: payload.id,
    text: payload.text,
    user: payload.user,
    time: payload.time,
  };
}

function serializeSuggestion(input: LocalitySuggestionInput) {
  return {
    name: input.nameEn,
    name_ta: input.nameTa,
    pincode: input.pincode,
    area_code: input.areaCode,
    metrics: input.metrics
      ? {
          liveability: input.metrics.liveability,
          connectivity: input.metrics.connectivity,
          food_culture: input.metrics.foodCulture,
          affordability: input.metrics.affordability,
          buzz: input.metrics.buzz,
        }
      : undefined,
    highlights: input.highlights,
    sources: input.sources,
    notes: input.notes,
    submitted_by: input.submittedBy,
    submitted_by_contact: input.submittedByContact,
  };
}

function deserializeSuggestion(payload: SuggestionPayload): LocalitySuggestion {
  return {
    id: payload.id,
    nameEn: payload.name,
    nameTa: payload.name_ta,
    pincode: payload.pincode,
    notes: payload.notes,
    submittedBy: payload.submitted_by,
    submittedByContact: payload.submitted_by_contact,
    status: payload.status,
    createdAt: payload.created_at,
    metrics: payload.metrics
      ? {
          liveability: payload.metrics.liveability,
          connectivity: payload.metrics.connectivity,
          foodCulture: payload.metrics.food_culture,
          affordability: payload.metrics.affordability,
          buzz: payload.metrics.buzz,
        }
      : undefined,
    highlights: payload.highlights,
    sources: payload.sources,
  };
}
