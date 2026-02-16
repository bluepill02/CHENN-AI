const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const HF_API_KEY = getEnv('VITE_HUGGING_FACE_API_KEY');

// Tool-use optimized models (recommended)
const HF_TOOL_USE_MODELS = {
    'llama3-groq-8b': 'Groq/Llama-3-Groq-8B-Tool-Use',
    'llama3-groq-70b': 'Groq/Llama-3-Groq-70B-Tool-Use',
    'command-r-plus': 'CohereForAI/c4ai-command-r-plus-08-2024',
    'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3',
    'mistral-large': 'mistralai/Mistral-Large-Instruct-2411'
};

// Fallback model (original)
const HF_FALLBACK_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export const HuggingFaceService = {
    /**
     * Chat with tool-use model (RECOMMENDED)
     * Uses Llama-3-Groq-8B-Tool-Use by default for best speed/accuracy balance
     */
    async chatWithToolUse(message: string, systemPrompt: string, useWebSearch = true): Promise<string> {
        if (!HF_API_KEY) {
            throw new Error('Hugging Face API Key is missing');
        }

        const model = HF_TOOL_USE_MODELS['llama3-groq-8b'];

        try {
            let enhancedSystemPrompt = systemPrompt;

            // Add web search context if enabled
            if (useWebSearch) {
                try {
                    const { WebSearchService } = await import('./WebSearchService');
                    const searchResults = await WebSearchService.searchChennaiData(message);

                    enhancedSystemPrompt = `${systemPrompt}

WEB SEARCH RESULTS (Use this real-time data):
${searchResults}

INSTRUCTIONS:
- Base your response ONLY on the web search results provided above
- Extract relevant information accurately
- If search results are insufficient, clearly state that`;

                    console.log('Web search completed for Hugging Face tool-use model');
                } catch (error) {
                    console.warn('Web search failed:', error);
                }
            }

            const fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${enhancedSystemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${HF_API_KEY}`
                    },
                    body: JSON.stringify({
                        inputs: fullPrompt,
                        parameters: {
                            max_new_tokens: 1000,
                            temperature: 0.7,
                            return_full_text: false,
                            do_sample: true
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                return data[0].generated_text.trim();
            } else if (data.generated_text) {
                return data.generated_text.trim();
            }

            throw new Error('Unexpected response format from Hugging Face');
        } catch (error) {
            console.error('Hugging Face Tool-Use Model Error:', error);
            // Fallback to original chat method
            return this.chat(message, systemPrompt, useWebSearch);
        }
    },

    /**
     * Original chat method (FALLBACK)
     */
    async chat(message: string, systemPrompt: string, useWebSearch = false): Promise<string> {
        if (!HF_API_KEY) {
            throw new Error('Hugging Face API Key is missing');
        }

        try {
            let enhancedSystemPrompt = systemPrompt;

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

                    console.log('Web search completed for Hugging Face');
                } catch (error) {
                    console.warn('Web search failed for Hugging Face:', error);
                }
            }

            const fullPrompt = `<s>[INST] ${enhancedSystemPrompt}\n\n${message} [/INST]`;

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${HF_FALLBACK_MODEL}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${HF_API_KEY}`
                    },
                    body: JSON.stringify({
                        inputs: fullPrompt,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            return_full_text: false
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                return data[0].generated_text.trim();
            } else if (data.generated_text) {
                return data.generated_text.trim();
            }

            throw new Error('Unexpected response format from Hugging Face');
        } catch (error) {
            console.error('Hugging Face Service Error:', error);
            throw error;
        }
    },

    /**
     * Chat with JSON response (for structured data)
     */
    async chatJSON<T>(message: string, systemPrompt: string, useWebSearch = true): Promise<T> {
        if (!HF_API_KEY) {
            throw new Error('Hugging Face API Key is missing');
        }

        try {
            let enhancedSystemPrompt = systemPrompt;

            if (useWebSearch) {
                try {
                    const { WebSearchService } = await import('./WebSearchService');
                    const searchResults = await WebSearchService.searchChennaiData(message);

                    enhancedSystemPrompt = `${systemPrompt}

WEB SEARCH RESULTS:
${searchResults}

CRITICAL: Extract and structure data from search results into valid JSON format.
Do not generate or make up information.
Return ONLY valid JSON, no additional text.`;

                } catch (error) {
                    console.warn('Web search failed:', error);
                }
            }

            const fullPrompt = `<s>[INST] ${enhancedSystemPrompt}\n\n${message}\n\nRespond with ONLY valid JSON. [/INST]`;

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${HF_FALLBACK_MODEL}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${HF_API_KEY}`
                    },
                    body: JSON.stringify({
                        inputs: fullPrompt,
                        parameters: {
                            max_new_tokens: 1000,
                            temperature: 0.3,
                            return_full_text: false
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Hugging Face API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            let textResponse = '';

            if (Array.isArray(data) && data.length > 0) {
                textResponse = data[0].generated_text.trim();
            } else if (data.generated_text) {
                textResponse = data.generated_text.trim();
            }

            // Extract JSON from response (in case model adds extra text)
            const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return JSON.parse(textResponse);
        } catch (error) {
            console.error('Hugging Face Service Error:', error);
            throw error;
        }
    }
};
