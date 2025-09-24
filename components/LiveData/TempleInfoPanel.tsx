import { AlertCircle, Clock, MapPin, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../services/LanguageService';

export interface TempleInfo {
  name: string;
  address: string;
  distance: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface TempleInfoPanelProps {
  lat?: number;
  lng?: number;
  className?: string;
}

interface TempleApiResponse {
  status: string;
  results?: Array<{
    placeName: string;
    address: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
  }>;
  error?: string;
}

const TempleInfoPanel: React.FC<TempleInfoPanelProps> = ({
  lat = 13.0827, // Chennai default latitude
  lng = 80.2707, // Chennai default longitude
  className = ""
}) => {
  const [temples, setTemples] = useState<TempleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { language } = useLanguage();

  // Temple translations
  const translations = {
    title: {
      en: 'Nearby Temples',
      ta: 'அருகிலுள்ள கோவில்கள்'
    },
    loading: {
      en: 'Finding temples...',
      ta: 'கோவில்களை தேடுகிறோம்...'
    },
    error: {
      en: 'Unable to load temple information',
      ta: 'கோவில் தகவலை ஏற்ற முடியவில்லை'
    },
    retry: {
      en: 'Try Again',
      ta: 'மீண்டும் முயற்சி'
    },
    noTemples: {
      en: 'No temples found nearby',
      ta: 'அருகில் கோவில்கள் எதுவும் இல்லை'
    },
    distance: {
      en: 'away',
      ta: 'தூரம்'
    },
    lastUpdated: {
      en: 'Updated',
      ta: 'புதுப்பிக்கப்பட்டது'
    }
  };

  const t = (key: keyof typeof translations) => 
    translations[key][language as keyof typeof translations[typeof key]];

  // Fetch temple data from Mappls Places API
  const fetchTempleData = async (): Promise<TempleInfo[]> => {
    const MAPPLS_API_KEY = import.meta.env.VITE_MAPPLS_API_KEY;
    
    if (!MAPPLS_API_KEY) {
      throw new Error('Mappls API key not configured');
    }

    try {
      const response = await fetch(
        `https://atlas.mappls.com/api/places/nearby/json?keywords=temple&refLocation=${lat},${lng}`,
        {
          headers: {
            'Authorization': `Bearer ${MAPPLS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Mappls API error: ${response.status} ${response.statusText}`);
      }

      const data: TempleApiResponse = await response.json();
      
      if (data.status !== 'success' || !data.results) {
        throw new Error(data.error || 'No temple data available');
      }

      // Normalize the response
      return data.results.slice(0, 5).map((temple) => ({
        name: temple.placeName || 'Unknown Temple',
        address: temple.address || 'Address not available',
        distance: temple.distance 
          ? `${(temple.distance / 1000).toFixed(1)} km` 
          : 'Distance unknown',
        location: temple.latitude && temple.longitude 
          ? { lat: temple.latitude, lng: temple.longitude }
          : undefined
      }));
    } catch (error) {
      console.error('Temple data fetch error:', error);
      throw error;
    }
  };

  // Generate fallback temple data for Chennai
  const generateFallbackTemples = (): TempleInfo[] => {
    const fallbackTemples = [
      {
        name: 'Kapaleeshwarar Temple',
        address: 'Mylapore, Chennai',
        distance: '2.5 km'
      },
      {
        name: 'Parthasarathy Temple',
        address: 'Triplicane, Chennai', 
        distance: '3.1 km'
      },
      {
        name: 'Vadapalani Murugan Temple',
        address: 'Vadapalani, Chennai',
        distance: '4.2 km'
      },
      {
        name: 'Marundeeswarar Temple',
        address: 'Thiruvanmiyur, Chennai',
        distance: '5.8 km'
      },
      {
        name: 'Mundakakanni Amman Temple',
        address: 'Mylapore, Chennai',
        distance: '2.8 km'
      }
    ];

    return fallbackTemples;
  };

  const loadTempleData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const templeData = await fetchTempleData();
      setTemples(templeData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch temple data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load temple data');
      // Use fallback data
      setTemples(generateFallbackTemples());
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTempleData();
  }, [lat, lng]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return language === 'ta' ? 'இப்போது' : 'just now';
    if (diffInMinutes < 60) return language === 'ta' ? `${diffInMinutes} நிமிடங்கள் முன்` : `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    return language === 'ta' ? `${diffInHours} மணி நேரம் முன்` : `${diffInHours}h ago`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h3>
        </div>
        
        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{t('lastUpdated')} {formatTimeAgo(lastUpdate)}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{t('loading')}</span>
          </div>
        </div>
      ) : error && temples.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 mb-4">{t('error')}</p>
          <button
            onClick={loadTempleData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {t('retry')}
          </button>
        </div>
      ) : temples.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">{t('noTemples')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {temples.map((temple, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                  {temple.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {temple.address}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">
                    {temple.distance} {t('distance')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {error && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {language === 'ta' 
                  ? 'API இணைப்பில் சிக்கல், மாதிரி தரவு காட்டப்படுகிறது'
                  : 'Using fallback data due to API connection issues'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TempleInfoPanel;