const BEARER = import.meta.env.VITE_TWITTER_BEARER_TOKEN;

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
