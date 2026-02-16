// Web Search Service with SearXNG (primary), SerpAPI, and DuckDuckGo fallback
import { SearXNGService } from './SearXNGService';

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search.json';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    date?: string;
}

export interface WebSearchResponse {
    organic_results: SearchResult[];
    answer_box?: {
        answer?: string;
        snippet?: string;
        title?: string;
    };
    knowledge_graph?: {
        title?: string;
        description?: string;
    };
}

export const WebSearchService = {
    /**
     * Search the web using best available provider
     * Priority: SearXNG (free, privacy-focused) > SerpAPI (paid) > DuckDuckGo (free fallback)
     */
    async search(query: string, options: {
        location?: string;
        num?: number;
    } = {}): Promise<WebSearchResponse> {
        // Try SearXNG first (recommended)
        if (SearXNGService.isEnabled()) {
            try {
                console.log('Attempting search with SearXNG...');
                const searxResults = await SearXNGService.search(query, {
                    language: 'en',
                    safesearch: 0
                });

                // Convert SearXNG format to our format
                const results: SearchResult[] = searxResults.results.slice(0, options.num || 10).map(result => ({
                    title: result.title,
                    link: result.url,
                    snippet: result.content
                }));

                const response: WebSearchResponse = {
                    organic_results: results,
                    answer_box: searxResults.answers && searxResults.answers.length > 0 ? {
                        answer: searxResults.answers[0],
                        snippet: searxResults.answers[0]
                    } : undefined,
                    knowledge_graph: searxResults.infoboxes && searxResults.infoboxes.length > 0 ? {
                        title: searxResults.infoboxes[0].infobox,
                        description: searxResults.infoboxes[0].content
                    } : undefined
                };

                console.log(`SearXNG search successful: ${results.length} results`);
                return response;
            } catch (error) {
                console.warn('SearXNG search failed, trying fallback:', error);
            }
        }

        // Try SerpAPI if available
        if (SERPAPI_KEY) {
            try {
                console.log('Attempting search with SerpAPI...');
                const params = new URLSearchParams({
                    q: query,
                    api_key: SERPAPI_KEY,
                    engine: 'google',
                    num: (options.num || 5).toString(),
                    ...(options.location && { location: options.location })
                });

                const response = await fetch(`${SERPAPI_URL}?${params}`);

                if (!response.ok) {
                    throw new Error(`SerpAPI Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('SerpAPI search successful');
                return data;
            } catch (error) {
                console.warn('SerpAPI search failed, trying DuckDuckGo:', error);
            }
        }

        // Fallback to DuckDuckGo
        console.log('Using DuckDuckGo fallback...');
        return this.fallbackSearch(query);
    },

    /**
     * Fallback search using DuckDuckGo Instant Answer API (free, no key needed)
     */
    async fallbackSearch(query: string): Promise<WebSearchResponse> {
        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                no_html: '1',
                skip_disambig: '1'
            });

            const response = await fetch(`https://api.duckduckgo.com/?${params}`);
            const data = await response.json();

            // Convert DuckDuckGo format to our format
            const results: SearchResult[] = (data.RelatedTopics || [])
                .filter((topic: any) => topic.Text && topic.FirstURL)
                .slice(0, 5)
                .map((topic: any) => ({
                    title: topic.Text.split(' - ')[0] || '',
                    link: topic.FirstURL || '',
                    snippet: topic.Text || ''
                }));

            console.log(`DuckDuckGo fallback: ${results.length} results`);

            return {
                organic_results: results,
                answer_box: data.AbstractText ? {
                    answer: data.AbstractText,
                    snippet: data.AbstractText,
                    title: data.Heading
                } : undefined
            };
        } catch (error) {
            console.error('DuckDuckGo fallback error:', error);
            return { organic_results: [] };
        }
    },

    /**
     * Extract text content from search results
     */
    formatSearchResults(results: WebSearchResponse): string {
        let formatted = '';

        if (results.answer_box?.answer) {
            formatted += `Answer: ${results.answer_box.answer}\n\n`;
        }

        if (results.knowledge_graph?.description) {
            formatted += `Knowledge: ${results.knowledge_graph.description}\n\n`;
        }

        if (results.organic_results && results.organic_results.length > 0) {
            formatted += 'Search Results:\n';
            results.organic_results.forEach((result, index) => {
                formatted += `${index + 1}. ${result.title}\n`;
                formatted += `   ${result.snippet}\n`;
                formatted += `   Source: ${result.link}\n\n`;
            });
        }

        return formatted || 'No search results found.';
    },

    /**
     * Search for Chennai-specific real-time data
     */
    async searchChennaiData(query: string, area?: string): Promise<string> {
        // Use SearXNG's Chennai-specific method if available
        if (SearXNGService.isEnabled()) {
            try {
                const results = await SearXNGService.searchChennai(query, {
                    timeRange: 'day'
                });
                return SearXNGService.formatResults(results);
            } catch (error) {
                console.warn('SearXNG Chennai search failed, using generic search:', error);
            }
        }

        // Fallback to generic search
        const locationQuery = area
            ? `${query} in ${area}, Chennai, India`
            : `${query} in Chennai, India`;

        const results = await this.search(locationQuery, {
            location: 'Chennai, Tamil Nadu, India',
            num: 5
        });

        return this.formatSearchResults(results);
    },

    /**
     * Test all search providers and return status
     */
    async testProviders(): Promise<{
        searxng: { available: boolean; responseTime: number };
        serpapi: { available: boolean };
        duckduckgo: { available: boolean };
    }> {
        const searxngTest = await SearXNGService.testInstance();

        return {
            searxng: {
                available: searxngTest.available,
                responseTime: searxngTest.responseTime
            },
            serpapi: {
                available: !!SERPAPI_KEY
            },
            duckduckgo: {
                available: true // Always available as fallback
            }
        };
    }
};
