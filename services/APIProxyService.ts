// API Proxy Service to handle CORS and rate limiting
// This service routes API calls through Vercel serverless functions

export const APIProxyService = {
    /**
     * Proxy Hugging Face requests to avoid CORS
     */
    async proxyHuggingFace(model: string, payload: any): Promise<any> {
        try {
            const response = await fetch('/api/huggingface-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    payload
                })
            });

            if (!response.ok) {
                throw new Error(`Proxy error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Hugging Face proxy error:', error);
            throw error;
        }
    },

    /**
     * Proxy SearXNG requests with caching
     */
    async proxySearXNG(query: string, options: any = {}): Promise<any> {
        try {
            const response = await fetch('/api/searxng-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    options
                })
            });

            if (!response.ok) {
                throw new Error(`SearXNG proxy error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('SearXNG proxy error:', error);
            throw error;
        }
    },

    /**
     * Proxy Azure OpenAI requests
     */
    async proxyAzureOpenAI(messages: any[], options: any = {}): Promise<any> {
        try {
            const response = await fetch('/api/azure-proxy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages,
                    options
                })
            });

            if (!response.ok) {
                throw new Error(`Azure proxy error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Azure proxy error:', error);
            throw error;
        }
    }
};
