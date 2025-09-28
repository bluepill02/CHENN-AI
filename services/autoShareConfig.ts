export const AUTOSHARE_API_BASE_URL = import.meta.env.VITE_AUTOSHARE_API_BASE_URL?.trim() || '';

export const AUTOSHARE_API_KEY = import.meta.env.VITE_AUTOSHARE_API_KEY?.trim() || '';

export const AUTOSHARE_FEATURE_FLAGS = {
  enableBackend: AUTOSHARE_API_BASE_URL.length > 0,
};

export const AUTOSHARE_SIMULATION_STORAGE_KEY = 'chennai-auto-share-rides';

export const AUTOSHARE_CURRENT_USER_ID = 'u1';

export interface AutoShareApiErrorShape {
  message?: string;
  code?: string;
  status?: number;
}
