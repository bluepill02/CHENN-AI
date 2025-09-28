import { query, queryOne } from './postgres';

// PostgreSQL Database Service for Chennai Community App
export class PostgreSQLDatabaseService {
  private initialized = false;

  // Initialize database with schema
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if tables exist, if not run schema
      const result = await queryOne<{ exists: boolean }>(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists`
      );

      if (!result?.exists) {
        console.log('🔧 Setting up database schema...');
        // Note: In production, you'd run the schema.sql file separately
        // For now, we'll assume the schema exists
      }

      this.initialized = true;
      console.log('✅ PostgreSQL Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // User operations
  async createUser(userData: {
    userId: string;
    name: string;
    email?: string;
    location?: string;
    avatar?: string;
  }) {
    await this.init();

    const user = await queryOne<any>(
      `INSERT INTO users (user_id, name, email, location, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userData.userId, userData.name, userData.email, userData.location, userData.avatar]
    );

    return user;
  }

  async getUserById(userId: string) {
    await this.init();

    return await queryOne<any>(
      `SELECT u.*, 
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'title', ub.title,
              'description', ub.description,
              'rarity', ub.rarity,
              'earned_at', ub.earned_at
            )
          ) FILTER (WHERE ub.id IS NOT NULL), 
          '[]'::json
        ) as badges
       FROM users u
       LEFT JOIN user_badges ub ON u.id = ub.user_id AND ub.is_active = true
       WHERE u.user_id = $1
       GROUP BY u.id`,
      [userId]
    );
  }

  async getUserByEmail(email: string) {
    await this.init();

    return await queryOne<any>(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
  }

  async updateUser(userId: string, updates: Partial<{
    name: string;
    email: string;
    about: string;
    location: string;
    avatar_url: string;
    language: string;
    notifications_enabled: boolean;
    privacy_level: string;
  }>) {
    await this.init();

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    if (!setClause) return null;

    return await queryOne<any>(
      `UPDATE users 
       SET ${setClause}, updated_at = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [userId, ...Object.values(updates)]
    );
  }

  // Post operations
  async createPost(postData: {
    postId: string;
    userId: string;
    content: string;
    category: string;
    pincode: string;
    area: string;
    tags?: string[];
  }) {
    await this.init();

    // First get the user's UUID
    const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE user_id = $1', [postData.userId]);
    if (!user) throw new Error('User not found');

    const post = await queryOne<any>(
      `INSERT INTO posts (
        post_id, user_id, content, category, category_en, 
        area, area_en, pincode, tags, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [
        postData.postId,
        user.id,
        postData.content,
        postData.category,
        postData.category, // For now, same as Tamil
        postData.area,
        postData.area, // For now, same as Tamil
        postData.pincode,
        postData.tags || []
      ]
    );

    return post;
  }

  async getPostById(postId: string) {
    await this.init();

    return await queryOne<any>(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', c.comment_id,
              'content', c.content,
              'author_name', c.author_name,
              'created_at', c.created_at,
              'likes_count', c.likes_count
            ) ORDER BY c.created_at
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'::json
        ) as comments
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN comments c ON p.id = c.post_id AND c.status = 'active'
       WHERE p.post_id = $1 AND p.status = 'active'
       GROUP BY p.id, u.name, u.avatar_url`,
      [postId]
    );
  }

  async getPostsByPincode(pincode: string, limit = 20, offset = 0) {
    await this.init();

    return await query<any>(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.pincode = $1 AND p.status = 'active'
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [pincode, limit, offset]
    );
  }

  async getPostsByUserId(userId: string, limit = 20) {
    await this.init();

    return await query<any>(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE u.user_id = $1 AND p.status = 'active'
       ORDER BY p.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  }

  async togglePostLike(postId: string, userId: string) {
    await this.init();

    // Get user and post UUIDs
    const [user, post] = await Promise.all([
      queryOne<{ id: string }>('SELECT id FROM users WHERE user_id = $1', [userId]),
      queryOne<{ id: string }>('SELECT id FROM posts WHERE post_id = $1', [postId])
    ]);

    if (!user || !post) throw new Error('User or post not found');

    // Check if already liked
    const existingReaction = await queryOne<{ id: string }>(
      'SELECT id FROM post_reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3',
      [post.id, user.id, 'likes']
    );

    if (existingReaction) {
      // Remove like
      await query(
        'DELETE FROM post_reactions WHERE id = $1',
        [existingReaction.id]
      );
    } else {
      // Add like
      await query(
        'INSERT INTO post_reactions (post_id, user_id, reaction_type) VALUES ($1, $2, $3)',
        [post.id, user.id, 'likes']
      );
    }

    // Return updated post
    return await this.getPostById(postId);
  }

  // Comment operations
  async createComment(commentData: {
    commentId: string;
    postId: string;
    userId: string;
    content: string;
  }) {
    await this.init();

    // Get user and post info
    const [user, post] = await Promise.all([
      queryOne<{ id: string; name: string; avatar_url: string; trust_score: number }>(
        'SELECT id, name, avatar_url, trust_score FROM users WHERE user_id = $1',
        [commentData.userId]
      ),
      queryOne<{ id: string }>('SELECT id FROM posts WHERE post_id = $1', [commentData.postId])
    ]);

    if (!user || !post) throw new Error('User or post not found');

    const comment = await queryOne<any>(
      `INSERT INTO comments (
        comment_id, post_id, user_id, content,
        author_name, author_avatar, author_trust_score
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        commentData.commentId,
        post.id,
        user.id,
        commentData.content,
        user.name,
        user.avatar_url,
        user.trust_score
      ]
    );

    return comment;
  }

  async getCommentsByPostId(postId: string) {
    await this.init();

    return await query<any>(
      `SELECT c.*
       FROM comments c
       JOIN posts p ON c.post_id = p.id
       WHERE p.post_id = $1 AND c.status = 'active'
       ORDER BY c.created_at ASC`,
      [postId]
    );
  }

  // Search and analytics
  async searchPosts(searchQuery: string, pincode?: string, limit = 20) {
    await this.init();

    let whereClause = `p.status = 'active' AND (
      p.content ILIKE $1 OR 
      p.content_en ILIKE $1 OR 
      p.category ILIKE $1 OR
      $2 = ANY(p.tags)
    )`;
    let params: any[] = [`%${searchQuery}%`, searchQuery];

    if (pincode) {
      whereClause += ` AND p.pincode = $${params.length + 1}`;
      params.push(pincode);
    }

    return await query<any>(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length + 1}`,
      [...params, limit]
    );
  }

  async getCommunityStats(pincode?: string) {
    await this.init();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let userFilter = '';
    let postFilter = "status = 'active'";
    let params: any[] = [today.toISOString(), weekAgo.toISOString()];

    if (pincode) {
      postFilter += ' AND pincode = $3';
      userFilter = 'WHERE location ILIKE $4';
      params.push(pincode, `%${pincode}%`);
    }

    const [userStats, postStats, topCategories] = await Promise.all([
      queryOne<{ total_users: number; active_users: number }>(
        `SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN last_active >= $2 THEN 1 END) as active_users
         FROM users ${userFilter}`,
        userFilter ? [today.toISOString(), weekAgo.toISOString(), `%${pincode}%`] : [today.toISOString(), weekAgo.toISOString()]
      ),
      queryOne<{ total_posts: number; posts_today: number; total_comments: number }>(
        `SELECT 
          COUNT(*) as total_posts,
          COUNT(CASE WHEN created_at >= $1 THEN 1 END) as posts_today,
          (SELECT COUNT(*) FROM comments c JOIN posts p2 ON c.post_id = p2.id WHERE p2.${postFilter} AND c.status = 'active') as total_comments
         FROM posts p 
         WHERE ${postFilter}`,
        params
      ),
      query<{ category: string; count: number }>(
        `SELECT category, COUNT(*) as count
         FROM posts p
         WHERE ${postFilter}
         GROUP BY category
         ORDER BY count DESC
         LIMIT 5`,
        pincode ? [pincode] : []
      )
    ]);

    return {
      totalUsers: userStats?.total_users || 0,
      totalPosts: postStats?.total_posts || 0,
      totalComments: postStats?.total_comments || 0,
      activeUsers: userStats?.active_users || 0,
      postsToday: postStats?.posts_today || 0,
      topCategories: topCategories || []
    };
  }

  // Cleanup operations
  async deletePost(postId: string, userId: string) {
    await this.init();

    const result = await queryOne<{ updated: boolean }>(
      `UPDATE posts p
       SET status = 'deleted', updated_at = NOW()
       FROM users u
       WHERE p.post_id = $1 AND p.user_id = u.id AND u.user_id = $2
       RETURNING true as updated`,
      [postId, userId]
    );

    return !!result?.updated;
  }

  async deleteComment(commentId: string, userId: string) {
    await this.init();

    const result = await queryOne<{ updated: boolean }>(
      `UPDATE comments c
       SET status = 'deleted', updated_at = NOW()
       FROM users u
       WHERE c.comment_id = $1 AND c.user_id = u.id AND u.user_id = $2
       RETURNING true as updated`,
      [commentId, userId]
    );

    return !!result?.updated;
  }
}

// Export singleton instance
export const databaseService = new PostgreSQLDatabaseService();