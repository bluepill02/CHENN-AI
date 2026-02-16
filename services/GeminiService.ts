import { GoogleGenerativeAI } from '@google/generative-ai';

const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const GEMINI_API_KEY = getEnv('VITE_GEMINI_API_KEY');
const CACHE_KEY = 'chennai_live_updates_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Initialize Gemini Client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

export interface LiveUpdateResponse {
    text: string;
    source: 'cache' | 'gemini-searxng' | 'gemini-grounding' | 'error';
    timestamp: number;
}

export const GeminiService = {
    /**
     * Get live updates for a specific location in Chennai using Google Grounding
     */
    async getLiveUpdates(location: string = 'Chennai'): Promise<LiveUpdateResponse> {
        // 1. Check Cache
        const cacheKey = `${CACHE_KEY}_${location}`;
        const cachedData = this.getFromCache(cacheKey);
        if (cachedData) {
            console.log(`Serving Live Updates for ${location} from Cache`);
            return cachedData;
        }

        if (!genAI) {
            console.warn('Gemini API Key missing');
            return {
                text: 'Live updates unavailable (API Key missing).',
                source: 'error',
                timestamp: Date.now()
            };
        }

        try {
            console.log(`Fetching live updates for ${location} using Gemini Grounding...`);

            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                tools: [{ googleSearch: {} } as any]
            });

            const prompt = `Find the latest live updates for **${location}, Chennai**, regarding Weather, Traffic, and Breaking News right now. 
            Summarize it into a single Tanglish (Tamil + English) ticker line with emojis. 
            Format: "📢 [Weather] | [Traffic] | [News]"
            Keep it concise and engaging.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            const liveUpdateResponse: LiveUpdateResponse = {
                text: text,
                source: 'gemini-grounding',
                timestamp: Date.now()
            };

            this.saveToCache(cacheKey, liveUpdateResponse);
            return liveUpdateResponse;

        } catch (error) {
            console.error('GeminiService Error:', error);
            return {
                text: 'Unable to fetch live updates at the moment.',
                source: 'error',
                timestamp: Date.now()
            };
        }
    },

    /**
     * General purpose real-time data fetch using Google Grounding
     */
    async getRealTimeData(prompt: string): Promise<string> {
        if (!genAI) return '';

        try {
            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                tools: [{ googleSearch: {} } as any]
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Gemini Grounding Error:', error);
            return '';
        }
    },

    /**
     * Cache Management
     */
    getFromCache(key: string): LiveUpdateResponse | null {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const data: LiveUpdateResponse = JSON.parse(cached);
            const age = Date.now() - data.timestamp;

            if (age < CACHE_DURATION) {
                return data;
            } else {
                localStorage.removeItem(key); // Expired
                return null;
            }
        } catch (e) {
            return null;
        }
    },

    saveToCache(key: string, data: LiveUpdateResponse) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to cache live updates', e);
        }
    }
};
