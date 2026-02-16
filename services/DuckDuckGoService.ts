import { WeatherData, BusRoute, TrafficData, TempleInfo, NewsItem } from './GroqDataService';

const DDG_API_URL = 'https://api.duckduckgo.com/';

export const DuckDuckGoService = {
    /**
     * Generic fetch from DuckDuckGo Instant Answer API
     */
    async fetchInstantAnswer(query: string): Promise<any> {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            no_html: '1',
            skip_disambig: '1'
        });

        try {
            const response = await fetch(`${DDG_API_URL}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`DDG API Error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('DDG Fetch Error:', error);
            throw error;
        }
    },

    /**
     * Fallback for Weather
     * DDG often returns a weather abstract for major cities
     */
    async getWeather(area: string): Promise<WeatherData> {
        // DDG doesn't provide structured weather data easily via Instant Answer API.
        // We will try to search for "Weather in [Area], Chennai"
        // If no AbstractText, we throw to show error in UI (as per user request "never use mock data")

        const data = await this.fetchInstantAnswer(`weather in ${area} Chennai`);

        if (data.AbstractText) {
            // Very basic parsing attempt, likely to fail for structured needs, 
            // but better than mock data if it works.
            // For now, since we can't reliably parse text to numbers without an LLM,
            // and we can't use mock data, we might have to throw if we can't get structured data.
            // However, let's try to return a "Display Only" version if possible, 
            // but our interfaces are strict (number for temp).

            // If we can't parse, we throw.
            throw new Error("Unable to parse real weather data from fallback.");
        }

        throw new Error("No weather data found in fallback.");
    },

    /**
     * Fallback for Bus Routes
     */
    async getBusRoutes(from: string, to: string): Promise<{ routes: BusRoute[] }> {
        // DDG won't give structured bus routes.
        throw new Error("Real-time bus route data unavailable.");
    },

    /**
     * Fallback for Traffic
     */
    async getTraffic(area: string): Promise<TrafficData> {
        throw new Error("Real-time traffic data unavailable.");
    },

    /**
     * Fallback for Temples
     */
    async getNearbyTemples(area: string): Promise<{ temples: TempleInfo[] }> {
        const data = await this.fetchInstantAnswer(`temples in ${area} Chennai`);

        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            // Map DDG related topics to TempleInfo if possible
            const temples: TempleInfo[] = data.RelatedTopics.map((topic: any) => ({
                name: topic.Text ? topic.Text.split('-')[0].trim() : 'Unknown Temple',
                timings: 'Check local listings', // DDG won't have this
                festivals: [],
                address: topic.FirstURL || 'Address unavailable'
            })).slice(0, 3); // Limit to 3

            if (temples.length > 0) return { temples };
        }

        throw new Error("No temple data found in fallback.");
    },

    /**
     * Fallback for News
     */
    async getLocalNews(area: string): Promise<{ news: NewsItem[] }> {
        // DDG Instant Answer isn't a news API.
        throw new Error("Local news unavailable.");
    }
};
