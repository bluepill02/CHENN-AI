# Web Search Integration for Chennai Community App

## Overview
The app now integrates real-time web search capabilities to fetch current data for weather, traffic, news, and other Chennai-specific information. This solves the issue where LLMs cannot access real-time data.

## Native LLM Capabilities

### ✅ Groq (Built-in Web Search)
Groq's latest models (`llama-3.3-70b-versatile`, `llama-3.1-70b-versatile`) have **native web search** capabilities:
- **No external API needed** for basic web search
- Uses `tools: [{ type: 'web_search' }]` parameter
- Automatically searches the web when needed
- **Fallback**: If native search fails, uses our custom WebSearchService

### ✅ Azure OpenAI (Tool Calling)
Azure OpenAI supports **tool calling** (function calling):
- Can integrate with **Bing Search API** or other search services
- Uses `tools` parameter to define search functions
- Requires Bing Search API key for production use
- **Fallback**: Uses our custom WebSearchService

### ⚠️ Hugging Face (Function Calling Only)
Hugging Face supports **function calling** but NO built-in web search:
- Can define custom search functions
- Requires external search API integration
- **Always uses**: Our custom WebSearchService

## How It Works

### Groq (Recommended - Native Search)
```
User Request → Groq Native Web Search → Real Results → Structured JSON
```

### Azure OpenAI (Tool Calling)
```
User Request → Tool Call Decision → Bing Search API → LLM Processing → Structured JSON
```

### Hugging Face (Custom Search)
```
User Request → WebSearchService → Search Results → LLM Processing → Structured JSON
```

## Setup Options

### Option 1: SerpAPI (Recommended - Most Accurate)
SerpAPI provides Google Search results with high accuracy.

1. Sign up at https://serpapi.com/
2. Get your API key (free tier: 100 searches/month)
3. Add to `.env`:
   ```
   VITE_SERPAPI_KEY=your_serpapi_key_here
   ```

### Option 2: DuckDuckGo (Free Fallback)
If no SerpAPI key is provided, the system automatically falls back to DuckDuckGo's free API.

**No setup required** - works out of the box but with less comprehensive results.

### Option 3: Brave Search API (Alternative)
1. Sign up at https://brave.com/search/api/
2. Get your API key (free tier: 2000 queries/month)
3. Modify `WebSearchService.ts` to use Brave instead of SerpAPI

## Environment Variables

Add these to your `.env` file:

```env
# Web Search (Choose one)
VITE_SERPAPI_KEY=your_serpapi_key_here

# Existing AI Service Keys
VITE_GROQ_API_KEY=your_groq_key
VITE_AZURE_OPENAI_ENDPOINT=your_azure_endpoint
VITE_AZURE_OPENAI_KEY=your_azure_key
VITE_AZURE_OPENAI_DEPLOYMENT=your_deployment_name
VITE_HUGGING_FACE_API_KEY=your_hf_key
```

## Usage

### Groq Service (Automatic)
```typescript
import { GroqDataService } from './services/GroqDataService';

// Web search is automatically performed
const weather = await GroqDataService.getWeather();
const traffic = await GroqDataService.getTraffic();
const news = await GroqDataService.getLocalNews();
```

### Azure OpenAI Service
```typescript
import { AzureOpenAIService } from './services/AzureOpenAIService';

// Enable web search with third parameter
const response = await AzureOpenAIService.chat(
    "What's the weather in Chennai?",
    "You are a helpful assistant",
    true  // Enable web search
);

// For JSON responses
const data = await AzureOpenAIService.chatJSON(
    "Get current weather in Chennai",
    "Return weather data as JSON"
);
```

### Hugging Face Service
```typescript
import { HuggingFaceService } from './services/HuggingFaceService';

// Enable web search with third parameter
const response = await HuggingFaceService.chat(
    "What's happening in Chennai today?",
    "You are a Chennai news assistant",
    true  // Enable web search
);

// For JSON responses
const data = await HuggingFaceService.chatJSON(
    "Get latest Chennai news",
    "Return news as JSON array"
);
```

## Features

✅ **Real-time Data**: Fetches current information from the web
✅ **Automatic Fallback**: Uses DuckDuckGo if SerpAPI is not configured
✅ **Chennai-Specific**: Optimized for Chennai-related queries
✅ **Error Handling**: Gracefully handles search failures
✅ **Multiple Sources**: Supports SerpAPI, DuckDuckGo, and can be extended

## Troubleshooting

### "No search results found"
- Check your internet connection
- Verify API key is correct (if using SerpAPI)
- Try a different search query

### "Web search failed"
- The system will still work but may generate less accurate data
- Check console logs for specific error messages
- Verify environment variables are set correctly

### Rate Limits
- **SerpAPI Free**: 100 searches/month
- **DuckDuckGo**: No official limit but may throttle heavy usage
- **Brave Search Free**: 2000 queries/month

## Cost Comparison

| Service | Free Tier | Paid Plans | Best For |
|---------|-----------|------------|----------|
| SerpAPI | 100/month | $50/5000 searches | Production apps |
| DuckDuckGo | Unlimited* | N/A | Development/Testing |
| Brave Search | 2000/month | $5/1000 searches | Cost-effective production |

*No official limit but may throttle

## Next Steps

1. Choose a search provider (SerpAPI recommended)
2. Add API key to `.env`
3. Test with real-time queries
4. Monitor usage and costs
5. Consider upgrading to paid tier for production

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify all environment variables are set
- Test with simple queries first
- Contact support if problems persist
