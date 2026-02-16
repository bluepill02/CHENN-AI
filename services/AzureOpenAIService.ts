const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const AZURE_ENDPOINT = getEnv('VITE_AZURE_OPENAI_ENDPOINT');
const AZURE_API_KEY = getEnv('VITE_AZURE_OPENAI_KEY');
const AZURE_DEPLOYMENT = getEnv('VITE_AZURE_OPENAI_DEPLOYMENT');

export const AzureOpenAIService = {
    async chat(message: string, systemPrompt: string, useWebSearch = false): Promise<string> {
        if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
            throw new Error('Azure OpenAI credentials missing');
        }

        try {
            let enhancedSystemPrompt = systemPrompt;

            // If web search is requested, fetch real-time data first
            if (useWebSearch) {
                try {
                    const { WebSearchService } = await import('./WebSearchService');
                    const searchResults = await WebSearchService.searchChennaiData(message);

                    enhancedSystemPrompt = `${systemPrompt}

WEB SEARCH RESULTS (Use this real-time data):
${searchResults}

INSTRUCTIONS:
- Base your response ONLY on the web search results provided above
- Do not make up or generate information
- If search results are insufficient, clearly state that
- Be accurate with facts, numbers, and dates from the search results`;

                    console.log('Web search completed for Azure OpenAI');
                } catch (error) {
                    console.warn('Web search failed for Azure OpenAI:', error);
                }
            }

            // Construct URL: endpoint + "chat/completions"
            // Note: The user provided endpoint ends with /v1/, so we append chat/completions
            const url = `${AZURE_ENDPOINT}chat/completions`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_API_KEY
                },
                body: JSON.stringify({
                    model: AZURE_DEPLOYMENT,
                    messages: [
                        { role: 'system', content: enhancedSystemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure OpenAI Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Azure OpenAI Service Error:', error);
            throw error;
        }
    },

    /**
     * Chat with JSON response format (for structured data)
     */
    async chatJSON<T>(message: string, systemPrompt: string, useWebSearch = true): Promise<T> {
        if (!AZURE_ENDPOINT || !AZURE_API_KEY || !AZURE_DEPLOYMENT) {
            throw new Error('Azure OpenAI credentials missing');
        }

        try {
            let enhancedSystemPrompt = systemPrompt;

            // Perform web search for real-time data
            if (useWebSearch) {
                try {
                    const { WebSearchService } = await import('./WebSearchService');
                    const searchResults = await WebSearchService.searchChennaiData(message);

                    enhancedSystemPrompt = `${systemPrompt}

WEB SEARCH RESULTS:
${searchResults}

CRITICAL: Extract and structure data from search results into valid JSON format.
Do not generate or make up information.`;

                } catch (error) {
                    console.warn('Web search failed:', error);
                }
            }

            const url = `${AZURE_ENDPOINT}chat/completions`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_API_KEY
                },
                body: JSON.stringify({
                    model: AZURE_DEPLOYMENT,
                    messages: [
                        { role: 'system', content: enhancedSystemPrompt },
                        { role: 'user', content: message }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Azure OpenAI Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Azure OpenAI Service Error:', error);
            throw error;
        }
    }
};
