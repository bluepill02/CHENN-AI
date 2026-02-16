// Hugging Face API Proxy - Handles CORS and rate limiting
import type { VercelRequest, VercelResponse } from '@vercel/node';

const HF_API_KEY = process.env.VITE_HUGGING_FACE_API_KEY;

// Simple in-memory cache (for serverless, consider Redis for production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { model, payload } = req.body;

        if (!model || !payload) {
            return res.status(400).json({ error: 'Missing model or payload' });
        }

        if (!HF_API_KEY) {
            return res.status(500).json({ error: 'Hugging Face API key not configured' });
        }

        // Check cache
        const cacheKey = `${model}:${JSON.stringify(payload)}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('Returning cached result');
            return res.status(200).json(cached.data);
        }

        // Make request to Hugging Face
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_API_KEY}`
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hugging Face API error:', response.status, errorText);
            return res.status(response.status).json({
                error: `Hugging Face API error: ${response.status}`,
                details: errorText
            });
        }

        const data = await response.json();

        // Cache the result
        cache.set(cacheKey, { data, timestamp: Date.now() });

        // Clean old cache entries (simple cleanup)
        if (cache.size > 100) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        return res.status(200).json(data);

    } catch (error: any) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
