export interface LocalityMetrics {
  liveability: number; // 0-5
  connectivity: number; // 0-5
  foodCulture: number; // 0-5
  affordability: number; // 0-5
  buzz: number; // 0-5
}

export interface LocalitySampleTweet {
  id: number | string;
  text: string;
  user: string;
  time: string;
}

export interface Locality {
  id: string;
  nameEn: string;
  nameTa: string;
  score: number; // 0-5 computed weighted average
  metrics: LocalityMetrics;
  sources: string[];
  description?: string;
  descriptionTa?: string;
  highlights?: string[];
  sampleTweets?: LocalitySampleTweet[];
  pincode?: string;
  popularSpots?: string[];
  lastUpdated?: string;
  isCommunitySubmission?: boolean;
  submissionStatus?: 'pending' | 'synced';
}

export interface LocalitySuggestionInput {
  nameEn: string;
  nameTa?: string;
  areaCode?: string;
  pincode?: string;
  metrics?: Partial<LocalityMetrics>;
  highlights?: string[];
  sources?: string[];
  notes?: string;
  submittedBy?: string;
  submittedByContact?: string;
}

export interface LocalitySuggestion extends LocalitySuggestionInput {
  id: string;
  createdAt: string;
  status: 'pending' | 'synced';
}

export default Locality;
