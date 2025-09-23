// DEPRECATED: This file has been moved to /services/ExternalDataService.tsx
// This is a small backward-compatibility shim. Prefer importing directly:
// import { ExternalDataProvider, useExternalData } from '../services/ExternalDataService';

// Re-export only the provider and hook to avoid accidentally re-exporting
// provider-scoped functions that are not valid top-level bindings.
export { ExternalDataProvider, useExternalData } from '../services/ExternalDataService';
