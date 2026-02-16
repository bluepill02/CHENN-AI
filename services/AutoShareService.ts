import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface AutoSharePost {
    id: string;
    created_at: string;
    updated_at: string;
    expires_at: string;
    user_id: string;
    from_location: string;
    to_location: string;
    seats_available: number;
    pincode: string;
    area?: string;
    departure_time?: string;
    vehicle_type: 'auto' | 'car' | 'bike';
    fare_sharing: boolean;
    notes?: string;
    status: 'active' | 'filled' | 'cancelled' | 'expired';
    views_count: number;
    contact_via: 'chat' | 'phone' | 'both';
    phone_number?: string;

    // Joined profile data
    profiles?: {
        id: string;
        full_name: string;
        avatar_url?: string;
        area?: string;
    };
}

export interface CreateAutoSharePostData {
    from_location: string;
    to_location: string;
    seats_available: number;
    pincode: string;
    area?: string;
    departure_time?: string;
    vehicle_type?: 'auto' | 'car' | 'bike';
    fare_sharing?: boolean;
    notes?: string;
    contact_via?: 'chat' | 'phone' | 'both';
    phone_number?: string;
}

export interface UpdateAutoSharePostData {
    from_location?: string;
    to_location?: string;
    seats_available?: number;
    departure_time?: string;
    notes?: string;
    status?: 'active' | 'filled' | 'cancelled';
    fare_sharing?: boolean;
    contact_via?: 'chat' | 'phone' | 'both';
    phone_number?: string;
    vehicle_type?: 'auto' | 'car' | 'bike';
}

export class AutoShareService {
    private static subscriptions: Map<string, RealtimeChannel> = new Map();

    /**
     * Get active auto share posts for a specific pincode
     */
    static async getPosts(pincode: string): Promise<AutoSharePost[]> {
        try {
            const { data, error } = await supabase
                .from('auto_share_posts')
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
                .in('status', ['active', 'filled'])
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching auto share posts:', error);
            throw error;
        }
    }

    /**
     * Get a single auto share post by ID
     */
    static async getPost(id: string): Promise<AutoSharePost | null> {
        try {
            const { data, error } = await supabase
                .from('auto_share_posts')
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            area
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching auto share post:', error);
            return null;
        }
    }

    /**
     * Create a new auto share post
     */
    static async createPost(
        postData: CreateAutoSharePostData,
        userId: string
    ): Promise<AutoSharePost | null> {
        try {
            // Calculate expiry time (30 minutes from now)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 30);

            const { data, error } = await supabase
                .from('auto_share_posts')
                .insert({
                    ...postData,
                    user_id: userId,
                    vehicle_type: postData.vehicle_type || 'auto',
                    fare_sharing: postData.fare_sharing !== undefined ? postData.fare_sharing : true,
                    contact_via: postData.contact_via || 'chat',
                    phone_number: postData.phone_number,
                    expires_at: expiresAt.toISOString(),
                    status: 'active',
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
            console.error('Error creating auto share post:', error);
            throw error;
        }
    }

    /**
     * Update an existing auto share post
     */
    static async updatePost(
        postId: string,
        updateData: UpdateAutoSharePostData
    ): Promise<AutoSharePost | null> {
        try {
            const { data, error } = await supabase
                .from('auto_share_posts')
                .update(updateData)
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
            console.error('Error updating auto share post:', error);
            throw error;
        }
    }

    /**
     * Delete an auto share post
     */
    static async deletePost(postId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('auto_share_posts')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting auto share post:', error);
            return false;
        }
    }

    /**
     * Cancel an auto share post (soft delete)
     */
    static async cancelPost(postId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('auto_share_posts')
                .update({ status: 'cancelled' })
                .eq('id', postId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error cancelling auto share post:', error);
            return false;
        }
    }

    /**
     * Mark a post as filled
     */
    static async markAsFilled(postId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('auto_share_posts')
                .update({ status: 'filled' })
                .eq('id', postId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error marking post as filled:', error);
            return false;
        }
    }

    /**
     * Increment view count
     */
    static async incrementViewCount(postId: string): Promise<void> {
        try {
            await supabase.rpc('increment_auto_share_views', { post_id: postId });
        } catch (error) {
            console.error('Error incrementing view count:', error);
        }
    }

    /**
     * Subscribe to real-time updates for auto share posts in a specific pincode
     */
    static subscribeToUpdates(
        pincode: string,
        onUpdate: (payload: any) => void
    ): () => void {
        const channelName = `auto_share_${pincode}`;

        // Unsubscribe from existing channel if it exists
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'auto_share_posts',
                    filter: `pincode=eq.${pincode}`,
                },
                (payload) => {
                    console.log('Auto share update:', payload);
                    onUpdate(payload);
                }
            )
            .subscribe();

        this.subscriptions.set(channelName, channel);

        // Return unsubscribe function
        return () => this.unsubscribe(channelName);
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

    /**
     * Unsubscribe from all channels
     */
    static unsubscribeAll(): void {
        this.subscriptions.forEach((channel) => {
            supabase.removeChannel(channel);
        });
        this.subscriptions.clear();
    }

    /**
     * Run the expiry function manually (useful for testing)
     */
    static async expireOldPosts(): Promise<void> {
        try {
            await supabase.rpc('expire_old_auto_share_posts');
        } catch (error) {
            console.error('Error expiring old posts:', error);
        }
    }

    /**
     * Get user's own posts
     */
    static async getUserPosts(userId: string): Promise<AutoSharePost[]> {
        try {
            const { data, error } = await supabase
                .from('auto_share_posts')
                .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            area
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error;
        }
    }
}
