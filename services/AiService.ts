import { AzureOpenAIService } from './AzureOpenAIService';
import { HuggingFaceService } from './HuggingFaceService';
import { GeminiService } from './GeminiService';
import { AzureTranslationService } from './AzureTranslationService';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return '';
};

const GROQ_API_KEY = getEnv('VITE_GROQ_API_KEY');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AiResponse {
  content: string;
  error?: string;
  sources?: string[];
}

// List of high-limit models to try in order (Groq)
const GROQ_MODELS = [
  'llama-3.3-70b-versatile', // Best quality
  'llama-3.1-70b-versatile', // High quality fallback
  'llama-3.1-8b-instant',    // Fast, high throughput
  'mixtral-8x7b-32768',      // Good alternative architecture
  'gemma2-9b-it'             // Google's model as final backup
];

export const AiService = {
  /**
   * Internal helper to execute AI requests with full fallback chain
   * Gemini -> Groq -> Azure OpenAI -> Hugging Face
   */
  async _executeRequest(messages: any[]): Promise<AiResponse> {
    // 0. Try Gemini (Primary) - via GeminiService for general chat if needed, 
    // but here we are focusing on the generic chat capability.
    // Note: GeminiService is currently specialized for Live Updates, but we can expand it or use it here.
    // For now, we will stick to the existing Groq flow for CHAT, but use GeminiService for Live Updates.
    // If you want Gemini for CHAT too, we would need to add a chat method to GeminiService.

    // 1. Try Groq Models
    if (GROQ_API_KEY) {
      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              temperature: 0.7,
              max_tokens: 800
            })
          });

          if (response.status === 429) {
            console.warn(`Groq Rate Limit (429) on ${model}`);
            continue; // Try next Groq model
          }

          if (!response.ok) {
            throw new Error(`Groq API Error on ${model}: ${response.statusText}`);
          }

          const data = await response.json();
          return { content: data.choices[0].message.content };

        } catch (error: any) {
          console.warn(`Groq failed with model ${model}:`, error.message);
          continue;
        }
      }
    }

    console.warn('All Groq models failed. Switching to Azure OpenAI...');

    // 2. Try Azure OpenAI
    try {
      // Extract the last user message and system prompt for Azure/HF services
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';

      const azureContent = await AzureOpenAIService.chat(userMessage, systemMessage);
      return { content: azureContent };
    } catch (error: any) {
      console.warn('Azure OpenAI failed:', error.message);
    }

    console.warn('Azure OpenAI failed. Switching to Hugging Face...');

    // 3. Try Hugging Face
    try {
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';

      const hfContent = await HuggingFaceService.chat(userMessage, systemMessage);
      return { content: hfContent };
    } catch (error: any) {
      console.error('Hugging Face failed:', error.message);
    }

    return { content: '', error: 'Sorry, I am having trouble connecting to all my brain centers right now! Please try again later.' };
  },

  /**
   * Chat with Chennai AI (includes multi-provider fallback)
   */
  async chat(message: string, context?: string): Promise<AiResponse> {
    const systemPrompt = `You are "Chennai AI", a helpful, witty, and knowledgeable local assistant for Chennai, India. 
    You speak English mixed with Tanglish (Tamil + English) naturally. 
    You know everything about Chennai: food, bus routes, temples, slang, and local events.
    Always be polite, helpful, and use local emojis like 🙏, 🥘, 🚌.
    
    CRITICAL:
    - Keep responses concise and relevant.
    - If asked about real-time data (weather, traffic), clarify that you are an AI and provide general advice or historical patterns.
    
    Context: ${context || 'User is asking a general question about Chennai.'}`;

    return this._executeRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ]);
  },

  /**
   * Summarize a post (Simple utility)
   */
  async summarizePost(postContent: string): Promise<AiResponse> {
    const systemPrompt = 'Summarize this Chennai community post in one short, catchy sentence (max 10 words). Use Tanglish if appropriate.';

    return this._executeRequest([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: postContent }
    ]);
  },

  /**
   * Get Live Updates using Gemini (Primary)
   */
  async getLiveUpdates(location: string = 'Chennai'): Promise<string> {
    try {
      const result = await GeminiService.getLiveUpdates(location);
      return result.text;
    } catch (error) {
      console.error('Failed to get live updates via Gemini:', error);
      return 'Live updates currently unavailable. Stay safe, Chennai! 🙏';
    }
  },

  /**
   * Get Real-Time Data using Gemini Grounding
   * Used by LiveDataService for Weather, Traffic, etc.
   */
  async getRealTimeData(prompt: string): Promise<AiResponse> {
    try {
      const content = await GeminiService.getRealTimeData(prompt);
      return { content };
    } catch (error) {
      console.error('Failed to get real-time data via Gemini:', error);
      return { content: '', error: 'Failed to fetch real-time data' };
    }
  },

  /**
   * Translate text using Azure AI Services
   */
  async translate(text: string, toLanguage: string): Promise<string> {
    return AzureTranslationService.translate(text, toLanguage);
  }
};
