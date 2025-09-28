import { ExternalLink, Heart, MessageCircle, RefreshCw, Repeat2, Twitter, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatTweetTime, truncateTweetText, twitterApi, type ChennaiTwitterFeed } from '../services/TwitterApiService';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface TwitterFeedProps {
  pincode?: string;
  category?: 'traffic' | 'weather' | 'events' | 'news' | 'community';
  maxTweets?: number;
  showMetrics?: boolean;
}

interface ApiHealthStatus {
  connected: boolean;
  error?: string;
  usage?: {
    totalRequests: number;
    remainingRequests: number;
    windowReset: number;
    lastUsed: string;
  };
}

export function EnhancedTwitterFeed({ 
  pincode, 
  category = 'community',
  maxTweets = 5,
  showMetrics = true 
}: TwitterFeedProps) {
  const [tweets, setTweets] = useState<ChennaiTwitterFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealthStatus>({ connected: false });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Strategic refresh intervals based on category (free tier optimization)
  const REFRESH_INTERVALS = {
    traffic: 5 * 60 * 1000,    // 5 minutes
    weather: 15 * 60 * 1000,   // 15 minutes  
    community: 10 * 60 * 1000, // 10 minutes
    events: 20 * 60 * 1000,    // 20 minutes
    news: 10 * 60 * 1000       // 10 minutes
  };

  const checkApiHealth = async () => {
    const health = await twitterApi.checkApiHealth();
    setApiHealth(health);
    return health.connected;
  };

  const fetchTweets = async () => {
    setLoading(true);
    setError(null);

    try {
      let fetchedTweets: ChennaiTwitterFeed[] = [];

      switch (category) {
        case 'traffic':
          fetchedTweets = await twitterApi.getChennaiTrafficUpdates();
          break;
        case 'weather':
          fetchedTweets = await twitterApi.getChennaiWeatherUpdates();
          break;
        case 'community':
        default:
          fetchedTweets = await twitterApi.getChennaiCommunityUpdates();
          break;
      }

      setTweets(fetchedTweets.slice(0, maxTweets));
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load tweets. Please check your internet connection.');
      console.error('Twitter fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    
    const performInitialLoad = async () => {
      const isConnected = await checkApiHealth();
      if (isConnected) {
        await fetchTweets();
      }
    };
    
    // Initial load
    performInitialLoad();
    
    // Set up strategic auto-refresh based on category
    if (autoRefresh && apiHealth.connected) {
      const interval = REFRESH_INTERVALS[category] || REFRESH_INTERVALS.community;
      
      refreshTimer = setInterval(async () => {
        // Only auto-refresh if we have API quota remaining
        if (apiHealth.usage && apiHealth.usage.remainingRequests > 5) {
          console.log(`Auto-refreshing ${category} tweets (${apiHealth.usage.remainingRequests} requests remaining)`);
          await fetchTweets();
        } else {
          console.log('Skipping auto-refresh due to rate limit constraints');
          setAutoRefresh(false); // Disable auto-refresh when quota is low
        }
      }, interval);
    }
    
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [category, maxTweets, autoRefresh, apiHealth.connected]);

  const getCategoryIcon = () => {
    switch (category) {
      case 'traffic': return '🚦';
      case 'weather': return '🌤️';
      case 'events': return '🎉';
      case 'news': return '📰';
      default: return '👥';
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'traffic': return 'Traffic Updates';
      case 'weather': return 'Weather Updates';
      case 'events': return 'Local Events';
      case 'news': return 'Chennai News';
      default: return 'Community Feed';
    }
  };

  if (!apiHealth.connected) {
    return (
      <Card className="p-4 border border-yellow-200 bg-yellow-50">
        <div className="flex items-center gap-2 text-yellow-700">
          <Twitter className="w-4 h-4" />
          <div className="flex-1">
            <div className="font-medium">Twitter API Connection Issue</div>
            <div className="text-sm mb-2">
              {apiHealth.error || 'Unable to connect to Twitter API. Please check your configuration.'}
            </div>
            {apiHealth.usage && (
              <div className="text-xs bg-yellow-100 rounded p-2 mb-2">
                <div className="font-medium text-yellow-800 mb-1">API Usage Status:</div>
                <div className="space-y-1">
                  <div>Requests used: {apiHealth.usage.totalRequests}/300</div>
                  <div>Remaining: {apiHealth.usage.remainingRequests}</div>
                  <div>Last used: {apiHealth.usage.lastUsed}</div>
                  <div>Window resets: {new Date(apiHealth.usage.windowReset).toLocaleTimeString()}</div>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={checkApiHealth}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry Connection
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{getCategoryTitle()}</h3>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Twitter className="w-3 h-3" />
              Chennai Community
              {pincode && <Badge variant="secondary" className="text-xs">{pincode}</Badge>}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTweets}
          disabled={loading || (apiHealth.usage && apiHealth.usage.remainingRequests < 5)}
          className="shrink-0"
          title={apiHealth.usage && apiHealth.usage.remainingRequests < 5 ? 
                 'Rate limit low - refresh disabled' : 
                 'Refresh tweets'}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 py-4">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading latest updates...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-red-700 text-sm font-medium mb-1">Unable to load tweets</div>
          <div className="text-red-600 text-xs">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-red-600 border-red-300"
            onClick={fetchTweets}
          >
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Twitter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="text-sm">No recent tweets found</div>
          <div className="text-xs mt-1">Try refreshing or check back later</div>
        </div>
      )}

      {!loading && !error && tweets.length > 0 && (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div 
              key={tweet.id} 
              className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3 mb-2">
                <img 
                  src={tweet.author.profile_image || '/api/placeholder/32/32'} 
                  alt={tweet.author.name}
                  className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-gray-900 text-sm truncate">
                      {tweet.author.name}
                    </span>
                    {tweet.author.verified && <span className="text-blue-500">✓</span>}
                    <span className="text-gray-500 text-xs">@{tweet.author.username}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{formatTweetTime(tweet.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3 ml-11">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {truncateTweetText(tweet.text, 200)}
                </p>
              </div>

              {showMetrics && (
                <div className="flex items-center justify-between ml-11 text-gray-500 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                      <MessageCircle className="w-3 h-3" />
                      <span>{tweet.metrics.replies}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer">
                      <Repeat2 className="w-3 h-3" />
                      <span>{tweet.metrics.retweets}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
                      <Heart className="w-3 h-3" />
                      <span>{tweet.metrics.likes}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{tweets.length} updates</span>
              {apiHealth.usage && (
                <>
                  <span className="mx-1">•</span>
                  <span className={`${apiHealth.usage.remainingRequests < 50 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {apiHealth.usage.remainingRequests} API calls left
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span>Updated {formatTweetTime(lastUpdated.toISOString())}</span>
              )}
              {apiHealth.usage && apiHealth.usage.remainingRequests < 10 && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                  Low quota
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default EnhancedTwitterFeed;