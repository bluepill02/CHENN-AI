
const fs = require('fs');

// Mock environment variables
const SEARXNG_INSTANCE = 'https://searx.be';
const PUBLIC_SEARXNG_INSTANCES = [
    'https://searx.be',
    'https://searx.work',
    'https://search.bus-hit.me',
    'https://searx.tiekoetter.com',
    'https://search.sapti.me',
    'https://searx.fmac.xyz',
    'https://search.ononoki.org',
    'https://searx.prvcy.eu',
    'https://searx.lunar.icu'
];

function log(message) {
    console.log(message);
    fs.appendFileSync('test_results.log', message + '\n');
}

// Simplified Service Implementation for Testing
const SearXNGService = {
    async search(query, options = {}) {
        const instances = [
            SEARXNG_INSTANCE,
            ...PUBLIC_SEARXNG_INSTANCES.filter(url => url !== SEARXNG_INSTANCE)
        ];

        let lastError;

        for (const instance of instances) {
            try {
                log(`Trying SearXNG instance: ${instance}`);

                const params = new URLSearchParams({
                    q: query,
                    format: 'json',
                    ...(options.categories && { categories: options.categories }),
                    ...(options.time_range && { time_range: options.time_range }),
                    ...(options.language && { language: options.language }),
                });

                // 5 second timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const url = `${instance}/search?${params}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Status ${response.status}`);

                const data = await response.json();

                if (!data.results && !data.infoboxes) throw new Error('Invalid format');

                log(`✅ Success on ${instance}: ${data.number_of_results} results`);
                return data;

            } catch (error) {
                log(`⚠️ Failed ${instance}: ${error.message}`);
                lastError = error;
            }
        }

        log('⚠️ All instances failed, falling back to mock data');
        return this.getMockData(query, options);
    },

    getMockData(query, options) {
        log(`Generating mock data for: ${query}`);
        const isNews = options.categories === 'news' || (options.categories && options.categories.includes('news'));
        const isImages = options.categories === 'images';

        let results = [];

        if (isNews) {
            results = [
                {
                    title: 'Chennai Metro Rail Phase 2 updates',
                    url: 'https://chennaimetrorail.org',
                    content: 'New stations announced for Phase 2...',
                    engine: 'mock'
                },
                {
                    title: 'Heavy rains predicted in Chennai',
                    url: 'https://imd.gov.in',
                    content: 'Orange alert issued for next 48 hours...',
                    engine: 'mock'
                }
            ];
        } else if (isImages) {
            results = [
                {
                    title: 'Marina Beach Sunrise',
                    url: 'https://example.com/marina.jpg',
                    img_src: 'https://example.com/marina.jpg',
                    content: 'Beautiful sunrise at Marina Beach',
                    engine: 'mock'
                }
            ];
        } else {
            results = [{
                title: `Mock Result for ${query}`,
                url: 'https://example.com',
                content: 'Search service unavailable, showing mock result.',
                engine: 'mock'
            }];
        }

        return {
            query,
            number_of_results: results.length,
            results
        };
    },

    async searchChennai(query, options = {}) {
        const chennaiQuery = query.toLowerCase().includes('chennai') ? query : `${query} Chennai`;
        return this.search(chennaiQuery, {
            categories: options.category || 'general',
            time_range: options.timeRange,
            language: 'en-IN',
            safesearch: 0
        });
    },

    async getChennaiNews() {
        return this.searchChennai('latest news', { category: 'news', timeRange: 'day' });
    },

    async getChennaiImages(topic) {
        return this.searchChennai(topic, { category: 'images' });
    }
};

async function runTests() {
    // Clear previous log
    fs.writeFileSync('test_results.log', '');

    log('🚀 Starting JS SearXNG Test...\n');

    try {
        // Test 1: News
        log('📰 Testing News...');
        const news = await SearXNGService.getChennaiNews();
        log(`Got ${news.results.length} news items.`);
        if (news.results.length > 0) log(`Sample: ${news.results[0].title}\n`);

        // Test 2: Images
        log('🖼️ Testing Images...');
        const images = await SearXNGService.getChennaiImages('Marina Beach');
        log(`Got ${images.results.length} images.`);
        if (images.results.length > 0) log(`Sample URL: ${images.results[0].img_src || images.results[0].url}\n`);

        log('✅ All tests completed!');

    } catch (error) {
        log(`❌ Test Failed: ${error.message}`);
        if (error.cause) log(`Cause: ${error.cause}`);
    }
}

runTests();
