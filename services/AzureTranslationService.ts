const getEnv = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const API_KEY = getEnv('VITE_AZURE_AI_SERVICE_KEY');
const ENDPOINT = getEnv('VITE_AZURE_AI_SERVICE_ENDPOINT');

export const AzureTranslationService = {
    async translate(text: string, toLanguage: string): Promise<string> {
        if (!API_KEY || !ENDPOINT) {
            console.warn('Azure AI credentials missing');
            return text;
        }

        // Ensure endpoint ends with /
        const baseUrl = ENDPOINT.endsWith('/') ? ENDPOINT : `${ENDPOINT}/`;
        const url = `${baseUrl}translator/text/v3.0/translate?api-version=3.0&to=${toLanguage}`;

        try {
            // Handle Tanglish (ta-rom)
            if (toLanguage === 'ta-rom') {
                // 1. Translate to Tamil first
                const tamilText = await this.translate(text, 'ta');
                // 2. Transliterate Tamil to Latin
                return this.transliterate(tamilText, 'ta', 'Taml', 'Latn');
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ Text: text }])
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Azure Translation Error:', error);
                throw new Error(error.error?.message || 'Translation failed');
            }

            const data = await response.json();
            return data[0]?.translations[0]?.text || text;
        } catch (error) {
            console.error('Translation failed:', error);
            return text;
        }
    },

    async transliterate(text: string, language: string, fromScript: string, toScript: string): Promise<string> {
        if (!API_KEY || !ENDPOINT) return text;

        const baseUrl = ENDPOINT.endsWith('/') ? ENDPOINT : `${ENDPOINT}/`;
        const url = `${baseUrl}translator/text/v3.0/transliterate?api-version=3.0&language=${language}&fromScript=${fromScript}&toScript=${toScript}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ Text: text }])
            });

            if (!response.ok) {
                return text;
            }

            const data = await response.json();
            return data[0]?.text || text;
        } catch (error) {
            console.error('Transliteration failed:', error);
            return text;
        }
    }
};
