// Enhanced Twitter API Service for Chennai Community App
// Optimized for Twitter API v2 Free Tier (300 requests/15min)
// Features intelligent caching, rate limiting, and strategic usage

interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  bearerToken: string;
  accessToken: string;
  accessTokenSecret: string;
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  attachments?: {
    media_keys?: string[];
  };
  geo?: {
    place_id: string;
  };
}

interface TwitterMedia {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RateLimitInfo {
  requestCount: number;
  windowStart: number;
  lastRequest: number;
}

interface ApiUsageStats {
  totalRequests: number;
  remainingRequests: number;
  windowReset: number;
  lastUsed: string;
}

interface ChennaiTwitterFeed {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
    profile_image: string;
    verified: boolean;
  };
  created_at: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  media?: TwitterMedia[];
  location?: string;
  category: 'traffic' | 'weather' | 'events' | 'news' | 'community';
}

class TwitterApiService {
  private config: TwitterConfig;
  private baseUrl = 'https://api.twitter.com/2';
  
  // Free tier limits: 300 requests per 15-minute window
  private readonly RATE_LIMIT = 300;
  private readonly RATE_WINDOW = 15 * 60 * 1000; // 15 minutes in ms
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
  
  // In-memory cache with smart expiration
  private cache = new Map<string, CacheEntry<any>>();
  private rateLimitInfo: RateLimitInfo = {
    requestCount: 0,
    windowStart: Date.now(),
    lastRequest: 0
  };
  
  // Cache durations (in minutes) - strategically set to maximize value
  private readonly CACHE_DURATIONS = {
    community: 10,    // Community posts: 10min cache
    traffic: 5,       // Traffic updates: 5min cache
    weather: 15,      // Weather: 15min cache
    search: 8,        // General search: 8min cache
    user: 30,         // User info: 30min cache
    health: 5         // API health: 5min cache
  };

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_TWITTER_API_KEY || '',
      apiSecret: import.meta.env.VITE_TWITTER_API_SECRET || '',
      bearerToken: import.meta.env.VITE_TWITTER_BEARER_TOKEN || '',
      accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: import.meta.env.VITE_TWITTER_ACCESS_TOKEN_SECRET || '',
    };
  }

  // Rate limiting and API optimization methods
  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Reset window if expired
    if (now - this.rateLimitInfo.windowStart > this.RATE_WINDOW) {
      this.rateLimitInfo.requestCount = 0;
      this.rateLimitInfo.windowStart = now;
    }
    
    // Check if we're hitting the limit
    if (this.rateLimitInfo.requestCount >= this.RATE_LIMIT) {
      console.warn('Twitter API rate limit reached. Please wait for window reset.');
      return false;
    }
    
    // Enforce minimum interval between requests
    const timeSinceLastRequest = now - this.rateLimitInfo.lastRequest;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    return true;
  }
  
  private updateRateLimit(): void {
    this.rateLimitInfo.requestCount++;
    this.rateLimitInfo.lastRequest = Date.now();
  }
  
  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }
  
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  private setCache<T>(key: string, data: T, durationMinutes: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (durationMinutes * 60 * 1000)
    };
    this.cache.set(key, entry);
  }
  
  private async makeApiRequest<T>(
    endpoint: string, 
    params: any = {}, 
    cacheType: keyof typeof this.CACHE_DURATIONS
  ): Promise<T | null> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Try cache first
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${endpoint}`);
      return cached;
    }
    
    // Check rate limit
    if (!(await this.checkRateLimit())) {
      console.warn(`Rate limit exceeded for ${endpoint}`);
      return null;
    }
    
    try {
      const response = await fetch(endpoint, {
        headers: this.getAuthHeaders()
      });
      
      this.updateRateLimit();
      
      if (!response.ok) {
        console.error(`API request failed: ${endpoint}`, response.status);
        return null;
      }
      
      const data = await response.json();
      
      // Cache the result
      this.setCache(cacheKey, data, this.CACHE_DURATIONS[cacheType]);
      
      return data;
    } catch (error) {
      console.error(`Error making API request to ${endpoint}:`, error);
      return null;
    }
  }
  
  // Get current API usage stats for monitoring
  getApiUsageStats(): ApiUsageStats {
    const now = Date.now();
    // Calculate remaining window time
    const windowRemainingMs = this.RATE_WINDOW - (now - this.rateLimitInfo.windowStart);
    
    return {
      totalRequests: this.rateLimitInfo.requestCount,
      remainingRequests: Math.max(0, this.RATE_LIMIT - this.rateLimitInfo.requestCount),
      windowReset: this.rateLimitInfo.windowStart + this.RATE_WINDOW,
      lastUsed: new Date(this.rateLimitInfo.lastRequest).toLocaleTimeString(),
      // Log window remaining time for debugging
      ...(windowRemainingMs > 0 && { debug: `Window resets in ${Math.ceil(windowRemainingMs / 1000)}s` })
    };
  }

  private getAuthHeaders(useBearer = true) {
    if (useBearer) {
      return {
        'Authorization': `Bearer ${this.config.bearerToken}`,
        'Content-Type': 'application/json',
      };
    }
    // For OAuth 1.0a endpoints (if needed)
    return {
      'Authorization': `OAuth oauth_consumer_key="${this.config.apiKey}", oauth_token="${this.config.accessToken}"`,
      'Content-Type': 'application/json',
    };
  }

  // Get user information by username
  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/by/username/${username}?user.fields=id,name,username,profile_image_url,verified,public_metrics`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) {
        console.error(`Failed to fetch user ${username}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      return null;
    }
  }

  // Get tweets by user ID
  async getUserTweets(userId: string, maxResults = 10): Promise<Tweet[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,attachments,geo&expansions=attachments.media_keys&media.fields=type,url,preview_image_url`,
        { headers: this.getAuthHeaders() }
      );

      if (!response.ok) {
        console.error(`Failed to fetch tweets for user ${userId}:`, response.status);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching tweets for user ${userId}:`, error);
      return [];
    }
  }

  // OPTIMIZED: Search for tweets with location filter for Chennai
  // Uses intelligent caching and rate limiting for free tier efficiency
  async searchChennaiTweets(
    query: string,
    maxResults = 10,
    category: 'traffic' | 'weather' | 'events' | 'news' | 'community' = 'community'
  ): Promise<Tweet[]> {
    try {
      // Strategic query optimization for Chennai location
      const locationQueries = [
        'place_country:IN place:"Chennai, Tamil Nadu"',
        'geo:"13.0827,80.2707,50km"', // Chennai coordinates with 50km radius
      ];

      const fullQuery = `${query} (${locationQueries.join(' OR ')}) -is:retweet`;
      const endpoint = `${this.baseUrl}/tweets/search/recent?query=${encodeURIComponent(fullQuery)}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,attachments,geo,context_annotations&expansions=author_id,attachments.media_keys&user.fields=name,username,profile_image_url,verified&media.fields=type,url,preview_image_url`;
      
      // Use optimized API call with caching based on category
      const cacheType = category === 'traffic' ? 'traffic' : 
                       category === 'weather' ? 'weather' : 'search';
      
      const data = await this.makeApiRequest<any>(
        endpoint, 
        { query: fullQuery, maxResults, category }, 
        cacheType
      );
      
      if (!data?.data) {
        console.log(`No tweets found for query: ${query}`);
        return [];
      }
      
      console.log(`Retrieved ${data.data.length} Chennai tweets for category: ${category}`);
      return data.data || [];
    } catch (error) {
      console.error('Error searching tweets:', error);
      return [];
    }
  }

  // OPTIMIZED: Get Chennai-specific traffic updates with single API call
  async getChennaiTrafficUpdates(): Promise<ChennaiTwitterFeed[]> {
    try {
      // Strategic approach: Use single search query combining all traffic keywords
      const trafficQuery = 'traffic OR jam OR "road closure" OR accident OR "signal" OR "metro" OR "bus" OR CMRL OR MTC Chennai';
      
      const tweets = await this.searchChennaiTweets(trafficQuery, 10, 'traffic');
      
      // Transform to ChennaiTwitterFeed format
      const feedTweets: ChennaiTwitterFeed[] = tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: tweet.author_id,
          name: 'Traffic Update',
          username: 'chennai_traffic',
          profile_image: '/api/placeholder/32/32',
          verified: false
        },
        metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          quotes: tweet.public_metrics?.quote_count || 0
        },
        location: 'Chennai',
        category: 'traffic' as const
      }));
      
      console.log(`Retrieved ${feedTweets.length} traffic updates (cached efficiently)`);
      return feedTweets;
    } catch (error) {
      console.error('Error fetching traffic updates:', error);
      return [];
    }
  }

  // OPTIMIZED: Get Chennai weather updates with single efficient call
  async getChennaiWeatherUpdates(): Promise<ChennaiTwitterFeed[]> {
    try {
      // Strategic single query combining all weather keywords
      const weatherQuery = 'weather OR rain OR temperature OR climate OR monsoon OR "hot" OR "cool" OR humidity Chennai';
      
      const tweets = await this.searchChennaiTweets(weatherQuery, 8, 'weather');
      
      // Transform to ChennaiTwitterFeed format
      const feedTweets: ChennaiTwitterFeed[] = tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: tweet.author_id,
          name: 'Weather Update',
          username: 'chennai_weather',
          profile_image: '/api/placeholder/32/32',
          verified: false
        },
        metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          quotes: tweet.public_metrics?.quote_count || 0
        },
        location: 'Chennai',
        category: 'weather' as const
      }));
      
      console.log(`Retrieved ${feedTweets.length} weather updates (cached 15min)`);
      return feedTweets;
    } catch (error) {
      console.error('Error fetching weather updates:', error);
      return [];
    }
  }

  // OPTIMIZED: Get Chennai community events with single strategic call
  async getChennaiCommunityUpdates(): Promise<ChennaiTwitterFeed[]> {
    try {
      // Strategic single query for community content
      const communityQuery = 'events OR community OR festival OR local OR celebration OR "happening" OR cultural Chennai';
      
      const tweets = await this.searchChennaiTweets(communityQuery, 12, 'community');
      
      // Transform to ChennaiTwitterFeed format
      const feedTweets: ChennaiTwitterFeed[] = tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: tweet.author_id,
          name: 'Community Update',
          username: 'chennai_community',
          profile_image: '/api/placeholder/32/32',
          verified: false
        },
        metrics: {
          likes: tweet.public_metrics?.like_count || 0,
          retweets: tweet.public_metrics?.retweet_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          quotes: tweet.public_metrics?.quote_count || 0
        },
        location: 'Chennai',
        category: 'community' as const
      }));
      
      console.log(`Retrieved ${feedTweets.length} community updates (cached 10min)`);
      return feedTweets;
    } catch (error) {
      console.error('Error fetching community updates:', error);
      return [];
    }
  }

  // Post a tweet (requires write permissions)
  async postTweet(text: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
    try {
      // Note: This requires OAuth 1.0a authentication for write operations
      // Implementation would need proper OAuth signing
      console.log('Posting tweet:', text);
      return { success: false, error: 'Write operations require additional authentication setup' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // OPTIMIZED: Health check with caching to avoid unnecessary API calls
  async checkApiHealth(): Promise<{ connected: boolean; error?: string; usage?: ApiUsageStats }> {
    try {
      // Check cache first
      const cacheKey = 'api_health_check';
      const cached = this.getFromCache<{ connected: boolean; error?: string }>(cacheKey);
      
      if (cached) {
        console.log('API health check: using cached result');
        return { 
          ...cached, 
          usage: this.getApiUsageStats() 
        };
      }
      
      // Only make actual API call if not cached and rate limit allows
      if (!(await this.checkRateLimit())) {
        return { 
          connected: false, 
          error: 'Rate limit reached - health check skipped',
          usage: this.getApiUsageStats()
        };
      }
      
      const response = await fetch(
        `${this.baseUrl}/users/by/username/twitter`,
        { headers: this.getAuthHeaders() }
      );
      
      this.updateRateLimit();
      
      const result: { connected: boolean; error?: string } = { connected: response.ok };
      
      if (!response.ok) {
        result.error = `API returned status: ${response.status}`;
      }
      
      // Cache the result
      this.setCache(cacheKey, result, this.CACHE_DURATIONS.health);
      
      return { 
        ...result, 
        usage: this.getApiUsageStats() 
      };
    } catch (error) {
      const result = { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Connection failed',
        usage: this.getApiUsageStats()
      };
      
      // Cache failed results for a shorter time
      this.setCache('api_health_check', { connected: false, error: result.error }, 2);
      
      return result;
    }
  }
}

// Export singleton instance
export const twitterApi = new TwitterApiService();

// Export types for use in components
export type { ChennaiTwitterFeed, Tweet, TwitterMedia, TwitterUser };

// Helper functions for components
export const formatTweetTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export const truncateTweetText = (text: string, maxLength = 140): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};