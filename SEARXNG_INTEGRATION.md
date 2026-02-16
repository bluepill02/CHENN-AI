# SearXNG Integration for Chennai Community App

## 🎯 What is SearXNG?

**SearXNG** is a free, open-source, privacy-respecting metasearch engine that:
- ✅ **Aggregates results** from 70+ search engines
- ✅ **No tracking** - completely privacy-focused
- ✅ **No API key required** - completely FREE
- ✅ **Self-hostable** - full control over your data
- ✅ **JSON API** - perfect for programmatic access

## 🚀 Why SearXNG for Our App?

### Advantages Over Other Solutions

| Feature | SearXNG | SerpAPI | DuckDuckGo | Groq Native |
|---------|---------|---------|------------|-------------|
| **Cost** | FREE | $50/5k searches | FREE | FREE |
| **Privacy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **No API Key** | ✅ | ❌ | ✅ | ❌ |
| **Result Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Rate Limits** | Generous | Strict | Moderate | Moderate |
| **Self-Hostable** | ✅ | ❌ | ❌ | ❌ |
| **Multiple Sources** | 70+ engines | Google only | DDG only | Unknown |

## 📋 Current Implementation

### Search Provider Priority

```
1. SearXNG (Primary) - FREE, privacy-focused, no API key
   ↓ (if fails)
2. SerpAPI (Fallback) - Paid, requires API key
   ↓ (if fails)
3. DuckDuckGo (Final Fallback) - FREE, limited results
```

### Features Implemented

1. ✅ **SearXNGService.ts** - Complete SearXNG integration
2. ✅ **WebSearchService.ts** - Updated to use SearXNG first
3. ✅ **Chennai-specific methods** - Optimized for local searches
4. ✅ **Automatic fallback** - Seamless failover to other providers
5. ✅ **Provider testing** - Health check for all search services

## 🛠️ Setup Options

### Option 1: Use Public Instance (Recommended - No Setup)

**Default**: The app uses `https://searx.be` by default.

**No configuration needed!** It works out of the box.

### Option 2: Choose Different Public Instance

Add to `.env`:
```env
VITE_SEARXNG_INSTANCE=https://searx.work
```

**Available Public Instances**:
- `https://searx.be` (Default - Belgium, fast)
- `https://searx.work` (Germany, reliable)
- `https://search.bus-hit.me` (Netherlands)
- `https://searx.tiekoetter.com` (Germany)
- `https://search.sapti.me` (France)
- `https://searx.fmac.xyz` (USA)
- `https://search.ononoki.org` (USA)
- `https://searx.prvcy.eu` (Finland)
- `https://searx.lunar.icu` (Germany)

**Find more**: https://searx.space/

### Option 3: Self-Host SearXNG (Maximum Privacy & Control)

#### Using Docker (Easiest)

```bash
# Clone SearXNG
git clone https://github.com/searxng/searxng-docker.git
cd searxng-docker

# Generate secret key
sed -i "s|ultrasecretkey|$(openssl rand -hex 32)|g" searxng/settings.yml

# Start SearXNG
docker compose up -d
```

Your instance will be at `http://localhost:8080`

Add to `.env`:
```env
VITE_SEARXNG_INSTANCE=http://localhost:8080
```

#### Benefits of Self-Hosting:
- ✅ Complete privacy control
- ✅ No rate limits
- ✅ Customize search engines
- ✅ Configure caching
- ✅ Add custom filters

## 📖 Usage Examples

### Basic Search

```typescript
import { SearXNGService } from './services/SearXNGService';

// Simple search
const results = await SearXNGService.search('Chennai weather');

// With options
const results = await SearXNGService.search('traffic update', {
    categories: 'news',
    time_range: 'day',
    language: 'en'
});
```

### Chennai-Specific Searches

```typescript
// Weather
const weather = await SearXNGService.getWeather('Mylapore');

// Traffic
const traffic = await SearXNGService.getTraffic('T Nagar');

// News
const news = await SearXNGService.getChennaiNews('local');

// Temples
const temples = await SearXNGService.getTempleInfo('Kapaleeshwarar');

// Bus routes
const buses = await SearXNGService.getBusRoutes('Adyar', 'Anna Nagar');

// Local services
const hospitals = await SearXNGService.searchLocalServices('hospitals', 'Velachery');
```

### With LLMs (Automatic)

```typescript
// Groq - automatically uses SearXNG
const weather = await GroqDataService.getWeather();

// Azure OpenAI - uses SearXNG via WebSearchService
const response = await AzureOpenAIService.chat(
    "What's the weather in Chennai?",
    "You are a helpful assistant",
    true  // Enable web search (uses SearXNG)
);

// Hugging Face - uses SearXNG via WebSearchService
const data = await HuggingFaceService.chatWithToolUse(
    "Latest Chennai news",
    "Return news as text",
    true  // Enable web search (uses SearXNG)
);
```

## 🔧 Configuration

### Environment Variables

```env
# SearXNG Configuration
VITE_SEARXNG_INSTANCE=https://searx.be  # Optional, defaults to searx.be
VITE_USE_SEARXNG=true                   # Optional, defaults to true

# Fallback Options (optional)
VITE_SERPAPI_KEY=your_serpapi_key       # For SerpAPI fallback
```

### Disable SearXNG

If you want to use only SerpAPI or DuckDuckGo:

```env
VITE_USE_SEARXNG=false
```

## 📊 Performance

### Speed Comparison (Average Response Time)

| Provider | Response Time | Results Quality |
|----------|--------------|-----------------|
| SearXNG | 500-1500ms | ⭐⭐⭐⭐⭐ (70+ sources) |
| SerpAPI | 300-800ms | ⭐⭐⭐⭐⭐ (Google) |
| DuckDuckGo | 200-600ms | ⭐⭐⭐ (Limited) |

### Result Quality

SearXNG aggregates from multiple engines:
- Google
- Bing
- DuckDuckGo
- Qwant
- Brave
- Wikipedia
- Reddit
- Stack Overflow
- And 60+ more!

## 🧪 Testing

### Test SearXNG Instance

```typescript
import { SearXNGService } from './services/SearXNGService';

const test = await SearXNGService.testInstance();
console.log(test);
// {
//   available: true,
//   responseTime: 523
// }
```

### Test All Providers

```typescript
import { WebSearchService } from './services/WebSearchService';

const status = await WebSearchService.testProviders();
console.log(status);
// {
//   searxng: { available: true, responseTime: 523 },
//   serpapi: { available: false },
//   duckduckgo: { available: true }
// }
```

## 🔒 Privacy & Security

### What SearXNG Does NOT Track:
- ❌ No IP logging
- ❌ No search history
- ❌ No user profiling
- ❌ No cookies (unless you enable preferences)
- ❌ No analytics

### What SearXNG DOES:
- ✅ Removes tracking parameters from URLs
- ✅ Proxies images (optional)
- ✅ Encrypts connections (HTTPS)
- ✅ Randomizes user agents
- ✅ Distributes requests across engines

## 🚨 Troubleshooting

### "SearXNG search failed"

**Cause**: Public instance might be down or rate-limited

**Solution**:
1. Try a different public instance (see list above)
2. Self-host your own instance
3. System automatically falls back to SerpAPI or DuckDuckGo

### Slow Response Times

**Cause**: Public instance under heavy load

**Solution**:
1. Use a less popular instance
2. Self-host for guaranteed performance
3. Enable caching in self-hosted setup

### No Results Returned

**Cause**: Query might be too specific or instance configuration

**Solution**:
1. Broaden your search query
2. Try different public instance
3. Check instance status at https://searx.space/

## 📈 Monitoring

### Check Instance Health

```bash
# Test instance availability
curl https://searx.be/search?q=test&format=json

# Check response time
time curl https://searx.be/search?q=test&format=json
```

### Monitor in Production

```typescript
// Log search provider usage
console.log('Search provider used:', 
    SearXNGService.isEnabled() ? 'SearXNG' : 'Fallback'
);

// Track response times
const start = Date.now();
await SearXNGService.search('query');
console.log('Search took:', Date.now() - start, 'ms');
```

## 🎯 Best Practices

1. **Use Public Instances for Development**
   - Quick setup
   - No maintenance
   - Good for testing

2. **Self-Host for Production**
   - Better performance
   - No rate limits
   - Full control

3. **Always Have Fallbacks**
   - Current setup: SearXNG → SerpAPI → DuckDuckGo
   - Ensures service availability

4. **Cache Results When Possible**
   - Reduce API calls
   - Faster response times
   - Lower load on instances

## 📚 Resources

- **SearXNG Official**: https://docs.searxng.org/
- **Public Instances**: https://searx.space/
- **GitHub**: https://github.com/searxng/searxng
- **Docker Setup**: https://github.com/searxng/searxng-docker
- **API Documentation**: https://docs.searxng.org/dev/search_api.html

## ✅ Summary

**SearXNG is now the PRIMARY search provider** for the Chennai Community App:

- ✅ **FREE** - No API keys or costs
- ✅ **Privacy-focused** - No tracking
- ✅ **High-quality results** - 70+ search engines
- ✅ **Works out of the box** - Default public instance
- ✅ **Automatic fallback** - Seamless failover
- ✅ **Chennai-optimized** - Special methods for local searches

The app will automatically use SearXNG for all real-time data queries!
