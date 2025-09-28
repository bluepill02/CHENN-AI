/**
 * PincodeContext - Centralized pincode management for the Chennai app
 * 
 * Data Flow:
 * 1. User inputs pincode → validatePincode() → setPincode()
 * 2. Context updates → triggers all subscribed services
 * 3. Services fetch data → cards re-render with new data
 * 
 * Services triggered on pincode change:
 * - busService (BusByPincodeCard)
 * - metroService (TimetableCard) 
 * - trafficService (TrafficPanel)
 * - weatherService (WeatherPanel)
 * - twitterService (TwitterLocalCard)
 * - templeService (TempleInfoPanel)
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PincodeLocalContent } from '../types/pincode';
import { getPincodeProfile } from './PincodeRepository';

// Indian pincode validation pattern
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export interface PincodeContextType {
  /** Current active pincode */
  currentPincode: string | null;
  /** Whether pincode is currently being validated */
  isValidating: boolean;
  /** Validation error message if any */
  validationError: string | null;
  /** Whether services are currently fetching data */
  isLoadingServices: boolean;
  /** Services that failed to load data for current pincode */
  failedServices: string[];
  /** Update pincode with validation */
  setPincode: (pincode: string) => Promise<boolean>;
  /** Validate pincode format */
  validatePincode: (pincode: string) => { isValid: boolean; error?: string };
  /** Clear current pincode */
  clearPincode: () => void;
  /** Get pincode area information if available */
  getPincodeInfo: (pincode: string) => PincodeInfo | null;
}

export interface PincodeInfo {
  pincode: string;
  area: string;
  areaTamil?: string;
  district: string;
  state: string;
  zone: string;
  zoneTamil?: string;
  metroCorridors?: string[];
  serviceZones?: string[];
  localContent?: PincodeLocalContent;
  busStops?: string[];
  twitterQueries?: string[];
}

interface PincodeContextProviderProps {
  children: React.ReactNode;
}

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export function PincodeContextProvider({ children }: PincodeContextProviderProps) {
  const [currentPincode, setCurrentPincode] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [failedServices, setFailedServices] = useState<string[]>([]);

  const validatePincode = useCallback((pincode: string): { isValid: boolean; error?: string } => {
    if (!pincode) {
      return { isValid: false, error: 'Pincode is required' };
    }
    
    if (!PINCODE_REGEX.test(pincode)) {
      return { isValid: false, error: 'Invalid pincode format. Must be 6 digits starting with 1-9.' };
    }
    
    return { isValid: true };
  }, []);

  const getPincodeInfo = useCallback((pincode: string): PincodeInfo | null => {
    const profile = getPincodeProfile(pincode);
    if (!profile) {
      return null;
    }

    return {
      pincode: profile.pincode,
      area: profile.area.english,
      areaTamil: profile.area.tamil,
      district: profile.district,
      state: profile.state,
      zone: profile.zone.english,
      zoneTamil: profile.zone.tamil,
      metroCorridors: profile.metroCorridors,
      serviceZones: profile.serviceZones,
      localContent: profile.localContent,
      busStops: profile.busStops,
      twitterQueries: profile.twitterQueries,
    };
  }, []);

  const triggerServices = useCallback(async (pincode: string) => {
    console.debug('🏷️ PincodeContext: Triggering services for pincode:', pincode);
    setIsLoadingServices(true);
    setFailedServices([]);

    const services = [
      { name: 'busService', endpoint: `/api/busByPincode?pincode=${pincode}` },
      { name: 'trafficService', endpoint: `/api/traffic?pincode=${pincode}` },
      { name: 'weatherService', endpoint: `/api/weather?pincode=${pincode}` },
      { name: 'twitterService', endpoint: `/api/twitterFeed?pincode=${pincode}` }
    ];

    const results = await Promise.all(services.map(async (service) => {
      try {
        console.debug(`📡 PincodeContext: Testing ${service.name}...`);
        const response = await fetch(service.endpoint);

        if (!response.ok) {
          console.debug(`❌ PincodeContext: ${service.name} failed with status ${response.status}`);
          return { name: service.name, failed: true };
        }

        console.debug(`✅ PincodeContext: ${service.name} succeeded`);
        return { name: service.name, failed: false };
      } catch (error) {
        console.debug(`❌ PincodeContext: ${service.name} failed with error:`, error);
        return { name: service.name, failed: true };
      }
    }));

    const failed = results
      .filter((result) => result.failed)
      .map((result) => result.name);

    setFailedServices(failed);
    setIsLoadingServices(false);

    if (failed.length > 0) {
      console.debug('⚠️ PincodeContext: Some services failed for pincode', pincode, 'Failed:', failed);
    }
  }, []);

  const setPincode = useCallback(async (pincode: string): Promise<boolean> => {
    console.debug('🏷️ PincodeContext: Setting pincode:', pincode);
    
    setIsValidating(true);
    setValidationError(null);

    const validation = validatePincode(pincode);
    
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid pincode');
      setIsValidating(false);
      console.debug('❌ PincodeContext: Validation failed:', validation.error);
      return false;
    }

    try {
      const metadata = getPincodeInfo(pincode);
      if (!metadata) {
        const message = 'Pincode not supported yet in Chennai network';
        setValidationError(message);
        setIsValidating(false);
        console.debug('❌ PincodeContext: Metadata not found for pincode:', pincode);
        return false;
      }

      // Set the pincode immediately
      setCurrentPincode(pincode);
      
      // Trigger all services
      await triggerServices(pincode);
      
      setIsValidating(false);
      console.debug('✅ PincodeContext: Pincode set successfully:', pincode);
      return true;
    } catch (error) {
      setValidationError('Failed to validate pincode');
      setIsValidating(false);
      console.debug('❌ PincodeContext: Error setting pincode:', error);
      return false;
    }
  }, [validatePincode, triggerServices, getPincodeInfo]);

  const clearPincode = useCallback(() => {
    console.debug('🏷️ PincodeContext: Clearing pincode');
    setCurrentPincode(null);
    setValidationError(null);
    setFailedServices([]);
  }, []);

  // Load pincode from localStorage on mount
  useEffect(() => {
    const savedPincode = localStorage.getItem('selectedPincode');
    if (savedPincode) {
      console.debug('🏷️ PincodeContext: Loading saved pincode:', savedPincode);
      setPincode(savedPincode);
    }
  }, [setPincode]);

  // Save pincode to localStorage when it changes
  useEffect(() => {
    if (currentPincode) {
      localStorage.setItem('selectedPincode', currentPincode);
    } else {
      localStorage.removeItem('selectedPincode');
    }
  }, [currentPincode]);

  const contextValue: PincodeContextType = {
    currentPincode,
    isValidating,
    validationError,
    isLoadingServices,
    failedServices,
    setPincode,
    validatePincode,
    clearPincode,
    getPincodeInfo
  };

  return (
    <PincodeContext.Provider value={contextValue}>
      {children}
    </PincodeContext.Provider>
  );
}

export function usePincodeContext(): PincodeContextType {
  const context = useContext(PincodeContext);
  if (context === undefined) {
    throw new Error('usePincodeContext must be used within a PincodeContextProvider');
  }
  return context;
}

export default PincodeContext;