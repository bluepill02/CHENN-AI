import { Db, MongoError } from 'mongodb';
import { Collections, Comment, DatabaseIndexes, Post, User } from './database-types';
import { connectToDatabase } from './mongodb';

export class DatabaseService {
  private db: Db | null = null;

  // Initialize database connection
  async init(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      this.db = db;
      await this.createIndexes();
      console.log('✅ Database connected and indexes created');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Create database indexes for performance
  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create indexes for each collection
      for (const [collectionName, indexes] of Object.entries(DatabaseIndexes)) {
        const collection = this.db.collection(collectionName);
        
        for (const index of indexes) {
          try {
            await collection.createIndex(index.key as any, index as any);
          } catch (error) {
            // Ignore duplicate index errors
            if (error instanceof MongoError && error.code !== 85) {
              console.warn(`Index creation warning for ${collectionName}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating database indexes:', error);
    }
  }

  // User operations
  async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!this.db) await this.init();
    
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db!.collection<User>(Collections.USERS).insertOne(user as any);
    return { ...user, _id: result.insertedId.toString() };
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<User>(Collections.USERS).findOne({ id: userId });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<User>(Collections.USERS).findOne({ email });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (!this.db) await this.init();
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await this.db!.collection<User>(Collections.USERS).findOneAndUpdate(
      { id: userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  // Post operations
  async createPost(postData: Omit<Post, '_id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    if (!this.db) await this.init();
    
    const post: Post = {
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db!.collection<Post>(Collections.POSTS).insertOne(post as any);
    return { ...post, _id: result.insertedId.toString() };
  }

  async getPostById(postId: string): Promise<Post | null> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<Post>(Collections.POSTS).findOne({ id: postId });
  }

  async getPostsByPincode(pincode: string, limit = 20, skip = 0): Promise<Post[]> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<Post>(Collections.POSTS)
      .find({ 
        'location.pincode': pincode,
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getPostsByUserId(userId: string, limit = 20): Promise<Post[]> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<Post>(Collections.POSTS)
      .find({ 
        userId,
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post | null> {
    if (!this.db) await this.init();
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await this.db!.collection<Post>(Collections.POSTS).findOneAndUpdate(
      { id: postId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  async togglePostLike(postId: string, userId: string): Promise<Post | null> {
    if (!this.db) await this.init();
    
    const post = await this.getPostById(postId);
    if (!post) return null;

    const isLiked = post.reactions.likedBy.includes(userId);
    
    const update = isLiked 
      ? { 
          $inc: { 'reactions.likes': -1 } as any,
          $pull: { 'reactions.likedBy': userId } as any,
          $set: { updatedAt: new Date() }
        }
      : { 
          $inc: { 'reactions.likes': 1 } as any,
          $addToSet: { 'reactions.likedBy': userId } as any,
          $set: { updatedAt: new Date() }
        };

    const result = await this.db!.collection<Post>(Collections.POSTS).findOneAndUpdate(
      { id: postId },
      update as any,
      { returnDocument: 'after' }
    );

    return result || null;
  }

  // Comment operations
  async createComment(commentData: Omit<Comment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    if (!this.db) await this.init();
    
    const comment: Comment = {
      ...commentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.db!.collection<Comment>(Collections.COMMENTS).insertOne(comment as any);
    return { ...comment, _id: result.insertedId.toString() };
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    if (!this.db) await this.init();
    
    return await this.db!.collection<Comment>(Collections.COMMENTS)
      .find({ 
        postId,
        status: 'active'
      })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async updateComment(commentId: string, updates: Partial<Comment>): Promise<Comment | null> {
    if (!this.db) await this.init();
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await this.db!.collection<Comment>(Collections.COMMENTS).findOneAndUpdate(
      { id: commentId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  // Utility methods
  async getPostsWithComments(pincode: string, limit = 20): Promise<Post[]> {
    if (!this.db) await this.init();
    
    const posts = await this.getPostsByPincode(pincode, limit);
    
    // Fetch comments for each post
    for (const post of posts) {
      post.comments = await this.getCommentsByPostId(post.id);
    }
    
    return posts;
  }

  async getCommunityStats(pincode?: string): Promise<{
    totalPosts: number;
    totalUsers: number;
    totalComments: number;
    activeUsers: number;
    postsToday: number;
    postsThisWeek: number;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    if (!this.db) await this.init();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const postFilter: any = pincode ? { 'location.pincode': pincode, status: 'active' } : { status: 'active' };
    const userFilter: any = pincode ? { location: { $regex: pincode } } : {};
    
    const [totalPosts, totalUsers, totalComments, activeUsers, postsToday, postsThisWeek, categoryStats] = await Promise.all([
      this.db!.collection<Post>(Collections.POSTS).countDocuments(postFilter as any),
      this.db!.collection<User>(Collections.USERS).countDocuments(userFilter as any),
      this.db!.collection<Comment>(Collections.COMMENTS).countDocuments({ status: 'active' } as any),
      this.db!.collection<User>(Collections.USERS).countDocuments({
        ...userFilter,
        lastActive: { $gte: sevenDaysAgo }
      } as any),
      this.db!.collection<Post>(Collections.POSTS).countDocuments({
        ...postFilter,
        createdAt: { $gte: today }
      } as any),
      this.db!.collection<Post>(Collections.POSTS).countDocuments({ 
        ...postFilter,
        createdAt: { $gte: weekAgo }
      } as any),
      this.db!.collection<Post>(Collections.POSTS).aggregate([
        { $match: postFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray()
    ]);

    return {
      totalPosts,
      totalUsers,
      totalComments,
      activeUsers,
      postsToday,
      postsThisWeek,
      topCategories: categoryStats.map((stat: any) => ({
        category: stat._id,
        count: stat.count
      }))
    };
  }

  async getTrendingPosts(pincode?: string, limit = 10): Promise<Post[]> {
    if (!this.db) await this.init();

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const matchFilter: any = {
      status: 'active',
      createdAt: { $gte: threeDaysAgo }
    };

    if (pincode) {
      matchFilter['location.pincode'] = pincode;
    }

    return await this.db!.collection<Post>(Collections.POSTS)
      .find(matchFilter)
      .sort({ 
        'reactions.likes': -1,
        'reactions.comments': -1,
        createdAt: -1
      })
      .limit(limit)
      .toArray();
  }

  async searchPosts(query: string, pincode?: string, limit = 20): Promise<Post[]> {
    if (!this.db) await this.init();

    const searchFilter: any = {
      status: 'active',
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    if (pincode) {
      searchFilter['location.pincode'] = pincode;
    }

    return await this.db!.collection<Post>(Collections.POSTS)
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    if (!this.db) await this.init();

    const result = await this.db!.collection<Post>(Collections.POSTS).updateOne(
      { id: postId, userId },
      { 
        $set: { 
          status: 'deleted', 
          updatedAt: new Date() 
        } 
      }
    );

    return result.modifiedCount > 0;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    if (!this.db) await this.init();

    const result = await this.db!.collection<Comment>(Collections.COMMENTS).updateOne(
      { id: commentId, userId },
      { 
        $set: { 
          status: 'deleted', 
          updatedAt: new Date() 
        } 
      }
    );

    return result.modifiedCount > 0;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();