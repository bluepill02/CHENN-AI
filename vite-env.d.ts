/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string;
  readonly VITE_MAPPLS_API_KEY: string;
  readonly VITE_COMMUNITY_API_BASE_URL?: string;
  readonly VITE_COMMUNITY_API_KEY?: string;
  readonly VITE_COMMUNITY_MEDIA_UPLOAD?: 'enabled' | 'disabled';
  readonly VITE_AUTOSHARE_API_BASE_URL?: string;
  readonly VITE_AUTOSHARE_API_KEY?: string;
  readonly VITE_FOODHUNT_API_BASE_URL?: string;
  readonly VITE_FOODHUNT_API_KEY?: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}