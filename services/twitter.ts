const BEARER = import.meta.env.VITE_TWITTER_BEARER_TOKEN;

export interface NormalizedTweet {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  url: string;
}

export interface TwitterError {
  error: true;
  message: string;
}

export async function getUserId(username: string) {
  const res = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  );
  if (!res.ok) throw new Error(`Failed to resolve user ${username}`);
  const json = await res.json();
  return json?.data?.id as string;
}

export async function fetchTweetsByUserId(userId: string, maxResults = 5) {
  const res = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,text`,
    { headers: { Authorization: `Bearer ${BEARER}` } }
  );
  if (!res.ok) throw new Error(`Failed to fetch tweets for ${userId}`);
  return res.json();
}

export async function fetchTweetsByUsernames(usernames: string[], maxResultsPerUser = 5) {
  const ids = await Promise.all(usernames.map(getUserId));
  const all = await Promise.all(ids.map(id => fetchTweetsByUserId(id, maxResultsPerUser)));
  const merged = all.flatMap(r => r?.data || []);
  return merged.sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Fetch tweets by pincode using Twitter API v2 search endpoint
 * @param pincode - The pincode to search for
 * @param maxResults - Maximum number of tweets to return (default: 10)
 * @returns Array of normalized tweets or error object
 */
export async function fetchTweetsByPincode(pincode: string, maxResults: number = 10): Promise<NormalizedTweet[] | TwitterError> {
  try {
    if (!BEARER) {
      throw new Error('Twitter Bearer token not configured');
    }

    // Search query - looking for tweets mentioning the pincode
    // Could also include hashtags like #Chennai600044 or location-based queries
    const query = encodeURIComponent(`${pincode} OR #${pincode} OR "pincode ${pincode}" OR "Chennai ${pincode}"`);
    
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${maxResults}&tweet.fields=created_at,author_id,public_metrics&user.fields=username,name&expansions=author_id`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${BEARER}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle case when no tweets are found
    if (!data.data || data.data.length === 0) {
      return [];
    }

    // Create user lookup map from includes
    const userMap = new Map();
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        userMap.set(user.id, user);
      });
    }

    // Normalize the tweets
    const normalizedTweets: NormalizedTweet[] = data.data.map((tweet: any) => {
      const author = userMap.get(tweet.author_id);
      const authorName = author ? `@${author.username}` : 'Unknown';
      const authorDisplayName = author?.name || 'Unknown User';
      
      return {
        id: tweet.id,
        text: tweet.text,
        author: `${authorDisplayName} (${authorName})`,
        timestamp: new Date(tweet.created_at).toISOString(),
        url: `https://twitter.com/${author?.username || 'unknown'}/status/${tweet.id}`
      };
    });

    return normalizedTweets;
  } catch (error) {
    console.error('Twitter fetch error:', error);
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Failed to fetch tweets'
    };
  }
}
