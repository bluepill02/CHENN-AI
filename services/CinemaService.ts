import { supabase } from './supabaseClient';

export interface CinemaPost {
    id: string;
    created_at: string;
    user_id: string;
    movie_name: string;
    theater_name?: string;
    rating: number;
    review: string;
    post_type: 'review' | 'discussion';
    pincode?: string;
    area?: string;
    likes: number;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    is_liked_by_user?: boolean;
}

export const CinemaService = {
    async getPosts(pincode?: string) {
        let query = supabase
            .from('cinema_posts')
            .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
            .order('created_at', { ascending: false });

        if (pincode) {
            // Optional: Filter by pincode if needed, but movies are often city-wide
            // query = query.eq('pincode', pincode);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching cinema posts:', error);
            throw error;
        }

        return data as CinemaPost[];
    },

    async createPost(post: Omit<CinemaPost, 'id' | 'created_at' | 'likes' | 'profiles'>) {
        const { data, error } = await supabase
            .from('cinema_posts')
            .insert(post)
            .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
            .single();

        if (error) {
            console.error('Error creating cinema post:', error);
            throw error;
        }

        return data as CinemaPost;
    },

    async deletePost(postId: string) {
        const { error } = await supabase
            .from('cinema_posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Error deleting cinema post:', error);
            throw error;
        }
    },

    subscribeToUpdates(callback: (payload: any) => void) {
        return supabase
            .channel('cinema_posts_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cinema_posts'
                },
                callback
            )
            .subscribe();
    },

    unsubscribe(subscription: any) {
        supabase.removeChannel(subscription);
    }
};
