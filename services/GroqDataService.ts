const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqDataRequest {
    query: string;
    location?: {
        area: string;
        pincode: string;
    };
}

export interface WeatherData {
    temp: number;
    condition: string;
    humidity: number;
    aqi: number;
    forecast?: string;
}

export interface BusRoute {
    number: string;
    frequency: string;
    duration: string;
    stops?: string[];
}

export interface TrafficData {
    level: 'low' | 'medium' | 'high';
    roads: Array<{ name: string; status: string }>;
}

export interface TempleInfo {
    name: string;
    timings: string;
    festivals: Array<{ name: string; date: string }>;
    address: string;
}

export interface NewsItem {
    title: string;
    summary: string;
    source: string;
    time: string;
}

export interface DashboardData {
    weather: WeatherData;
    traffic: TrafficData;
    busRoutes: { routes: BusRoute[] };
    temples: { temples: TempleInfo[] };
    news: { news: NewsItem[] };
}

export const GroqDataService = {
    /**
     * Get user's location from localStorage
     */
    getUserLocation(): { area: string; pincode: string } | undefined {
        const area = localStorage.getItem('user_area');
        const pincode = localStorage.getItem('user_pincode');

        if (!area || !pincode) return undefined;

        return { area, pincode };
    },

    /**
     * Get weather for user's location using Groq's native web search
     */
    async getWeather(): Promise<WeatherData> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<WeatherData>({
            query: `Get CURRENT weather in ${area}, Chennai, India RIGHT NOW. 
              Include: temperature in celsius, condition, humidity percentage, 
              AQI (Air Quality Index), and brief forecast for next 6 hours.
              Return as JSON with keys: temp, condition, humidity, aqi, forecast`,
            location
        });
    },

    /**
     * Get bus routes from user's area
     */
    async getBusRoutes(destination: string): Promise<{ routes: BusRoute[] }> {
        const location = this.getUserLocation();
        const from = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<{ routes: BusRoute[] }>({
            query: `Search for CURRENT MTC bus routes from ${from} to ${destination} in Chennai.
              Include route numbers, frequency (how often buses run), 
              and approximate travel time.
              Return as JSON: { routes: [{ number, frequency, duration }] }`,
            location
        });
    },

    /**
     * Get nearby bus routes for user's area
     */
    async getNearbyBusRoutes(): Promise<{ routes: BusRoute[] }> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<{ routes: BusRoute[] }>({
            query: `Search for major MTC bus routes that pass through or near ${area}, Chennai.
              Include route numbers, main destinations, and frequency.
              Return as JSON: { routes: [{ number, frequency, duration }] }`,
            location
        });
    },

    /**
     * Get traffic conditions for user's area
     */
    async getTraffic(): Promise<TrafficData> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<TrafficData>({
            query: `Search for CURRENT traffic conditions in and around ${area}, Chennai RIGHT NOW.
              Include overall congestion level (low/medium/high) and 
              status of major nearby roads.
              Return as JSON: { level, roads: [{ name, status }] }`,
            location
        });
    },

    /**
     * Get nearby temples for user's area
     */
    async getNearbyTemples(): Promise<{ temples: TempleInfo[] }> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<{ temples: TempleInfo[] }>({
            query: `Search for famous temples near ${area}, Chennai.
              Include temple names, timings, upcoming festivals, and addresses.
              Return as JSON: { temples: [{ name, timings, festivals: [{ name, date }], address }] }`,
            location
        });
    },

    /**
     * Get specific temple info
     */
    async getTempleInfo(templeName: string): Promise<TempleInfo> {
        const location = this.getUserLocation();

        return this.fetchStructuredDataWithWebSearch<TempleInfo>({
            query: `Search for information about ${templeName} temple in Chennai.
              Include timings, upcoming festivals, and address.
              Return as JSON: { name, timings, festivals: [{ name, date }], address }`,
            location
        });
    },

    /**
     * Get local news for user's area
     */
    async getLocalNews(category = 'general'): Promise<{ news: NewsItem[] }> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch<{ news: NewsItem[] }>({
            query: `Search for latest ${category} news from ${area} and Chennai TODAY.
              Focus on local news relevant to ${area} area.
              Return top 5 as JSON: { news: [{ title, summary, source, time }] }`,
            location
        });
    },

    /**
     * Get local events for user's area
     */
    async getLocalEvents(): Promise<{ events: Array<{ name: string; date: string; location: string; description: string }> }> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch({
            query: `Search for upcoming events, festivals, and community activities in ${area}, Chennai.
              Include cultural events, temple festivals, and local gatherings.
              Return as JSON: { events: [{ name, date, location, description }] }`,
            location
        });
    },

    /**
     * Get nearby services (hospitals, police, etc.)
     */
    async getNearbyServices(serviceType: string): Promise<{ services: Array<{ name: string; address: string; phone: string; distance: string }> }> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        return this.fetchStructuredDataWithWebSearch({
            query: `Search for ${serviceType} near ${area}, Chennai.
              Include name, address, contact number, and approximate distance.
              Return as JSON: { services: [{ name, address, phone, distance }] }`,
            location
        });
    },

    /**
     * Fetch all dashboard data in a single batch request
     */
    async getDashboardData(): Promise<DashboardData> {
        const location = this.getUserLocation();
        const area = location?.area || 'Chennai';

        const query = `
            Search the web for current live data in ${area}, Chennai RIGHT NOW.
            Return a single JSON object with the following structure:
            {
                "weather": {
                    "temp": number (celsius),
                    "condition": string,
                    "humidity": number,
                    "aqi": number,
                    "forecast": string
                },
                "traffic": {
                    "level": "low" | "medium" | "high",
                    "roads": [{ "name": string, "status": string }] (top 3 major roads nearby)
                },
                "busRoutes": {
                    "routes": [{ "number": string, "frequency": string, "duration": string }] (top 3 routes passing through ${area})
                },
                "temples": {
                    "temples": [{ "name": string, "timings": string, "festivals": [{ "name": string, "date": string }], "address": string }] (top 2 famous temples nearby)
                },
                "news": {
                    "news": [{ "title": string, "summary": string, "source": string, "time": string }] (top 3 latest local news items)
                }
            }
            CRITICAL: Use real-time web search data. Do not make up information.
        `;

        return this.fetchStructuredDataWithWebSearch<DashboardData>({
            query,
            location
        });
    },

    /**
     * Fetch structured data using Groq's NATIVE web search capability
     * Uses groq/compound model which has built-in web search
     */
    async fetchStructuredDataWithWebSearch<T>(request: GroqDataRequest): Promise<T> {
        if (!GROQ_API_KEY) {
            throw new Error('Groq API Key is missing');
        }

        const location = request.location || this.getUserLocation();
        const locationContext = location
            ? `User is in ${location.area}, Chennai (Pincode: ${location.pincode}). `
            : 'User is in Chennai. ';

        // Models with native web search support
        const WEB_SEARCH_MODELS = [
            'llama-3.3-70b-versatile',  // Primary model with web search
            'llama-3.1-70b-versatile',  // Fallback
        ];

        let lastError;

        for (const model of WEB_SEARCH_MODELS) {
            try {
                console.log(`Attempting Groq web search with model: ${model}`);

                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{
                            role: 'system',
                            content: `You are a Chennai data assistant with web search capabilities. ${locationContext}
          
          INSTRUCTIONS:
          1. Use your web search capability to find current, real-time information
          2. Search the web for the requested data
          3. Extract accurate information from search results
          4. Structure the data into the requested JSON format
          5. Include sources when available
          6. If no current data is found, clearly indicate that in the response`
                        }, {
                            role: 'user',
                            content: request.query
                        }],
                        response_format: { type: 'json_object' },
                        temperature: 0.1,
                        max_tokens: 2000,
                        // Enable web search (if supported by model)
                        tools: [{
                            type: 'web_search'
                        }]
                    })
                });

                if (response.status === 429) {
                    throw new Error(`Rate Limit (429) on ${model}`);
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Groq API Error on ${model}: ${response.statusText} - ${errorText}`);
                }

                const data = await response.json();
                const result = JSON.parse(data.choices[0].message.content);

                if (result.error) {
                    throw new Error(result.error);
                }

                console.log(`Success with Groq web search using model: ${model}`);
                return result;

            } catch (error: any) {
                console.warn(`Failed with model ${model}:`, error.message);
                lastError = error;
                continue;
            }
        }

        // If native web search fails, fall back to our custom implementation
        console.warn('Groq native web search failed, falling back to custom implementation');
        return this.fetchStructuredDataWithCustomSearch<T>(request);
    },

    /**
     * Fallback: Custom web search implementation
     */
    async fetchStructuredDataWithCustomSearch<T>(request: GroqDataRequest): Promise<T> {
        const location = request.location || this.getUserLocation();
        const locationContext = location
            ? `User is in ${location.area}, Chennai (Pincode: ${location.pincode}). `
            : 'User is in Chennai. ';

        // Perform web search first
        let searchContext = '';
        try {
            const { WebSearchService } = await import('./WebSearchService');
            const searchResults = await WebSearchService.searchChennaiData(
                request.query,
                location?.area
            );
            searchContext = `\n\nWEB SEARCH RESULTS:\n${searchResults}\n\n`;
            console.log('Custom web search completed successfully');
        } catch (error) {
            console.warn('Custom web search failed:', error);
        }

        const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];
        let lastError;

        for (const model of MODELS) {
            try {
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{
                            role: 'system',
                            content: `You are a Chennai data assistant. ${locationContext}
          
          CRITICAL: Use ONLY the information from the WEB SEARCH RESULTS below.
          Extract and structure the data into the requested JSON format.
          ${searchContext}`
                        }, {
                            role: 'user',
                            content: request.query
                        }],
                        response_format: { type: 'json_object' },
                        temperature: 0.1,
                        max_tokens: 2000
                    })
                });

                if (!response.ok) continue;

                const data = await response.json();
                return JSON.parse(data.choices[0].message.content);

            } catch (error: any) {
                lastError = error;
                continue;
            }
        }

        throw lastError || new Error('All Groq models failed');
    }
};
