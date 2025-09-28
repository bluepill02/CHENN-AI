import React, { createContext, useContext, useEffect, useState } from 'react';
import type { PincodeLocalContent, PincodeProfile } from '../types/pincode';
import { getPincodeProfile } from './PincodeRepository';

// Types for location data
export interface LocationData {
  pincode: string;
  area: string;
  areaTamil?: string;
  zone: string;
  zoneTamil?: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  metroCorridors?: string[];
  serviceZones?: string[];
  verified: boolean;
  timestamp: number;
  localContent?: PincodeLocalContent;
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

const buildLocationData = (profile: PincodeProfile): LocationData => ({
  pincode: profile.pincode,
  area: profile.area.english,
  areaTamil: profile.area.tamil,
  zone: profile.zone.english,
  zoneTamil: profile.zone.tamil,
  district: profile.district,
  state: profile.state,
  latitude: profile.latitude,
  longitude: profile.longitude,
  metroCorridors: profile.metroCorridors,
  serviceZones: profile.serviceZones,
  localContent: profile.localContent,
  verified: true,
  timestamp: Date.now()
});

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
        const parsed = JSON.parse(savedCurrentLocation) as Partial<LocationData>;
        const profile = parsed?.pincode ? getPincodeProfile(parsed.pincode) : null;
        if (profile) {
          const hydrated = buildLocationData(profile);
          setCurrentLocation({
            ...hydrated,
            timestamp: parsed.timestamp ?? hydrated.timestamp,
            verified: parsed.verified ?? hydrated.verified,
          });
        } else if (parsed?.pincode) {
          setCurrentLocation({
            ...parsed,
            zone: parsed.zone ?? 'Chennai',
            verified: parsed.verified ?? true,
            timestamp: parsed.timestamp ?? Date.now(),
          } as LocationData);
        }
      } catch (e) {
        console.error('Error parsing saved current location:', e);
      }
    }

    if (savedPreviousLocations) {
      try {
        const parsed = JSON.parse(savedPreviousLocations) as Partial<LocationData>[];
        const hydrated = parsed
          .map(entry => {
            if (!entry?.pincode) return null;
            const profile = getPincodeProfile(entry.pincode);
            if (!profile) return null;
            const location = buildLocationData(profile);
            return {
              ...location,
              timestamp: entry.timestamp ?? location.timestamp,
            } as LocationData;
          })
          .filter((value): value is LocationData => Boolean(value));
        if (hydrated.length) {
          setPreviousLocations(hydrated);
        }
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would be an API call to verify pincode
      // and potentially use geolocation API to cross-verify
      const profile = getPincodeProfile(pincode);

      if (!profile) {
        throw new Error('Pincode not found or not supported in Chennai area');
      }

      return buildLocationData(profile);
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