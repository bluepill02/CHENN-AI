import type { VercelRequest, VercelResponse } from '@vercel/node';
import { databaseService } from '../lib/database-postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Test database connection and return stats
      const stats = await databaseService.getCommunityStats();
      
      return res.status(200).json({
        success: true,
        message: 'PostgreSQL connection successful',
        stats,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const { action, data } = req.body;

      switch (action) {
        case 'create_user':
          const user = await databaseService.createUser({
            userId: data.userId || `user_${Date.now()}`,
            name: data.name,
            email: data.email,
            location: data.location || 'Chennai',
            avatar: data.avatar
          });
          return res.status(201).json({ success: true, user });

        case 'create_post':
          const post = await databaseService.createPost({
            postId: data.postId || `post_${Date.now()}`,
            userId: data.userId,
            content: data.content,
            category: data.category || 'general',
            pincode: data.pincode || '600001',
            area: data.area || 'Chennai',
            tags: data.tags || []
          });
          return res.status(201).json({ success: true, post });

        case 'get_stats':
          const communityStats = await databaseService.getCommunityStats(data.pincode);
          return res.status(200).json({ success: true, stats: communityStats });

        default:
          return res.status(400).json({ success: false, error: 'Invalid action' });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Database API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Database operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}