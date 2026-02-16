import { supabase } from './supabaseClient';

export interface Profile {
    id: string;
    updated_at?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    area?: string;
    language?: string;
    bio?: string;
    share_location?: boolean;
}

export interface UpdateProfileData {
    full_name?: string;
    avatar_url?: string;
    area?: string;
    username?: string;
    language?: string;
    bio?: string;
    share_location?: boolean;
}

export interface ProfileStats {
    postsCount: number;
    ridesShared: number;
    eventsJoined: number; // Placeholder for now
    trustScore: number;
}

export class ProfileService {
    /**
     * Get a user's profile by ID
     */
    static async getProfile(userId: string): Promise<Profile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Get user stats
     */
    static async getProfileStats(userId: string): Promise<ProfileStats> {
        try {
            // Count posts
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Count auto shares
            const { count: ridesShared } = await supabase
                .from('auto_share_posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Count events joined
            const { count: eventsJoined } = await supabase
                .from('event_participants')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Calculate trust score using Database Function
            let trustScore = 3.0;
            try {
                const { data: scoreData, error: scoreError } = await supabase
                    .rpc('calculate_trust_score', { target_user_id: userId });

                if (!scoreError && scoreData !== null) {
                    trustScore = scoreData;
                }
            } catch (e) {
                console.error('Error fetching trust score:', e);
            }

            return {
                postsCount: postsCount || 0,
                ridesShared: ridesShared || 0,
                eventsJoined: eventsJoined || 0,
                trustScore
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                postsCount: 0,
                ridesShared: 0,
                eventsJoined: 0,
                trustScore: 3.0
            };
        }
    }

    /**
     * Update a user's profile
     */
    static async updateProfile(
        userId: string,
        updates: UpdateProfileData
    ): Promise<Profile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Upload avatar image (placeholder - would need actual file upload implementation)
     */
    static async uploadAvatar(userId: string, file: File): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }
    }

    /**
     * Check if username is available
     */
    static async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
        try {
            let query = supabase
                .from('profiles')
                .select('id')
                .eq('username', username);

            if (currentUserId) {
                query = query.neq('id', currentUserId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return !data || data.length === 0;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    }
}
