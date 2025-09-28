export const FOODHUNT_API_BASE_URL = import.meta.env.VITE_FOODHUNT_API_BASE_URL?.trim() || '';

export const FOODHUNT_API_KEY = import.meta.env.VITE_FOODHUNT_API_KEY?.trim() || '';

export const FOODHUNT_FEATURE_FLAGS = {
  enableBackend: FOODHUNT_API_BASE_URL.length > 0,
};

export const FOODHUNT_SIMULATION_STORAGE_KEY = 'chennai-food-hunt-vendors';

export const FOODHUNT_PENDING_SUBMISSIONS_STORAGE_KEY = 'chennai-food-hunt-pending-submissions';

export const FOODHUNT_RECENT_SUBMISSIONS_STORAGE_KEY = 'chennai-food-hunt-recent-submissions';

export interface FoodHuntApiErrorShape {
  message?: string;
  code?: string;
  status?: number;
}
