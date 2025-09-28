export interface Dish {
  id: string;
  nameEn: string;
  nameTa: string;
  price: number;
  rating: number;
  spicyLevel: number; // 0-3
  isSignature?: boolean;
  tags?: string[];
  imageUrl?: string;
  description?: string;
  category?: string;
  availability?: 'breakfast' | 'lunch' | 'dinner' | 'all-day';
  allergens?: string[];
}

export type VegType = 'veg' | 'non-veg' | 'mixed';

export interface Vendor {
  id: string;
  nameEn: string;
  nameTa: string;
  areaEn: string;
  areaTa: string;
  cuisines: string[];
  vegType: VegType;
  priceLevel: 1 | 2 | 3; // 1=₹,2=₹₹,3=₹₹₹
  rating: number; // 0-5
  openNow: boolean;
  distanceKm: number;
  features?: string[]; // e.g., ['filter-coffee','home-delivery']
  tags?: string[];
  lastUpdated?: string;
  contactNumber?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  isCommunitySubmission?: boolean;
  submittedBy?: string;
  submissionStatus?: 'pending' | 'synced';
  dishes: Dish[];
}

export interface FoodHuntSuggestionInput {
  vendorNameEn: string;
  vendorNameTa?: string;
  areaEn: string;
  areaTa?: string;
  cuisines: string[];
  vegType: VegType;
  priceLevel: 1 | 2 | 3;
  contactNumber?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  signatureDish?: {
    nameEn: string;
    nameTa?: string;
    price?: number;
    rating?: number;
    spicyLevel?: number;
    isSignature?: boolean;
    tags?: string[];
    description?: string;
    category?: string;
    availability?: Dish['availability'];
  };
  notes?: string;
  submittedBy?: string;
  submittedByContact?: string;
}

export interface FoodHuntSuggestion extends FoodHuntSuggestionInput {
  id: string;
  status: 'pending' | 'synced';
  createdAt: string;
}
