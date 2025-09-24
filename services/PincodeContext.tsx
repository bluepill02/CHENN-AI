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
  area?: string;
  district?: string;
  state?: string;
  zone?: string;
  tamil?: string;
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

  // Extended Chennai pincode database
  const chennaiPincodes: Record<string, PincodeInfo> = {
    '600001': { pincode: '600001', area: 'Fort St. George', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'ஃபோர்ட்' },
    '600002': { pincode: '600002', area: 'Mount Road', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'மவுண்ட் ரோடு' },
    '600003': { pincode: '600003', area: 'Broadway', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'பிராட்வே' },
    '600004': { pincode: '600004', area: 'Mylapore', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Chennai', tamil: 'மயிலாப்பூர்' },
    '600005': { pincode: '600005', area: 'Triplicane', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'திருவல்லிக்கேணி' },
    '600006': { pincode: '600006', area: 'Chepauk', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'செப்பாக்கம்' },
    '600014': { pincode: '600014', area: 'Vadapalani', district: 'Chennai', state: 'Tamil Nadu', zone: 'West Chennai', tamil: 'வடபழனி' },
    '600017': { pincode: '600017', area: 'T. Nagar', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Chennai', tamil: 'டி. நகர்' },
    '600020': { pincode: '600020', area: 'Adyar', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Chennai', tamil: 'அடையார்' },
    '600024': { pincode: '600024', area: 'Anna Nagar', district: 'Chennai', state: 'Tamil Nadu', zone: 'North Chennai', tamil: 'அண்ணா நகர்' },
    '600028': { pincode: '600028', area: 'Velachery', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Chennai', tamil: 'வேளச்சேரி' },
    '600034': { pincode: '600034', area: 'Kodambakkam', district: 'Chennai', state: 'Tamil Nadu', zone: 'West Chennai', tamil: 'கோடம்பாக்கம்' },
    '600041': { pincode: '600041', area: 'Royapettah', district: 'Chennai', state: 'Tamil Nadu', zone: 'Central Chennai', tamil: 'ராயப்பேட்டை' },
    '600090': { pincode: '600090', area: 'Besant Nagar', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Chennai', tamil: 'பெசன்ட் நகர்' },
    '600119': { pincode: '600119', area: 'Sholinganallur', district: 'Chennai', state: 'Tamil Nadu', zone: 'IT Corridor', tamil: 'சோளிங்கநல்லூர்' }
  };

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
    return chennaiPincodes[pincode] || null;
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

    const failed: string[] = [];

    // Test each service endpoint
    for (const service of services) {
      try {
        console.debug(`📡 PincodeContext: Testing ${service.name}...`);
        const response = await fetch(service.endpoint);
        
        if (!response.ok) {
          console.debug(`❌ PincodeContext: ${service.name} failed with status ${response.status}`);
          failed.push(service.name);
        } else {
          console.debug(`✅ PincodeContext: ${service.name} succeeded`);
        }
      } catch (error) {
        console.debug(`❌ PincodeContext: ${service.name} failed with error:`, error);
        failed.push(service.name);
      }
    }

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
  }, [validatePincode, triggerServices]);

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