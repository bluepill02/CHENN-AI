export const LOCALITY_API_BASE_URL = import.meta.env.VITE_LOCALITY_API_BASE_URL?.trim() || '';

export const LOCALITY_API_KEY = import.meta.env.VITE_LOCALITY_API_KEY?.trim() || '';

export const LOCALITY_FEATURE_FLAGS = {
  enableBackend: LOCALITY_API_BASE_URL.length > 0,
};

export const LOCALITY_SIMULATION_STORAGE_KEY = 'chennai-localities-cache';
export const LOCALITY_PENDING_SUBMISSIONS_STORAGE_KEY = 'chennai-localities-pending-submissions';

export interface LocalityApiErrorShape {
  message?: string;
  code?: string;
  status?: number;
}
