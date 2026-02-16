import { supabase } from './supabaseClient';

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[]; // Stored as JSONB or array in DB
    correct_answer: number; // Index
    explanation?: string;
}

export interface DailyQuote {
    id: string;
    content: string;
    author?: string;
    category?: string;
}

export const QuizService = {
    /**
     * Get all quiz questions
     */
    async getQuestions(): Promise<QuizQuestion[]> {
        const { data, error } = await supabase
            .from('quiz_questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching quiz questions:', error);
            return [];
        }

        return data || [];
    },

    /**
     * Get daily quotes
     */
    async getQuotes(): Promise<DailyQuote[]> {
        const { data, error } = await supabase
            .from('daily_quotes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching quotes:', error);
            return [];
        }

        return data || [];
    }
};
