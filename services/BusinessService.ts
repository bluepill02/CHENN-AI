import { supabase } from './supabaseClient';

export interface BusinessProfile {
    id: string;
    created_at: string;
    user_id: string;
    business_name: string;
    category: string;
    description: string;
    location: string;
    contact_number: string;
    is_verified: boolean;
    image_url?: string;
    opening_hours?: string;
    price_range?: string;
    rating: number;
    review_count: number;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export interface ServiceReview {
    id: string;
    created_at: string;
    business_id: string;
    user_id: string;
    rating: number;
    review_text: string;
    is_verified_visit: boolean;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export const BusinessService = {
    async getBusinesses(category?: string, location?: string) {
        let query = supabase
            .from('business_profiles')
            .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
            .order('is_verified', { ascending: false })
            .order('rating', { ascending: false })
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (location) {
            // Simple partial match for location
            query = query.ilike('location', `%${location}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as BusinessProfile[];
    },

    async getCategories() {
        // Fetch all businesses to extract unique categories and count them
        // In a larger app, this would be a separate table or a materialized view
        const { data, error } = await supabase
            .from('business_profiles')
            .select('category');

        if (error) throw error;

        const categoryMap = new Map<string, number>();
        data.forEach((item: { category: string }) => {
            const cat = item.category;
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });

        // Convert to array and filter out categories with very few items if needed
        // For now, we show all categories that have at least 1 service
        return Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            count: `${count} services`,
            // We'll assign icons/colors dynamically in the UI or here based on name mapping
            // For simplicity, we'll return the raw data and let UI handle presentation
        }));
    },

    async createBusiness(business: Omit<BusinessProfile, 'id' | 'created_at' | 'is_verified' | 'profiles' | 'rating' | 'review_count'>) {
        const { data, error } = await supabase
            .from('business_profiles')
            .insert(business)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getReviews(businessId: string) {
        const { data, error } = await supabase
            .from('service_reviews')
            .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
            .eq('business_id', businessId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ServiceReview[];
    },

    async addReview(review: Omit<ServiceReview, 'id' | 'created_at' | 'profiles'>) {
        const { data, error } = await supabase
            .from('service_reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
