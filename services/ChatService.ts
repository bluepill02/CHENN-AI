import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
    id: string;
    created_at: string;
    content: string;
    sender_id: string;
    chat_id: string;
    is_read: boolean;

    // Joined profile data
    profiles?: {
        id: string;
        full_name: string;
        avatar_url?: string;
    };
}

export interface SendMessageData {
    content: string;
    chat_id: string;
}

export class ChatService {
    private static subscriptions: Map<string, RealtimeChannel> = new Map();

    /**
     * Get messages for a specific chat
     */
    static async getMessages(chatId: string): Promise<Message[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          profiles:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    /**
     * Send a new message
     */
    static async sendMessage(
        content: string,
        chatId: string,
        senderId: string
    ): Promise<Message | null> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    content,
                    chat_id: chatId,
                    sender_id: senderId,
                    is_read: false,
                })
                .select(`
          *,
          profiles:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(messageIds: string[]): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .in('id', messageIds);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return false;
        }
    }

    /**
     * Subscribe to real-time messages for a specific chat
     */
    static subscribeToChat(
        chatId: string,
        onNewMessage: (message: Message) => void
    ): () => void {
        const channelName = `chat_${chatId}`;

        // Unsubscribe from existing channel if it exists
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                async (payload) => {
                    console.log('New message:', payload);

                    // Fetch the full message with profile data
                    const { data } = await supabase
                        .from('messages')
                        .select(`
              *,
              profiles:sender_id (
                id,
                full_name,
                avatar_url
              )
            `)
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        onNewMessage(data);
                    }
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
     * Get unread message count for a chat
     */
    static async getUnreadCount(chatId: string, userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('chat_id', chatId)
                .eq('is_read', false)
                .neq('sender_id', userId);

            if (error) throw error;

            return count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Get all conversations for a user
     */
    static async getConversations(userId: string): Promise<any[]> {
        // First get all chat IDs the user is part of
        const { data: participations, error: partError } = await supabase
            .from('chat_participants')
            .select('chat_id')
            .eq('user_id', userId);

        if (partError) throw partError;

        const chatIds = participations.map(p => p.chat_id);

        if (chatIds.length === 0) return [];

        // Then fetch the chat details
        const { data: chats, error: chatError } = await supabase
            .from('chat_groups')
            .select('*')
            .in('id', chatIds)
            .order('created_at', { ascending: false });

        if (chatError) throw chatError;

        // For each chat, get the last message and other participants (for 1-on-1 names)
        const conversations = await Promise.all(chats.map(async (chat) => {
            // Get last message
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('content, created_at, is_read, sender_id')
                .eq('chat_id', chat.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Get unread count
            const unreadCount = await this.getUnreadCount(chat.id, userId);

            // If it's not a named group (i.e., 1-on-1), find the other user's name
            let chatName = chat.name;
            let chatImage = chat.image_url;

            if (!chat.is_public && !chat.name) { // Assuming private chats might not have names initially
                const { data: otherPart } = await supabase
                    .from('chat_participants')
                    .select('profiles(full_name, avatar_url)')
                    .eq('chat_id', chat.id)
                    .neq('user_id', userId)
                    .single();

                if (otherPart && otherPart.profiles) {
                    const profile = Array.isArray(otherPart.profiles) ? otherPart.profiles[0] : otherPart.profiles;
                    if (profile) {
                        chatName = profile.full_name;
                        chatImage = profile.avatar_url;
                    }
                }
            }

            return {
                ...chat,
                name: chatName,
                image_url: chatImage,
                lastMessage: lastMsg?.content || 'No messages yet',
                time: lastMsg?.created_at,
                unread: unreadCount,
                isActive: unreadCount > 0 // Simple logic for now
            };
        }));

        return conversations;
    }

    /**
     * Create a new group chat
     */
    static async createGroup(name: string, description: string, creatorId: string, isPublic: boolean = false): Promise<string | null> {
        // 1. Create group
        const { data: group, error: groupError } = await supabase
            .from('chat_groups')
            .insert({
                name,
                description,
                created_by: creatorId,
                is_public: isPublic
            })
            .select('id')
            .single();

        if (groupError) throw groupError;

        // 2. Add creator as admin
        const { error: partError } = await supabase
            .from('chat_participants')
            .insert({
                chat_id: group.id,
                user_id: creatorId,
                role: 'admin'
            });

        if (partError) throw partError;

        return group.id;
    }

    /**
     * Start a direct chat with another user
     */
    static async startDirectChat(currentUserId: string, otherUserId: string): Promise<string> {
        // Check if a direct chat already exists
        // This is complex in SQL, simpler to just create a new one or check client-side for now
        // For MVP, we'll create a new private group for them

        // 1. Create private group
        const { data: group, error: groupError } = await supabase
            .from('chat_groups')
            .insert({
                name: '', // Empty name for 1-on-1, will be dynamic
                is_public: false
            })
            .select('id')
            .single();

        if (groupError) throw groupError;

        // 2. Add both users
        const { error: partError } = await supabase
            .from('chat_participants')
            .insert([
                { chat_id: group.id, user_id: currentUserId },
                { chat_id: group.id, user_id: otherUserId }
            ]);

        if (partError) throw partError;

        return group.id;
    }

    /**
     * Get all public groups
     */
    static async getPublicGroups(): Promise<any[]> {
        const { data, error } = await supabase
            .from('chat_groups')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Join a group
     */
    static async joinGroup(chatId: string, userId: string): Promise<void> {
        // Check if already a member
        const { data: existing } = await supabase
            .from('chat_participants')
            .select('*')
            .eq('chat_id', chatId)
            .eq('user_id', userId)
            .single();

        if (existing) return;

        const { error } = await supabase
            .from('chat_participants')
            .insert({
                chat_id: chatId,
                user_id: userId,
                role: 'member'
            });

        if (error) throw error;
    }

    /**
     * Delete a message (only by sender)
     */
    static async deleteMessage(messageId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;

            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }
}
