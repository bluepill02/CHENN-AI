import { AlertCircle, Clock, ExternalLink, RefreshCw, Twitter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../services/LanguageService';
import { fetchTweetsByPincode, NormalizedTweet } from '../../services/twitter';

export interface PincodeTwitterCardProps {
  /** Required pincode to filter tweets by location */
  pincode: string;
  /** Optional CSS class for styling */
  className?: string;
}

/**
 * PincodeTwitterCard - Display Twitter/X alerts filtered by user pincode
 * 
 * Features:
 * - Fetches tweets tagged with specific pincode or location hashtags
 * - Bilingual support (English/Tamil)
 * - Loading states and error handling
 * - Accessible design with ARIA labels
 * - Links to original tweets
 * - Auto-refresh functionality
 */
const PincodeTwitterCard: React.FC<PincodeTwitterCardProps> = ({
  pincode,
  className = ""
}) => {
  // State management
  const [tweets, setTweets] = useState<NormalizedTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Language support
  const { language } = useLanguage();

  // Translations for bilingual support
  const translations = {
    title: {
      en: 'Local Alerts',
      ta: 'உள்ளூர் எச்சரிக்கைகள்'
    },
    pincode: {
      en: 'Area',
      ta: 'பகுதி'
    },
    loading: {
      en: 'Loading tweets...',
      ta: 'ட்வீட்களை ஏற்றுகிறது...'
    },
    error: {
      en: 'Failed to load alerts',
      ta: 'எச்சரிக்கைகளை ஏற்ற முடியவில்லை'
    },
    retry: {
      en: 'Try Again',
      ta: 'மீண்டும் முயற்சி'
    },
    noAlerts: {
      en: 'No alerts for this area',
      ta: 'இந்த பகுதிக்கு எச்சரிக்கைகள் இல்லை'
    },
    viewTweet: {
      en: 'View original tweet',
      ta: 'அசல் ட்வீட்டை பார்க்க'
    },
    refresh: {
      en: 'Refresh alerts',
      ta: 'எச்சரிக்கைகளை புதுப்பிக்க'
    },
    lastUpdated: {
      en: 'Last updated',
      ta: 'கடைசியாக புதுப்பிக்கப்பட்டது'
    },
    trustedNote: {
      en: 'Showing recent posts mentioning this area',
      ta: 'இந்த பகுதியை குறிப்பிடும் சமீபத்திய பதிவுகள்'
    }
  };

  const t = (key: keyof typeof translations) => 
    translations[key][language as keyof typeof translations[typeof key]];

  /**
   * Load tweets for the specified pincode
   */
  const loadTweets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTweetsByPincode(pincode, 5);
      
      if ('error' in result) {
        setError(result.message);
        setTweets([]);
      } else {
        setTweets(result);
        setError(null);
      }
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to load tweets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setTweets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tweets when component mounts or pincode changes
  useEffect(() => {
    loadTweets();
  }, [pincode]);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return language === 'ta' ? 'இப்போது' : 'just now';
    if (diffInMinutes < 60) return language === 'ta' ? `${diffInMinutes} நிமிடங்கள் முன்` : `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return language === 'ta' ? `${diffInHours} மணி நேரம் முன்` : `${diffInHours}h ago`;
    
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN');
  };

  /**
   * Format last update time
   */
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return language === 'ta' ? 'இப்போது' : 'just now';
    if (diffInMinutes < 60) return language === 'ta' ? `${diffInMinutes} நிமிடங்கள் முன்` : `${diffInMinutes}m ago`;
    
    return date.toLocaleTimeString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-blue-200 dark:border-blue-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Twitter className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('title')}
          </h3>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
            {pincode}
          </span>
        </div>

        <button
          onClick={loadTweets}
          disabled={isLoading}
          aria-label={t('refresh')}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Last update info */}
      {lastUpdate && !isLoading && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Clock className="w-3 h-3" />
          <span>{t('lastUpdated')} {formatLastUpdate(lastUpdate)}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>{t('loading')}</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 mb-4">{t('error')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadTweets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            {t('retry')}
          </button>
        </div>
      )}

      {/* No tweets found */}
      {!isLoading && !error && tweets.length === 0 && (
        <div className="text-center py-8">
          <Twitter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">{t('noAlerts')}</p>
        </div>
      )}

      {/* Tweets list */}
      {!isLoading && !error && tweets.length > 0 && (
        <div
          className="space-y-4"
          role="list"
          aria-label={`${t('title')} for ${t('pincode')} ${pincode}`}
        >
          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              role="listitem"
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {/* Tweet content */}
              <div className="mb-2">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {tweet.text}
                </p>
              </div>

              {/* Tweet metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tweet.author}</span>
                  <span>•</span>
                  <span>{formatTimestamp(tweet.timestamp)}</span>
                </div>

                <a
                  href={tweet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('viewTweet')} by ${tweet.author}`}
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="sr-only">{t('viewTweet')}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      {!isLoading && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('trustedNote')}
          </p>
        </div>
      )}
    </div>
  );
};

export default PincodeTwitterCard;