import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    getConversationById,
    getConversations as getConversationsLocal,
    getMessages as getMessagesLocal,
    persistMessage,
    replaceConversations,
    saveMessages,
    sendMessage as sendMessageLocal,
    updateConversation as updateConversationLocal,
    type Conversation,
    type Message,
} from '../src/services/ChatService';

type ConversationTypeFilter = 'all' | 'group' | 'announcement' | 'direct';
type SentimentFilter = 'all' | 'positive' | 'neutral' | 'urgent';

export interface ChatFilters {
  query: string;
  area: string | null;
  type: ConversationTypeFilter;
  unreadOnly: boolean;
  officialOnly: boolean;
  verifiedOnly: boolean;
  sentiment: SentimentFilter;
}

export interface LocalityBreakdown {
  area: string;
  pincode?: string;
  conversations: number;
  unread: number;
  sentimentCounts: Record<'positive' | 'neutral' | 'urgent', number>;
  topTags: string[];
}

export interface ChatAnalytics {
  totalConversations: number;
  totalMessages: number;
  unreadConversations: number;
  officialFeeds: number;
  verifiedCommunities: number;
  activeNow: number;
  busiestArea?: string | null;
  trendingTag?: string | null;
  localityBreakdown: LocalityBreakdown[];
  sentimentSummary: Record<'positive' | 'neutral' | 'urgent', number>;
}

export interface ChatDashboardContextValue {
  conversations: Conversation[];
  allConversations: Conversation[];
  selectedConversation: Conversation | null;
  selectedConversationId: number | null;
  messages: Message[];
  filters: ChatFilters;
  analytics: ChatAnalytics;
  loading: boolean;
  messagesLoading: boolean;
  error: string | null;
  isUsingBackend: boolean;
  lastSync: Date | null;
  refresh: () => Promise<void>;
  selectConversation: (conversationId: number | null) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setFilters: (
    updates:
      | Partial<ChatFilters>
      | ((previous: ChatFilters) => Partial<ChatFilters>)
  ) => void;
  clearFilters: () => void;
  updateConversation: (conversationId: number, patch: Partial<Conversation>) => Promise<void>;
  getConversation: (conversationId: number) => Conversation | undefined;
}

const defaultFilters: ChatFilters = Object.freeze({
  query: '',
  area: null,
  type: 'all' as ConversationTypeFilter,
  unreadOnly: false,
  officialOnly: false,
  verifiedOnly: false,
  sentiment: 'all' as SentimentFilter,
});

const ChatDashboardContext = createContext<ChatDashboardContextValue | undefined>(undefined);

function normalizeFilters(input: Partial<ChatFilters>): ChatFilters {
  const type: ConversationTypeFilter = ['group', 'announcement', 'direct', 'all'].includes(
    input.type as ConversationTypeFilter
  )
    ? (input.type as ConversationTypeFilter)
    : 'all';

  const sentiment: SentimentFilter = ['positive', 'neutral', 'urgent', 'all'].includes(
    input.sentiment as SentimentFilter
  )
    ? (input.sentiment as SentimentFilter)
    : 'all';

  return {
    query: (input.query ?? '').trim(),
    area: input.area ? input.area.trim() || null : null,
    type,
    unreadOnly: Boolean(input.unreadOnly),
    officialOnly: Boolean(input.officialOnly),
    verifiedOnly: Boolean(input.verifiedOnly),
    sentiment,
  };
}

function normalizeConversationPayload(payload: any): Conversation {
  const safeType: Conversation['type'] = ['group', 'announcement', 'direct'].includes(payload?.type)
    ? payload.type
    : 'group';

  return {
    id: Number(payload?.id ?? Date.now()),
    type: safeType,
    name: payload?.name ?? 'Unnamed Conversation',
    lastMessage: payload?.lastMessage ?? payload?.summary ?? '—',
    time: payload?.time ?? 'Just now',
    unread: Number(payload?.unread ?? 0),
    members: payload?.members ? Number(payload.members) : undefined,
    isActive: Boolean(payload?.isActive),
    isOfficial: Boolean(payload?.isOfficial),
    verified: Boolean(payload?.verified ?? payload?.isVerified),
    area: payload?.area ?? payload?.locality ?? payload?.location ?? undefined,
    pincode: payload?.pincode ?? payload?.pin_code ?? undefined,
    language: payload?.language ?? payload?.lang ?? undefined,
    location: payload?.location ?? payload?.area ?? undefined,
    tags: Array.isArray(payload?.tags)
      ? payload.tags.map((tag: unknown) => String(tag))
      : payload?.category
      ? [String(payload.category)]
      : undefined,
    lastActiveAt: payload?.lastActiveAt ?? payload?.last_activity ?? undefined,
    sentiment: ['positive', 'neutral', 'urgent'].includes(payload?.sentiment)
      ? payload.sentiment
      : undefined,
  };
}

function normalizeMessagePayload(payload: any, fallbackId: number): Message {
  return {
    id: Number(payload?.id ?? fallbackId ?? Date.now()),
    sender: payload?.sender ?? payload?.from ?? 'Community',
    message: payload?.message ?? payload?.text ?? '',
    time:
      payload?.time ??
      (payload?.createdAt
        ? new Date(payload.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    isMe: payload?.sender === 'Me' || payload?.from === 'Me' || payload?.isMe === true,
    deliveredAt: payload?.deliveredAt ?? payload?.createdAt ?? new Date().toISOString(),
  };
}

interface ChatDashboardProviderProps {
  children: ReactNode;
  initialFilters?: Partial<ChatFilters>;
}

export function ChatDashboardProvider({ children, initialFilters }: ChatDashboardProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filters, setFiltersState] = useState<ChatFilters>(() =>
    normalizeFilters({ ...defaultFilters, ...initialFilters })
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  const messageCountsRef = useRef<Map<number, number>>(new Map());
  const latestFiltersRef = useRef<ChatFilters>(filters);

  useEffect(() => {
    latestFiltersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    if (initialFilters) {
      setFiltersState(prev => normalizeFilters({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/conversations');
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
      const payload = await response.json();
      const normalized = Array.isArray(payload)
        ? payload.map(item => normalizeConversationPayload(item))
        : [];

      setConversations(normalized);
      await replaceConversations(normalized);
      setIsUsingBackend(true);
      setLastSync(new Date());

      // Preload message counts from backend response if available
      if (Array.isArray(payload)) {
        const nextMessageCounts = new Map<number, number>();
        payload.forEach((item: any, index: number) => {
          const id = Number(item?.id ?? normalized[index]?.id);
          if (id && Array.isArray(item?.messages)) {
            nextMessageCounts.set(id, item.messages.length);
            const normalizedMessages = item.messages.map((message: any, msgIndex: number) =>
              normalizeMessagePayload(message, msgIndex + 1)
            );
            void saveMessages(id, normalizedMessages);
          }
        });
        messageCountsRef.current = nextMessageCounts;
      }
    } catch (backendError) {
      console.warn('[ChatDashboard] Falling back to Chennai community simulation', backendError);
      const localConversations = await getConversationsLocal();
      setConversations(localConversations);
      setIsUsingBackend(false);
      setLastSync(new Date());
      setError('Chennai chat backend unreachable. Showing the latest community snapshot.');

      const counts = new Map<number, number>();
      await Promise.all(
        localConversations.map(async conversation => {
          const localMessages = await getMessagesLocal(conversation.id);
          counts.set(conversation.id, localMessages.length);
        })
      );
      messageCountsRef.current = counts;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: number) => {
      setMessagesLoading(true);

      try {
        const response = await fetch(`/api/chat/${conversationId}/messages`);
        if (!response.ok) {
          throw new Error(`Backend responded with status ${response.status}`);
        }

        const payload = await response.json();
        const normalized = Array.isArray(payload)
          ? payload.map((message: any, index: number) => normalizeMessagePayload(message, index + 1))
          : [];

        setMessages(normalized);
        messageCountsRef.current.set(conversationId, normalized.length);
        await saveMessages(conversationId, normalized);
        setIsUsingBackend(true);
      } catch (backendError) {
        console.warn('[ChatDashboard] Loading messages from local storage', backendError);
        const fallbackMessages = await getMessagesLocal(conversationId);
        setMessages(fallbackMessages);
        messageCountsRef.current.set(conversationId, fallbackMessages.length);
        setIsUsingBackend(false);
      } finally {
        setMessagesLoading(false);
      }
    },
    []
  );

  const selectConversation = useCallback(
    async (conversationId: number | null) => {
      setSelectedConversationId(conversationId);

      if (conversationId == null) {
        setMessages([]);
        return;
      }

      await loadMessages(conversationId);
      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unread: 0,
              }
            : conversation
        )
      );
      await updateConversationLocal(conversationId, { unread: 0 });
    },
    [loadMessages]
  );

  const updateConversation = useCallback(
    async (conversationId: number, patch: Partial<Conversation>) => {
      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === conversationId ? { ...conversation, ...patch } : conversation
        )
      );

      await updateConversationLocal(conversationId, patch);

      if (isUsingBackend) {
        try {
          await fetch(`/api/chat/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          });
        } catch (backendError) {
          console.warn('[ChatDashboard] Unable to sync conversation update to backend', backendError);
        }
      }
    },
    [isUsingBackend]
  );

  const getConversation = useCallback(
    (conversationId: number) => conversations.find(conversation => conversation.id === conversationId),
    [conversations]
  );

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || selectedConversationId == null) {
      return;
    }

    const localMessage = await sendMessageLocal(selectedConversationId, {
      sender: 'Me',
      message: trimmed,
    });

    setMessages(prev => [...prev, localMessage]);
    messageCountsRef.current.set(
      selectedConversationId,
      (messageCountsRef.current.get(selectedConversationId) ?? 0) + 1
    );

    const updatedConversation = await getConversationById(selectedConversationId);
    if (updatedConversation) {
      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === selectedConversationId ? updatedConversation : conversation
        )
      );
    }

    try {
      const response = await fetch(`/api/chat/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizeMessagePayload(payload?.message ?? payload, localMessage.id);

      const mergedMessage: Message = { ...localMessage, ...normalized, isMe: true };
      setMessages(prev => prev.map(message => (message.id === localMessage.id ? mergedMessage : message)));
      await persistMessage(selectedConversationId, mergedMessage, {
        lastMessage: `Me: ${trimmed}`,
        time: 'Just now',
        unread: 0,
        lastActiveAt: mergedMessage.deliveredAt,
      });

      setIsUsingBackend(true);
      setLastSync(new Date());
    } catch (backendError) {
      console.warn('[ChatDashboard] Message sent in offline mode', backendError);
      setIsUsingBackend(false);
      setError('Message queued locally. It will sync once the Chennai chat backend reconnects.');
    }
  }, [selectedConversationId]);

  const setFilters = useCallback(
    (
      updates:
        | Partial<ChatFilters>
        | ((previous: ChatFilters) => Partial<ChatFilters>)
    ) => {
      setFiltersState(prev => {
        const patch = typeof updates === 'function' ? updates(prev) : updates;
        return normalizeFilters({ ...prev, ...patch });
      });
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredConversations = useMemo(() => {
    const { query, area, type, unreadOnly, officialOnly, verifiedOnly, sentiment } = filters;
    const loweredQuery = query.toLowerCase();
    const loweredArea = area ? area.toLowerCase() : null;

    return conversations.filter(conversation => {
      if (type !== 'all' && conversation.type !== type) {
        return false;
      }

      if (loweredArea) {
        const areaMatch =
          conversation.area?.toLowerCase() === loweredArea ||
          conversation.location?.toLowerCase() === loweredArea;
        if (!areaMatch) {
          return false;
        }
      }

      if (sentiment !== 'all' && conversation.sentiment !== sentiment) {
        return false;
      }

      if (unreadOnly && conversation.unread === 0) {
        return false;
      }

      if (officialOnly && !conversation.isOfficial) {
        return false;
      }

      if (verifiedOnly && !conversation.verified) {
        return false;
      }

      if (loweredQuery) {
        const hayStack = [
          conversation.name,
          conversation.lastMessage,
          conversation.area,
          conversation.location,
          conversation.pincode,
          ...(conversation.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!hayStack.includes(loweredQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [conversations, filters]);

  const selectedConversation = useMemo(
    () =>
      selectedConversationId == null
        ? null
        : conversations.find(conversation => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const analytics = useMemo<ChatAnalytics>(() => {
    const totalConversations = conversations.length;
    const unreadConversations = conversations.filter(conversation => conversation.unread > 0).length;
    const officialFeeds = conversations.filter(conversation => conversation.isOfficial).length;
    const verifiedCommunities = conversations.filter(conversation => conversation.verified).length;
    const sentimentSummary: Record<'positive' | 'neutral' | 'urgent', number> = {
      positive: 0,
      neutral: 0,
      urgent: 0,
    };

    const localityAccumulator = new Map<
      string,
      {
        pincode?: string;
        conversations: number;
        unread: number;
        sentiments: Record<'positive' | 'neutral' | 'urgent', number>;
        tagCounts: Map<string, number>;
      }
    >();

    const tagCounts = new Map<string, number>();
    const now = Date.now();

    let activeNow = 0;

    conversations.forEach(conversation => {
      if (conversation.isActive) {
        activeNow += 1;
      } else if (conversation.lastActiveAt) {
        const diffMs = now - new Date(conversation.lastActiveAt).getTime();
        if (diffMs < 10 * 60 * 1000) {
          activeNow += 1;
        }
      }

      const areaKey = conversation.area?.trim() || conversation.location?.trim() || 'Other Chennai';
      const entry =
        localityAccumulator.get(areaKey) ?? {
          pincode: conversation.pincode,
          conversations: 0,
          unread: 0,
          sentiments: { positive: 0, neutral: 0, urgent: 0 } as Record<'positive' | 'neutral' | 'urgent', number>,
          tagCounts: new Map<string, number>(),
        };
      entry.conversations += 1;
      entry.unread += conversation.unread;
      if (!entry.pincode && conversation.pincode) {
        entry.pincode = conversation.pincode;
      }

      if (conversation.sentiment) {
        sentimentSummary[conversation.sentiment] += 1;
        entry.sentiments[conversation.sentiment] += 1;
      }

      if (conversation.tags) {
        conversation.tags.forEach(tag => {
          entry.tagCounts.set(tag, (entry.tagCounts.get(tag) ?? 0) + 1);
          tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
        });
      }

      localityAccumulator.set(areaKey, entry);
    });

    const localityBreakdown: LocalityBreakdown[] = Array.from(localityAccumulator.entries()).map(
      ([area, entry]) => ({
        area,
        pincode: entry.pincode,
        conversations: entry.conversations,
        unread: entry.unread,
        sentimentCounts: entry.sentiments,
        topTags: Array.from(entry.tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag),
      })
    );

    const busiestAreaEntry = localityBreakdown.reduce<LocalityBreakdown | null>(
      (mostActive, current) => {
        if (!mostActive) {
          return current;
        }
        if (current.conversations > mostActive.conversations) {
          return current;
        }
        return mostActive;
      },
      null
    );

    const trendingTagEntry = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])[0];

    const totalMessages = Array.from(messageCountsRef.current.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalConversations,
      totalMessages,
      unreadConversations,
      officialFeeds,
      verifiedCommunities,
      activeNow,
      busiestArea: busiestAreaEntry?.area ?? null,
      trendingTag: trendingTagEntry?.[0] ?? null,
      localityBreakdown,
      sentimentSummary,
    };
  }, [conversations]);

  const contextValue: ChatDashboardContextValue = {
    conversations: filteredConversations,
    allConversations: conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    filters,
    analytics,
    loading,
    messagesLoading,
    error,
    isUsingBackend,
    lastSync,
    refresh,
    selectConversation,
    sendMessage,
    setFilters,
    clearFilters,
    updateConversation,
    getConversation,
  };

  return (
    <ChatDashboardContext.Provider value={contextValue}>
      {children}
    </ChatDashboardContext.Provider>
  );
}

export function useChatDashboard() {
  const context = useContext(ChatDashboardContext);
  if (!context) {
    throw new Error('useChatDashboard must be used within a ChatDashboardProvider');
  }
  return context;
}

export default ChatDashboardProvider;