// Cache utility for Groq data to reduce API calls
const CACHE_DURATION = {
    WEATHER: 30 * 60 * 1000,      // 30 minutes
    BUS: 60 * 60 * 1000,          // 60 minutes
    TRAFFIC: 30 * 60 * 1000,      // 30 minutes
    TEMPLE: 7 * 24 * 60 * 60 * 1000, // 7 days
    NEWS: 4 * 60 * 60 * 1000,     // 4 hours
    EVENTS: 12 * 60 * 60 * 1000,   // 12 hours
    DASHBOARD: 20 * 60 * 1000     // 20 minutes (Batch request)
};

interface CachedData<T> {
    data: T;
    timestamp: number;
    location?: string; // Cache per location
}

export const DataCache = {
    /**
     * Get cached data if valid
     */
    get<T>(key: string, maxAge: number): T | null {
        try {
            const cached = localStorage.getItem(`groq_cache_${key}`);
            if (!cached) return null;

            const { data, timestamp, location }: CachedData<T> = JSON.parse(cached);

            // Check if cache is expired
            if (Date.now() - timestamp > maxAge) {
                this.clear(key);
                return null;
            }

            // Check if location has changed
            const currentLocation = localStorage.getItem('user_area');
            if (location && location !== currentLocation) {
                this.clear(key);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    },

    /**
     * Set cached data
     */
    set<T>(key: string, data: T): void {
        try {
            const currentLocation = localStorage.getItem('user_area');
            const cached: CachedData<T> = {
                data,
                timestamp: Date.now(),
                location: currentLocation || undefined
            };
            localStorage.setItem(`groq_cache_${key}`, JSON.stringify(cached));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    },

    /**
     * Clear specific cache
     */
    clear(key: string): void {
        localStorage.removeItem(`groq_cache_${key}`);
    },

    /**
     * Clear all Groq caches
     */
    clearAll(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('groq_cache_')) {
                localStorage.removeItem(key);
            }
        });
    },

    /**
     * Clear caches when location changes
     */
    clearLocationCaches(): void {
        this.clearAll();
    }
};

// Export cache durations for use in components
export { CACHE_DURATION };
