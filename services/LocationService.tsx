import React, { createContext, useContext, useEffect, useState } from 'react';

// Import Mappls validation function from ExternalDataService
// Note: In a real app, you might want to create a separate MappslService
// For now, we'll create a local validation function

// Mappls API integration for accurate Chennai pincode validation
// Free APIs for location services
const INDIA_POST_API_URL = 'https://api.postalpincode.in/pincode';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

interface IndiaPostResult {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description: string | null;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Country: string;
    Pincode: string;
  }>;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface ValidatedLocation {
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  formatted_address: string;
}

// Validate pincode using India Post API and get coordinates from Nominatim
const validatePincodeFree = async (pincode: string): Promise<ValidatedLocation | null> => {
  try {
    // 1. Get location details from India Post API
    const postResponse = await fetch(`${INDIA_POST_API_URL}/${pincode}`);
    if (!postResponse.ok) throw new Error('India Post API failed');

    const postData: IndiaPostResult[] = await postResponse.json();
    if (postData[0].Status !== 'Success' || !postData[0].PostOffice) {
      return null;
    }

    const office = postData[0].PostOffice[0];
    const area = office.Name;
    const district = office.District;
    const state = office.State;

    // 2. Get coordinates from Nominatim (OpenStreetMap)
    // We search for "Pincode, District, State" to be specific
    const query = `${pincode}, ${district}, ${state}, India`;
    const geoResponse = await fetch(
      `${NOMINATIM_API_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'User-Agent': 'ChennaiCommunityApp/1.0'
        }
      }
    );

    let lat = 13.0827; // Default Chennai Lat
    let lon = 80.2707; // Default Chennai Lon

    if (geoResponse.ok) {
      const geoData: NominatimResult[] = await geoResponse.json();
      if (geoData.length > 0) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    }

    return {
      latitude: lat,
      longitude: lon,
      area: area,
      city: district, // Using District as City for better mapping
      district: district,
      state: state,
      pincode: pincode,
      formatted_address: `${area}, ${district}, ${state} - ${pincode}`
    };

  } catch (error) {
    console.warn('Error validating pincode with free APIs:', error);
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
    const pincodeStops = pincodeStopsData.default as Record<string, { busStops: string[], twitterQueries: string[] }>;

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
    const loadInitialLocation = async () => {
      // First check for user_pincode and user_area (set by LocationSetupScreen)
      const userPincode = localStorage.getItem('user_pincode');
      const userArea = localStorage.getItem('user_area');

      if (userPincode && userArea) {
        // Create location data from saved pincode and area
        const locationData: LocationData = {
          pincode: userPincode,
          area: userArea,
          district: 'Chennai',
          state: 'Tamil Nadu',
          verified: true,
          timestamp: Date.now(),
          localContent: {
            communityName: `${userArea} Community`,
            localLanguage: 'Tamil',
            culturalElements: ['Local Temple', 'Community Center'],
            nearbyLandmarks: []
          }
        };
        setCurrentLocation(locationData);
        return;
      }

      // Fallback: check for old chennai-app-current-location format
      const savedCurrentLocation = localStorage.getItem('chennai-app-current-location');
      if (savedCurrentLocation) {
        try {
          setCurrentLocation(JSON.parse(savedCurrentLocation));
        } catch (e) {
          console.error('Error parsing saved current location:', e);
        }
      }
    };

    loadInitialLocation();

    // Load previous locations
    const savedPreviousLocations = localStorage.getItem('chennai-app-previous-locations');
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
      // Also save in the format expected by other parts of the app
      localStorage.setItem('user_pincode', currentLocation.pincode);
      localStorage.setItem('user_area', currentLocation.area);
    }
  }, [currentLocation]);

  useEffect(() => {
    localStorage.setItem('chennai-app-previous-locations', JSON.stringify(previousLocations));
  }, [previousLocations]);

  const verifyLocation = async (pincode: string): Promise<LocationData> => {
    setIsVerifying(true);

    try {
      // First, try to validate with Free APIs (India Post + Nominatim)
      const apiResult = await validatePincodeFree(pincode);

      if (apiResult) {
        // Successfully validated - create location data
        const locationData: LocationData = {
          pincode: apiResult.pincode,
          area: apiResult.area || 'Chennai Area',
          district: apiResult.district,
          state: apiResult.state,
          latitude: apiResult.latitude,
          longitude: apiResult.longitude,
          verified: true,
          timestamp: Date.now(),
          localContent: {
            communityName: `${apiResult.area} Neighborhood`,
            localLanguage: 'Tamil',
            culturalElements: ['Local Temple', 'Community Center'],
            nearbyLandmarks: [apiResult.formatted_address]
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

  if (!location) return [];

  return [
    {
      id: 1,
      author: 'Priya Krishnan',
      content: `Looking for a good தையல்காரர் (tailor) near ${location.area}. Any recommendations from neighbors?`,
      likes: 12,
      comments: 8,
      time: '2 hours ago',
      location: location.area,
      tags: ['#Local', '#Recommendations'],
      type: 'help_request',
      isVerified: true,
      image: null
    },
    {
      id: 2,
      author: 'Rajesh Kumar',
      content: `Traffic update: ${location.localContent?.nearbyLandmarks[0]} route is clear this morning. Good time to travel!`,
      likes: 24,
      comments: 5,
      time: '4 hours ago',
      location: location.area,
      tags: ['#Traffic', '#LocalUpdate'],
      type: 'community_event',
      isVerified: true,
      image: null
    },
    {
      id: 3,
      author: 'Meera Devi',
      content: `Organizing a கோலம் (Kolam) competition for our ${location.localContent?.communityName}. Interested ladies please DM!`,
      likes: 18,
      comments: 12,
      time: '6 hours ago',
      location: location.area,
      tags: ['#Culture', '#Community'],
      type: 'cultural_event',
      isVerified: true,
      image: null
    }
  ];
};