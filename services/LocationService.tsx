import React, { createContext, useContext, useState, useEffect } from 'react';

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would be an API call to verify pincode
      // and potentially use geolocation API to cross-verify
      const locationInfo = mockLocationDatabase[pincode];
      
      if (!locationInfo) {
        throw new Error('Pincode not found or not supported in Chennai area');
      }

      // Simulate location verification (in real app, would use GPS/network location)
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