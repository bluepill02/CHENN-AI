import { supabase } from './supabaseClient';

export interface KaapiJob {
    id: string;
    created_at: string;
    user_id: string;
    job_title: string;
    description: string;
    location: string;
    salary_range: string;
    contact_info: string;
    likes: number;
    profiles?: {
        full_name: string;
        avatar_url: string;
    };
}

export const KaapiJobService = {
    async getJobs() {
        const { data, error } = await supabase
            .from('kaapi_jobs')
            .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as KaapiJob[];
    },

    async createJob(job: Omit<KaapiJob, 'id' | 'created_at' | 'likes' | 'profiles'>) {
        const { data, error } = await supabase
            .from('kaapi_jobs')
            .insert(job)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteJob(id: string) {
        const { error } = await supabase
            .from('kaapi_jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    subscribeToUpdates(callback: () => void) {
        return supabase
            .channel('kaapi_jobs_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'kaapi_jobs'
                },
                () => {
                    callback();
                }
            )
            .subscribe();
    },

    unsubscribe(subscription: any) {
        supabase.removeChannel(subscription);
    }
};
