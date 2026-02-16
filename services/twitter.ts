export interface Tweet {
    id: string;
    text: string;
    created_at: string;
    author_id: string;
    username: string;
}

export async function fetchTweetsByUsernames(usernames: string[], count: number = 5): Promise<Tweet[]> {
    // Mock implementation since we don't have real Twitter API access yet
    console.log(`Fetching tweets for: ${usernames.join(', ')}`);

    return usernames.slice(0, count).map((username, index) => ({
        id: `tweet-${Date.now()}-${index}`,
        text: `Latest update from @${username}: Traffic is moving slowly on OMR due to metro construction. Please plan your commute accordingly. #ChennaiTraffic`,
        created_at: new Date().toISOString(),
        author_id: `user-${index}`,
        username: username
    }));
}
