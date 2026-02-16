/// <reference types="vite/client" />

/**
 * Auto-generated environment variable type definitions
 * Generated from .env.example
 * DO NOT EDIT MANUALLY - Run 'npm run generate:env-types' to regenerate
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT: string;
  readonly VITE_AZURE_OPENAI_KEY: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT: string;
  readonly VITE_HUGGING_FACE_API_KEY: string;
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_DEFAULT_CITY?: string;
    readonly REACT_APP_DEFAULT_COORDS?: string;
    readonly REACT_APP_API_TIMEOUT?: string;
    readonly REACT_APP_CACHE_DURATION?: string;
    readonly REACT_APP_GOOGLE_MAPS_API_KEY?: string;
    readonly REACT_APP_TOMTOM_API_KEY?: string;
    readonly REACT_APP_MAPBOX_ACCESS_TOKEN?: string;
    readonly REACT_APP_CHENNAI_CORP_API_KEY?: string;
    readonly REACT_APP_CMRL_API_KEY?: string;
    readonly REACT_APP_MTC_API_KEY?: string;
    readonly REACT_APP_TWITTER_BEARER_TOKEN?: string;
    readonly WEATHER_API_KEY?: string;
  }
}

// Helper type for environment variable validation
export type RequiredEnvVars = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_GROQ_API_KEY' | 'VITE_AZURE_OPENAI_ENDPOINT' | 'VITE_AZURE_OPENAI_KEY' | 'VITE_AZURE_OPENAI_DEPLOYMENT' | 'VITE_HUGGING_FACE_API_KEY' | 'VITE_SITE_URL';

// Runtime validation helper
export function validateEnv(): void {
  const required: RequiredEnvVars[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}
