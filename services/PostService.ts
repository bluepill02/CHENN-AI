import { supabase } from './supabaseClient';

export interface Post {
    id: string;
    created_at: string;
    content: string;
    image_url?: string;
    user_id: string;
    area?: string;
    category?: string;
    likes: number;
    comments_count: number;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    is_liked_by_user?: boolean; // Virtual field
}

export const PostService = {
    /**
     * Fetch posts, optionally filtered by area
     */
    async getPosts(area?: string): Promise<Post[]> {
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (area) {
            // Simple filter for now, can be improved with PostGIS later
            query = query.ilike('area', `%${area}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Create a new post
     */
    async createPost(content: string, category: string, area: string, userId: string): Promise<Post | null> {
        const { data, error } = await supabase
            .from('posts')
            .insert({
                content,
                category,
                area,
                user_id: userId
            })
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }

        return data;
    },

    /**
     * Toggle like on a post
     */
    async likePost(postId: string, userId: string): Promise<void> {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('post_likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existingLike) {
            // Unlike
            await supabase
                .from('post_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
        } else {
            // Like
            await supabase
                .from('post_likes')
                .insert({
                    post_id: postId,
                    user_id: userId
                });
        }
    },

    /**
     * Get comments for a post
     */
    async getComments(postId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Add a comment to a post
     */
    async addComment(postId: string, userId: string, content: string): Promise<any> {
        const { data, error } = await supabase
            .from('comments')
            .insert({
                post_id: postId,
                user_id: userId,
                content
            })
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .single();

        if (error) throw error;
        return data;
    }
};
