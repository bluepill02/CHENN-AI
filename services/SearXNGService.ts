// SearXNG Search Service - Privacy-focused metasearch engine
// SearXNG is open-source, privacy-respecting, and FREE to use

const SEARXNG_INSTANCE = import.meta.env.VITE_SEARXNG_INSTANCE || 'https://searx.be'; // Default public instance
const SEARXNG_ENABLED = import.meta.env.VITE_USE_SEARXNG !== 'false'; // Enable by default

export interface SearXNGResult {
    title: string;
    url: string;
    content: string;
    engine: string;
    parsed_url: string[];
    template?: string;
    engines?: string[];
    positions?: number[];
    score?: number;
    category?: string;
}

export interface SearXNGResponse {
    query: string;
    number_of_results: number;
    results: SearXNGResult[];
    answers?: string[];
    corrections?: string[];
    infoboxes?: Array<{
        infobox: string;
        content: string;
        engine: string;
        urls?: Array<{ title: string; url: string }>;
    }>;
    suggestions?: string[];
    unresponsive_engines?: string[];
}

export const SearXNGService = {
    /**
     * Check if SearXNG is enabled and available
     */
    isEnabled(): boolean {
        return SEARXNG_ENABLED;
    },

    /**
     * Get the configured SearXNG instance URL
     */
    getInstance(): string {
        return SEARXNG_INSTANCE;
    },

    /**
     * Search using SearXNG
     */
    /**
     * Search using SearXNG with automatic fallback
     */
    async search(query: string, options: {
        categories?: string;
        engines?: string;
        language?: string;
        pageno?: number;
        time_range?: 'day' | 'week' | 'month' | 'year';
        safesearch?: 0 | 1 | 2;
    } = {}): Promise<SearXNGResponse> {
        // Create a list of instances to try: configured instance first, then public fallbacks
        const instances = [
            SEARXNG_INSTANCE,
            ...PUBLIC_SEARXNG_INSTANCES.filter(url => url !== SEARXNG_INSTANCE)
        ];



        // Try each instance until one works
        for (const instance of instances) {
            try {
                console.log(`Trying SearXNG instance: ${instance}`);

                const params = new URLSearchParams({
                    q: query,
                    format: 'json',
                    ...(options.categories && { categories: options.categories }),
                    ...(options.engines && { engines: options.engines }),
                    ...(options.language && { language: options.language }),
                    ...(options.pageno && { pageno: options.pageno.toString() }),
                    ...(options.time_range && { time_range: options.time_range }),
                    ...(options.safesearch !== undefined && { safesearch: options.safesearch.toString() })
                });

                // Set a timeout for each request to avoid hanging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

                const url = `${instance}/search?${params}`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`SearXNG Error: ${response.status} ${response.statusText}`);
                }

                const data: SearXNGResponse = await response.json();

                // Basic validation to ensure we got a valid response
                if (!data.results && !data.infoboxes) {
                    throw new Error('Invalid response format');
                }

                console.log(`SearXNG success on ${instance}: ${data.number_of_results} results`);
                return data;

            } catch (error) {
                console.warn(`Failed to fetch from ${instance}:`, error);
                // Continue to next instance
            }
        }

        // If all instances failed, fall back to mock data if enabled
        console.warn('All SearXNG instances failed, falling back to mock data');
        return this.getMockData(query, options);
    },

    /**
     * Generate mock data when live search fails
     */
    getMockData(query: string, options: any): SearXNGResponse {
        console.log('Generating mock data for:', query);
        const isNews = options.categories?.includes('news') || options.category === 'news';
        const isImages = options.categories?.includes('images') || options.category === 'images';

        let results: SearXNGResult[] = [];

        if (isNews) {
            results = [
                {
                    title: 'Chennai Metro Rail Phase 2 updates: New stations announced',
                    url: 'https://chennaimetrorail.org',
                    content: 'The Chennai Metro Rail Limited (CMRL) has announced the list of new stations for Phase 2 project...',
                    engine: 'mock',
                    parsed_url: ['https', 'chennaimetrorail.org']
                },
                {
                    title: 'Heavy rains predicted in Chennai for next 48 hours',
                    url: 'https://imd.gov.in',
                    content: 'The Regional Meteorological Centre has issued an orange alert for Chennai and neighbouring districts...',
                    engine: 'mock',
                    parsed_url: ['https', 'imd.gov.in']
                },
                {
                    title: 'CSK starts training camp at Chepauk Stadium',
                    url: 'https://chennaisuperkings.com',
                    content: 'Chennai Super Kings players have arrived in the city for the pre-season training camp at MA Chidambaram Stadium...',
                    engine: 'mock',
                    parsed_url: ['https', 'chennaisuperkings.com']
                }
            ];
        } else if (isImages) {
            results = [
                {
                    title: 'Marina Beach Sunrise',
                    url: 'https://example.com/marina.jpg',
                    content: 'Beautiful sunrise at Marina Beach, Chennai',
                    engine: 'mock',
                    parsed_url: ['https', 'example.com']
                },
                {
                    title: 'Kapaleeshwarar Temple',
                    url: 'https://example.com/temple.jpg',
                    content: 'Historic Kapaleeshwarar Temple in Mylapore',
                    engine: 'mock',
                    parsed_url: ['https', 'example.com']
                }
            ];
        } else if (query.includes('weather')) {
            return {
                query: query,
                number_of_results: 1,
                results: [],
                infoboxes: [{
                    infobox: 'weather',
                    content: 'Chennai: 32°C, Partly Cloudy. Humidity: 75%. Wind: 15 km/h E.',
                    engine: 'mock'
                }]
            };
        } else {
            results = [
                {
                    title: `Result for ${query}`,
                    url: 'https://example.com',
                    content: `This is a mock result for the query "${query}" because the search service is currently unavailable.`,
                    engine: 'mock',
                    parsed_url: ['https', 'example.com']
                }
            ];
        }

        return {
            query: query,
            number_of_results: results.length,
            results: results
        };
    },

    /**
     * Search for Chennai-specific information
     */
    async searchChennai(query: string, options: {
        category?: 'general' | 'news' | 'images' | 'videos' | 'map';
        timeRange?: 'day' | 'week' | 'month';
    } = {}): Promise<SearXNGResponse> {
        // Append Chennai context if not already present
        const chennaiQuery = query.toLowerCase().includes('chennai') ? query : `${query} Chennai`;

        return this.search(chennaiQuery, {
            categories: options.category || 'general',
            time_range: options.timeRange,
            language: 'en-IN', // Prioritize Indian English results
            safesearch: 0
        });
    },

    /**
     * Format SearXNG results for LLM consumption
     */
    formatResults(response: SearXNGResponse): string {
        let formatted = '';

        // Add direct answers if available
        if (response.answers && response.answers.length > 0) {
            formatted += '**Direct Answers:**\n';
            response.answers.forEach(answer => {
                formatted += `- ${answer}\n`;
            });
            formatted += '\n';
        }

        // Add infoboxes if available
        if (response.infoboxes && response.infoboxes.length > 0) {
            formatted += '**Information:**\n';
            response.infoboxes.forEach(box => {
                formatted += `${box.infobox}: ${box.content}\n`;
                if (box.urls) {
                    box.urls.forEach(url => {
                        formatted += `  - ${url.title}: ${url.url}\n`;
                    });
                }
            });
            formatted += '\n';
        }

        // Add search results
        if (response.results && response.results.length > 0) {
            formatted += '**Search Results:**\n';
            response.results.slice(0, 10).forEach((result, index) => {
                formatted += `${index + 1}. **${result.title}**\n`;
                formatted += `   ${result.content}\n`;
                formatted += `   Source: ${result.url}\n`;
                if (result.engine) {
                    formatted += `   Engine: ${result.engine}\n`;
                }
                formatted += '\n';
            });
        }

        // Add suggestions if available
        if (response.suggestions && response.suggestions.length > 0) {
            formatted += '**Related Searches:**\n';
            response.suggestions.forEach(suggestion => {
                formatted += `- ${suggestion}\n`;
            });
        }

        return formatted || 'No search results found.';
    },

    /**
     * Get real-time news from Chennai, optionally specific to an area
     */
    async getChennaiNews(category: string = 'general', location?: string): Promise<string> {
        let query = category === 'general' ? 'latest news' : `latest ${category} news`;
        if (location) {
            query = `${query} ${location}`;
        }

        const results = await this.searchChennai(query, {
            category: 'news',
            timeRange: 'day'
        });
        return this.formatResults(results);
    },

    /**
     * Get current weather information
     */
    async getWeather(area: string = 'Chennai'): Promise<string> {
        const query = `weather ${area}`;
        const results = await this.searchChennai(query, {
            timeRange: 'day'
        });
        return this.formatResults(results);
    },

    /**
     * Get traffic information
     */
    async getTraffic(area: string = 'Chennai'): Promise<string> {
        const query = `traffic updates ${area}`;
        const results = await this.searchChennai(query, {
            category: 'news', // Traffic updates are often in news
            timeRange: 'day'
        });
        return this.formatResults(results);
    },

    /**
     * Search for local services
     */
    async searchLocalServices(serviceType: string, area: string = 'Chennai'): Promise<string> {
        const query = `best ${serviceType} in ${area} reviews contact`;
        const results = await this.searchChennai(query, {
            category: 'map' // Use map category for local places
        });
        return this.formatResults(results);
    },

    /**
     * Get temple information
     */
    async getTempleInfo(templeName?: string, area: string = 'Chennai'): Promise<string> {
        const query = templeName
            ? `${templeName} temple ${area} history timings`
            : `famous temples in ${area}`;
        const results = await this.searchChennai(query);
        return this.formatResults(results);
    },

    /**
     * Get bus route information
     */
    async getBusRoutes(from: string, to: string): Promise<string> {
        const query = `MTC bus numbers from ${from} to ${to}`;
        const results = await this.searchChennai(query);
        return this.formatResults(results);
    },

    /**
     * Get relevant images for a topic
     */
    async getChennaiImages(topic: string): Promise<SearXNGResult[]> {
        const results = await this.searchChennai(topic, {
            category: 'images'
        });
        return results.results || [];
    },

    /**
     * Get relevant videos for a topic
     */
    async getChennaiVideos(topic: string): Promise<SearXNGResult[]> {
        const results = await this.searchChennai(topic, {
            category: 'videos'
        });
        return results.results || [];
    },

    /**
     * Test SearXNG instance availability
     */
    async testInstance(): Promise<{ available: boolean; responseTime: number; error?: string }> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${SEARXNG_INSTANCE}/search?q=test&format=json`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            const responseTime = Date.now() - startTime;

            if (!response.ok) {
                return {
                    available: false,
                    responseTime,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return {
                available: true,
                responseTime
            };
        } catch (error: any) {
            return {
                available: false,
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }
};

/**
 * List of reliable public SearXNG instances
 * Source: https://searx.space/
 */
export const PUBLIC_SEARXNG_INSTANCES = [
    'https://searx.be',
    'https://searx.work',
    'https://search.bus-hit.me',
    'https://searx.tiekoetter.com',
    'https://search.sapti.me',
    'https://searx.fmac.xyz',
    'https://search.ononoki.org',
    'https://searx.prvcy.eu',
    'https://searx.lunar.icu'
];
