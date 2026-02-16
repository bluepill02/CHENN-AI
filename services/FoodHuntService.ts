import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface FoodHuntPost {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    restaurant_name: string;
    dish_name?: string;
    rating: number;
    review?: string;
    price_range?: 'cheap' | 'moderate' | 'expensive';
    image_url?: string;
    pincode: string;
    area?: string;
    likes: number;

    // Joined profile data
    profiles?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        area?: string;
    };
    is_liked_by_user?: boolean; // Virtual field
}

export interface CreateFoodHuntPostData {
    restaurant_name: string;
    dish_name?: string;
    rating: number;
    review?: string;
    price_range?: 'cheap' | 'moderate' | 'expensive';
    image_url?: string;
    pincode: string;
    area?: string;
}

export class FoodHuntService {
    private static subscriptions: Map<string, RealtimeChannel> = new Map();

    /**
     * Get food hunt posts for a specific pincode
     */
    static async getPosts(pincode: string): Promise<FoodHuntPost[]> {
        try {
            const { data, error } = await supabase
                .from('food_hunt_posts')
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            area
          )
        `)
                .eq('pincode', pincode)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching food hunt posts:', error);
            throw error;
        }
    }

    /**
     * Create a new food hunt post
     */
    static async createPost(
        postData: CreateFoodHuntPostData,
        userId: string
    ): Promise<FoodHuntPost | null> {
        try {
            const { data, error } = await supabase
                .from('food_hunt_posts')
                .insert({
                    ...postData,
                    user_id: userId,
                })
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            area
          )
        `)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error creating food hunt post:', error);
            throw error;
        }
    }

    /**
     * Update a food hunt post
     */
    static async updatePost(
        postId: string,
        updates: Partial<CreateFoodHuntPostData>
    ): Promise<FoodHuntPost | null> {
        try {
            const { data, error } = await supabase
                .from('food_hunt_posts')
                .update(updates)
                .eq('id', postId)
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            area
          )
        `)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating food hunt post:', error);
            throw error;
        }
    }

    /**
     * Toggle like on a food hunt post
     */
    static async likePost(postId: string, userId: string): Promise<void> {
        try {
            // Check if already liked
            const { data: existingLike } = await supabase
                .from('food_hunt_likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .single();

            if (existingLike) {
                // Unlike
                await supabase
                    .from('food_hunt_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userId);

                // Decrement count (optimistic update handled in UI, this is for consistency)
                await supabase.rpc('decrement_food_hunt_likes', { post_id: postId });
            } else {
                // Like
                await supabase
                    .from('food_hunt_likes')
                    .insert({
                        post_id: postId,
                        user_id: userId
                    });

                // Increment count
                await supabase.rpc('increment_food_hunt_likes', { post_id: postId });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    /**
     * Delete a food hunt post
     */
    static async deletePost(postId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('food_hunt_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting food hunt post:', error);
            return false;
        }
    }

    /**
     * Subscribe to real-time updates for food hunt posts in a specific pincode
     */
    static subscribeToUpdates(
        pincode: string,
        onUpdate: (payload: any) => void
    ): () => void {
        const channelName = `food_hunt_${pincode}`;

        // Unsubscribe from existing channel if it exists
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'food_hunt_posts',
                    filter: `pincode=eq.${pincode}`,
                },
                (payload) => {
                    console.log('Food hunt update:', payload);
                    onUpdate(payload);
                }
            )
            .subscribe();

        this.subscriptions.set(channelName, channel);

        // Return unsubscribe function
        return () => this.unsubscribe(channelName);
    }

    /**
     * Upload an image for a food hunt post
     */
    static async uploadImage(file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `food_hunt/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('post_images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('post_images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from a specific channel
     */
    static unsubscribe(channelName: string): void {
        const channel = this.subscriptions.get(channelName);
        if (channel) {
            supabase.removeChannel(channel);
            this.subscriptions.delete(channelName);
        }
    }
}
