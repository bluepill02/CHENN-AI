export const COMMUNITY_API_BASE_URL = import.meta.env.VITE_COMMUNITY_API_BASE_URL?.trim() || '';

export const COMMUNITY_API_KEY = import.meta.env.VITE_COMMUNITY_API_KEY?.trim() || '';

export const COMMUNITY_MEDIA_UPLOAD_ENABLED =
  import.meta.env.VITE_COMMUNITY_MEDIA_UPLOAD === 'enabled';

export const COMMUNITY_FEATURE_FLAGS = {
  enableBackend: COMMUNITY_API_BASE_URL.length > 0,
  mediaUpload: COMMUNITY_MEDIA_UPLOAD_ENABLED,
};

export interface ApiErrorShape {
  message: string;
  code?: string;
  status?: number;
}
