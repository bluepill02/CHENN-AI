import { supabase } from './supabaseClient';

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    area: string;
    category: string;
    organizer_id: string;
    status: 'upcoming' | 'cancelled' | 'completed';
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
    participants_count?: number;
    is_participating?: boolean;
}

export interface CreateEventData {
    title: string;
    description: string;
    date: string;
    location: string;
    area: string;
    category: string;
    organizer_id: string;
}

export const EventService = {
    async getEvents(area?: string): Promise<Event[]> {
        let query = supabase
            .from('events')
            .select(`
                *,
                profiles:organizer_id (full_name, avatar_url),
                participants:event_participants(count)
            `)
            .eq('status', 'upcoming')
            .order('date', { ascending: true });

        if (area) {
            // Simple filter for now, can be improved with PostGIS later
            query = query.ilike('area', `%${area}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Check participation for current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user && data) {
            const eventIds = data.map(e => e.id);
            const { data: participation } = await supabase
                .from('event_participants')
                .select('event_id')
                .eq('user_id', user.id)
                .in('event_id', eventIds);

            const participatingIds = new Set(participation?.map(p => p.event_id));

            return data.map(event => ({
                ...event,
                participants_count: event.participants?.[0]?.count || 0,
                is_participating: participatingIds.has(event.id)
            }));
        }

        return data.map(event => ({
            ...event,
            participants_count: event.participants?.[0]?.count || 0,
            is_participating: false
        }));
    },

    async getMyEvents(userId: string): Promise<Event[]> {
        const { data, error } = await supabase
            .from('event_participants')
            .select(`
                event_id,
                events:event_id (
                    *,
                    profiles:organizer_id (full_name, avatar_url)
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;

        return data.map((item: any) => ({
            ...item.events,
            is_participating: true
        }));
    },

    async getOrganizedEvents(userId: string): Promise<Event[]> {
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                profiles:organizer_id (full_name, avatar_url),
                participants:event_participants(count)
            `)
            .eq('organizer_id', userId)
            .order('date', { ascending: true });

        if (error) throw error;

        return data.map(event => ({
            ...event,
            participants_count: event.participants?.[0]?.count || 0,
            is_participating: true // Organizer is implicitly participating
        }));
    },

    async createEvent(eventData: CreateEventData) {
        const { data, error } = await supabase
            .from('events')
            .insert([eventData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async joinEvent(eventId: string, userId: string) {
        const { error } = await supabase
            .from('event_participants')
            .insert([{ event_id: eventId, user_id: userId }]);

        if (error) throw error;
    },

    async leaveEvent(eventId: string, userId: string) {
        const { error } = await supabase
            .from('event_participants')
            .delete()
            .match({ event_id: eventId, user_id: userId });

        if (error) throw error;
    },

    async cancelEvent(eventId: string) {
        const { error } = await supabase
            .from('events')
            .update({ status: 'cancelled' })
            .eq('id', eventId);

        if (error) throw error;
    },

    subscribeToUpdates(callback: () => void) {
        const subscription = supabase
            .channel('public:events')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, callback)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, callback)
            .subscribe();

        return subscription;
    },

    unsubscribe(subscription: any) {
        supabase.removeChannel(subscription);
    }
};
