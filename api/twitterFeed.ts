import type { VercelRequest, VercelResponse } from '@vercel/node';
import trusted from '../data/trustedAccounts.json';
import { fetchTweetsByUsernames } from '../services/twitter';

/**
 * Vercel Serverless Function: Twitter Feed
 * Fetches tweets from trusted accounts by category
 * 
 * Query params:
 * - category: string (e.g., "traffic", "events", "news")
 */
export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    // Parse query parameters
    const { category = 'traffic' } = request.query;
    const categoryStr = Array.isArray(category) ? category[0] : category;

    // Get accounts for the specified category
    const accounts = trusted[categoryStr as keyof typeof trusted] || [];

    if (!accounts.length) {
      return response.status(404).json({
        error: 'No accounts found for category',
        category: categoryStr
      });
    }

    // Fetch tweets
    const tweets = await fetchTweetsByUsernames(accounts, 5);

    return response.status(200).json({
      category: categoryStr,
      tweets
    });

  } catch (error) {
    console.error('Twitter feed error:', error);
    return response.status(500).json({
      error: 'Failed to fetch tweets',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
