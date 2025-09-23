import React, { createContext, useContext, useEffect, useState } from 'react';

// Import Mappls validation function from ExternalDataService
// Note: In a real app, you might want to create a separate MappslService
// For now, we'll create a local validation function

// Mappls API integration for accurate Chennai pincode validation
const MAPPLS_API_KEY = 'hlgokcsmvrbirjotoxixwqscpwvlspinyupy';
const MAPPLS_GEOCODE_URL = 'https://apis.mappls.com/advancedmaps/v1/geocode';

interface MappslLocationResult {
  lat: number;
  lng: number;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  formatted_address: string;
}

// Validate Chennai pincode using Mappls API
const validatePincodeWithMappls = async (pincode: string): Promise<MappslLocationResult | null> => {
  try {
    const response = await fetch(
      `${MAPPLS_GEOCODE_URL}?address=${pincode} Chennai Tamil Nadu&key=${MAPPLS_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn(`Mappls API error: ${response.status}, falling back to local data`);
      return null;
    }
    
    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result || !result.lat || !result.lng) {
      return null;
    }
    
    // Verify it's within Chennai area (rough bounds)
    const isInChennai = (
      result.lat >= 12.8 && result.lat <= 13.3 &&
      result.lng >= 80.0 && result.lng <= 80.5
    );
    
    if (!isInChennai) {
      return null;
    }
    
    return {
      lat: result.lat,
      lng: result.lng,
      area: result.area || result.subLocality || result.locality || '',
      city: result.city || 'Chennai',
      district: result.district || 'Chennai',
      state: result.state || 'Tamil Nadu',
      pincode: pincode,
      formatted_address: result.formatted_address || `${pincode}, Chennai`
    };
  } catch (error) {
    console.warn('Error validating pincode with Mappls:', error);
    return null;
  }
};

// Types for location data
export interface LocationData {
  pincode: string;
  area: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  timestamp: number;
  localContent?: {
    communityName: string;
    localLanguage: string;
    culturalElements: string[];
    nearbyLandmarks: string[];
  };
}

export interface LocationContextType {
  currentLocation: LocationData | null;
  previousLocations: LocationData[];
  isVerifying: boolean;
  verifyLocation: (pincode: string) => Promise<LocationData>;
  switchToLocation: (location: LocationData) => void;
  addNewLocation: (pincode: string) => Promise<void>;
  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
}

// Load Chennai pincode data from our comprehensive pincode database
const loadChennaiPincodeData = async (pincode: string): Promise<LocationData | null> => {
  try {
    // Import the comprehensive pincode stops data
    const pincodeStopsData = await import('../data/pincodeStops.json');
    const pincodeStops = pincodeStopsData.default as Record<string, {busStops: string[], twitterQueries: string[]}>;
    
    // Check if the pincode exists in our database
    if (!pincodeStops[pincode]) {
      return null;
    }
    
    // Get the area name from the first stop/landmark
    const stops = pincodeStops[pincode].busStops;
    const primaryArea = Array.isArray(stops) && stops.length > 0 ? stops[0] : 'Chennai Area';
    
    // Create a comprehensive area name mapping for better user experience
    const areaNameMap: Record<string, string> = {
      'Parry\'s Corner Bus Stand': 'George Town',
      'Chintadripet': 'Anna Salai',
      'Chennai Central Station': 'Central Chennai',
      'Mylapore Tank Bus Stop': 'Mylapore',
      'Chepauk': 'Chepauk',
      'Thousand Lights': 'Anna Nagar',
      'Vepery Police Station': 'Vepery',
      'Egmore Bus Stand': 'Egmore',
      'Fort St. George': 'Fort',
      'T. Nagar Bus Stand': 'T. Nagar',
      'Adyar Depot': 'Adyar',
      'Washermanpet': 'Washermanpet',
      'Royapettah': 'Royapettah',
      'Nungambakkam': 'Nungambakkam',
      'Anna Nagar': 'Anna Nagar',
      'Vadapalani': 'Vadapalani',
      'Kodambakkam': 'Kodambakkam',
      'Saidapet': 'Saidapet',
      'Tambaram Sanatorium': 'Tambaram',
      'Tambaram': 'Tambaram',
      'Mandaveli': 'Mylapore',
      'R.A. Puram': 'R.A. Puram',
      'Santhome': 'Mylapore',
      'Madhavaram': 'Madhavaram',
      'Besant Nagar': 'Besant Nagar',
      'Sholinganallur': 'Sholinganallur',
      'Velachery': 'Velachery',
      'Pallavaram': 'Pallavaram',
      'Chromepet': 'Chromepet'
    };
    
    // Get a cleaner area name
    const cleanAreaName = areaNameMap[primaryArea] || primaryArea || 'Chennai Area';
    
    // Generate approximate coordinates based on pincode (Chennai area bounds)
    const getCoordinatesForPincode = (pin: string): { lat: number; lng: number } => {
      const baseCode = parseInt(pin.substring(3));
      // Chennai coordinates roughly span from 12.8 to 13.3 lat, 80.0 to 80.5 lng
      const lat = 12.8 + (baseCode % 100) * 0.005;  // Distribute across Chennai
      const lng = 80.0 + (baseCode % 50) * 0.01;     // Distribute across Chennai
      return { lat, lng };
    };
    
    const coords = getCoordinatesForPincode(pincode);
    
    return {
      pincode: pincode,
      area: cleanAreaName,
      district: 'Chennai',
      state: 'Tamil Nadu',
      latitude: coords.lat,
      longitude: coords.lng,
      verified: true,
      timestamp: Date.now(),
      localContent: {
        communityName: `${cleanAreaName} Community`,
        localLanguage: 'Tamil',
        culturalElements: ['Local Temple', 'Community Center'],
        nearbyLandmarks: stops.slice(0, 3) // Use first 3 stops as landmarks
      }
    };
  } catch (error) {
    console.error('Error loading Chennai pincode data:', error);
    return null;
  }
};

// Mock location database - in real implementation, this would be an API call
const mockLocationDatabase: Record<string, Omit<LocationData, 'verified' | 'timestamp'>> = {
  '600001': {
    pincode: '600001',
    area: 'Parrys Corner',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0917,
    longitude: 80.2847,
    localContent: {
      communityName: 'George Town Neighborhood',
      localLanguage: 'Tamil',
      culturalElements: ['அருள்மிகு வீரமாகாளி அம்மன் கோவில்', 'Kapaleeshwarar Temple'],
      nearbyLandmarks: ['Chennai Central', 'High Court', 'Government Museum']
    }
  },
  '600002': {
    pincode: '600002',
    area: 'Anna Salai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0627,
    longitude: 80.2707,
    localContent: {
      communityName: 'Anna Salai Community',
      localLanguage: 'Tamil',
      culturalElements: ['Valluvar Kottam', 'Tamil Cultural Center'],
      nearbyLandmarks: ['LIC Building', 'Gemini Flyover', 'Thousand Lights']
    }
  },
  '600004': {
    pincode: '600004',
    area: 'Mylapore',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0339,
    longitude: 80.2619,
    localContent: {
      communityName: 'Mylapore Heritage Community',
      localLanguage: 'Tamil',
      culturalElements: ['கபாலீசுவரர் கோவில்', 'Bharatanatyam Dance Schools'],
      nearbyLandmarks: ['Kapaleeshwarar Temple', 'Luz Corner', 'Santhome Cathedral']
    }
  },
  '600006': {
    pincode: '600006',
    area: 'Chepauk',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0732,
    longitude: 80.2609,
    localContent: {
      communityName: 'Chepauk Sports Community',
      localLanguage: 'Tamil',
      culturalElements: ['MA Chidambaram Stadium', 'Government buildings'],
      nearbyLandmarks: ['Chepauk Stadium', 'University of Madras', 'Ice House']
    }
  },
  '600020': {
    pincode: '600020',
    area: 'T. Nagar',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0418,
    longitude: 80.2341,
    localContent: {
      communityName: 'T. Nagar Shopping Community',
      localLanguage: 'Tamil',
      culturalElements: ['Ranganathan Street', 'South Indian Shopping Culture'],
      nearbyLandmarks: ['Pondy Bazaar', 'Ranganathan Street', 'Mambalam Railway Station']
    }
  },
  '600028': {
    pincode: '600028',
    area: 'Anna Nagar',
    district: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0850,
    longitude: 80.2101,
    localContent: {
      communityName: 'Anna Nagar Residential Community',
      localLanguage: 'Tamil',
      culturalElements: ['Anna Nagar Tower Park', 'Modern residential culture'],
      nearbyLandmarks: ['Anna Nagar Tower', 'Shanti Colony', 'Thirumangalam']
    }
  }
};

const LocationContext = createContext<LocationContextType | null>(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [previousLocations, setPreviousLocations] = useState<LocationData[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  // Load saved locations from localStorage on initialization
  useEffect(() => {
    const savedCurrentLocation = localStorage.getItem('chennai-app-current-location');
    const savedPreviousLocations = localStorage.getItem('chennai-app-previous-locations');

    if (savedCurrentLocation) {
      try {
        setCurrentLocation(JSON.parse(savedCurrentLocation));
      } catch (e) {
        console.error('Error parsing saved current location:', e);
      }
    }

    if (savedPreviousLocations) {
      try {
        setPreviousLocations(JSON.parse(savedPreviousLocations));
      } catch (e) {
        console.error('Error parsing saved previous locations:', e);
      }
    }
  }, []);

  // Save to localStorage whenever locations change
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem('chennai-app-current-location', JSON.stringify(currentLocation));
    }
  }, [currentLocation]);

  useEffect(() => {
    localStorage.setItem('chennai-app-previous-locations', JSON.stringify(previousLocations));
  }, [previousLocations]);

  const verifyLocation = async (pincode: string): Promise<LocationData> => {
    setIsVerifying(true);
    
    try {
      // First, try to validate with Mappls API for accurate Chennai data
      const mappslResult = await validatePincodeWithMappls(pincode);
      
      if (mappslResult) {
        // Successfully validated with Mappls - create location data
        const locationData: LocationData = {
          pincode: mappslResult.pincode,
          area: mappslResult.area || 'Chennai Area',
          district: mappslResult.district,
          state: mappslResult.state,
          latitude: mappslResult.lat,
          longitude: mappslResult.lng,
          verified: true,
          timestamp: Date.now(),
          localContent: {
            communityName: `${mappslResult.area} Neighborhood`,
            localLanguage: 'Tamil',
            culturalElements: ['Local Temple', 'Community Center'],
            nearbyLandmarks: [mappslResult.formatted_address]
          }
        };
        
        return locationData;
      }
      
      // Second fallback: Try our comprehensive Chennai pincode database
      const chennaiPincodeData = await loadChennaiPincodeData(pincode);
      
      if (chennaiPincodeData) {
        return chennaiPincodeData;
      }
      
      // Third fallback: Check basic Chennai pincode format (600xxx)
      if (pincode.startsWith('600') && pincode.length === 6) {
        // Even if not in our database, if it's a 600xxx pincode, assume it's Chennai
        const locationData: LocationData = {
          pincode: pincode,
          area: 'Chennai Area',
          district: 'Chennai',
          state: 'Tamil Nadu',
          latitude: 13.0827,  // Chennai center coordinates
          longitude: 80.2707,
          verified: true,
          timestamp: Date.now(),
          localContent: {
            communityName: 'Chennai Community',
            localLanguage: 'Tamil',
            culturalElements: ['Local Temple', 'Community Center'],
            nearbyLandmarks: ['Chennai landmarks']
          }
        };
        
        return locationData;
      }

      // Final fallback to mock database for legacy support
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const locationInfo = mockLocationDatabase[pincode];
      
      if (!locationInfo) {
        throw new Error('Pincode not found or not supported in Chennai area. Please ensure you enter a valid Chennai pincode (600xxx).');
      }

      // Create location data from local database
      const locationData: LocationData = {
        ...locationInfo,
        verified: true,
        timestamp: Date.now()
      };

      return locationData;
    } catch (error) {
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  const switchToLocation = (location: LocationData) => {
    // If switching to a different location, add current to previous locations
    if (currentLocation && currentLocation.pincode !== location.pincode) {
      setPreviousLocations(prev => {
        const filtered = prev.filter(loc => loc.pincode !== currentLocation.pincode);
        return [currentLocation, ...filtered].slice(0, 5); // Keep max 5 previous locations
      });
    }
    
    setCurrentLocation(location);
    setLocationModalOpen(false);
  };

  const addNewLocation = async (pincode: string) => {
    try {
      const newLocation = await verifyLocation(pincode);
      
      // Add current location to previous if exists
      if (currentLocation) {
        setPreviousLocations(prev => {
          const filtered = prev.filter(loc => loc.pincode !== currentLocation.pincode);
          return [currentLocation, ...filtered].slice(0, 5);
        });
      }
      
      setCurrentLocation(newLocation);
      setLocationModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const value: LocationContextType = {
    currentLocation,
    previousLocations,
    isVerifying,
    verifyLocation,
    switchToLocation,
    addNewLocation,
    isLocationModalOpen,
    setLocationModalOpen
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Utility function to get location-specific content
export const getLocationSpecificContent = (location: LocationData | null) => {
  if (!location) {
    return {
      greeting: 'Welcome to Chennai Community',
      localEvents: [],
      nearbyServices: [],
      culturalHighlights: []
    };
  }

  return {
    greeting: `வணக்கம் ${location.area}! Welcome to your neighborhood`,
    localEvents: [
      `${location.area} Community Meet - Tomorrow 6 PM`,
      `Local Temple Festival - ${location.localContent?.culturalElements[0]}`,
      'Neighborhood Clean Drive - This Weekend'
    ],
    nearbyServices: location.localContent?.nearbyLandmarks || [],
    culturalHighlights: location.localContent?.culturalElements || []
  };
};

// Function to generate location-aware community posts
export const getLocationAwarePosts = (location: LocationData | null) => {
  if (!location) return [];

  const baseTime = Date.now();
  
  return [
    {
      id: 1,
      author: 'Priya Krishnan',
      content: `Looking for a good தையல்காரர் (tailor) near ${location.area}. Any recommendations from neighbors?`,
      likes: 12,
      comments: 8,
      timestamp: baseTime - 2 * 60 * 60 * 1000, // 2 hours ago
      location: location.area,
      tags: ['#Local', '#Recommendations']
    },
    {
      id: 2,
      author: 'Rajesh Kumar',
      content: `Traffic update: ${location.localContent?.nearbyLandmarks[0]} route is clear this morning. Good time to travel!`,
      likes: 24,
      comments: 5,
      timestamp: baseTime - 4 * 60 * 60 * 1000, // 4 hours ago
      location: location.area,
      tags: ['#Traffic', '#LocalUpdate']
    },
    {
      id: 3,
      author: 'Meera Devi',
      content: `Organizing a கோலம் (Kolam) competition for our ${location.localContent?.communityName}. Interested ladies please DM!`,
      likes: 18,
      comments: 12,
      timestamp: baseTime - 6 * 60 * 60 * 1000, // 6 hours ago
      location: location.area,
      tags: ['#Culture', '#Community']
    }
  ];
};