import chatConversations from 'figma:asset/d802a9fc88d5797d4e698a0f07c361b2d87a1818.png';
import {
    ArrowLeft,
    Filter,
    Inbox,
    Keyboard,
    MapPin,
    Radio,
    RefreshCcw,
    Send,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useChatDashboard, type ChatFilters } from '../services/ChatDashboardService';
import { useLanguage } from '../services/LanguageService';
import type { Conversation, Message } from '../src/services/ChatService';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChennaiIcons, IllustratedIcon } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { TamilKeyboard } from './TamilKeyboard';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

const sentimentBadgeClasses: Record<'positive' | 'neutral' | 'urgent', string> = {
  positive: 'bg-green-100 text-green-700 border-green-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

function formatRelativeTime(date: Date | null): string {
  if (!date) {
    return 'Syncing...';
  }

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 1000 * 60) {
    const seconds = Math.max(1, Math.round(diffMs / 1000));
    return `${seconds}s ago`;
  }
  if (diffMs < 1000 * 60 * 60) {
    const minutes = Math.round(diffMs / (1000 * 60));
    return `${minutes} min ago`;
  }
  if (diffMs < 1000 * 60 * 60 * 24) {
    const hours = Math.round(diffMs / (1000 * 60 * 60));
    return `${hours} hr ago`;
  }
  return date.toLocaleString();
}

function getConversationIcon(conversation: Conversation) {
  if (conversation.type === 'group') {
    return (
      <IllustratedIcon
        src={ChennaiIcons.group}
        alt="Group Chat"
        size="md"
        fallbackEmoji="👥"
        style="circular"
      />
    );
  }

  if (conversation.type === 'announcement') {
    return (
      <IllustratedIcon
        src={ChennaiIcons.announcement}
        alt="Announcement"
        size="md"
        fallbackEmoji="📢"
        style="circular"
      />
    );
  }

  return (
    <Avatar className="h-12 w-12">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500">
        <span className="text-sm font-semibold text-white">
          {conversation.name
            .split(' ')
            .map(section => section[0])
            .join('')
            .slice(0, 2)}
        </span>
      </div>
    </Avatar>
  );
}

function renderMessageBubble(message: Message) {
  const bubbleBase = 'max-w-xs lg:max-w-md rounded-2xl px-4 py-2 shadow-sm';

  if (message.isMe) {
    return (
      <div className={`${bubbleBase} bg-orange-500 text-white shadow-orange-200`}>
        <p className="text-sm text-white">{message.message}</p>
        <p className="mt-1 text-xs text-orange-100">{message.time}</p>
      </div>
    );
  }

  return (
    <div className={`${bubbleBase} border border-orange-200 bg-card backdrop-blur-sm`}>
      <p className="mb-1 text-xs font-medium text-orange-600">{message.sender}</p>
      <p className="text-sm text-gray-800">{message.message}</p>
      <p className="mt-1 text-xs text-gray-500">{message.time}</p>
    </div>
  );
}

const toggleableFilters: Array<{
  key: 'unreadOnly' | 'officialOnly' | 'verifiedOnly';
  label: string;
}> = [
  { key: 'unreadOnly', label: 'Unread' },
  { key: 'officialOnly', label: 'Official' },
  { key: 'verifiedOnly', label: 'Verified' },
];

const sentimentFilters: Array<{ value: ChatFilters['sentiment']; label: string }> = [
  { value: 'all', label: 'All sentiments' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Informational' },
  { value: 'urgent', label: 'Urgent' },
];

export function ChatScreen() {
  const {
    conversations,
    allConversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    messages,
    sendMessage: sendChatMessage,
    filters,
    setFilters,
    clearFilters,
    analytics,
    loading,
    messagesLoading,
    error,
    isUsingBackend,
    lastSync,
    refresh,
  } = useChatDashboard();
  const { t } = useLanguage();
  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const activeDraft = selectedConversationId != null ? drafts[selectedConversationId] ?? '' : '';

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(filters.query) ||
      Boolean(filters.area) ||
      filters.type !== 'all' ||
      filters.unreadOnly ||
      filters.officialOnly ||
      filters.verifiedOnly ||
      filters.sentiment !== 'all'
    );
  }, [filters]);

  const localityInsights = useMemo(
    () => analytics.localityBreakdown.slice(0, 3),
    [analytics.localityBreakdown]
  );

  const handleDraftChange = (value: string) => {
    if (selectedConversationId == null) {
      return;
    }
    setDrafts(prev => ({ ...prev, [selectedConversationId]: value }));
  };

  const resetDraft = () => {
    if (selectedConversationId == null) {
      return;
    }
    setDrafts(prev => {
      const next = { ...prev };
      delete next[selectedConversationId];
      return next;
    });
  };

  const handleSendMessage = async () => {
    if (!activeDraft.trim()) {
      return;
    }
    await sendChatMessage(activeDraft.trim());
    resetDraft();
    setShowTamilKeyboard(false);
  };

  const isTamilKeyboardEnabled = showTamilKeyboard && selectedConversationId != null;

  const statCards = useMemo(
    () => [
      {
        label: 'Total conversations',
        value: analytics.totalConversations,
        icon: Inbox,
        description: 'Chennai communities connected here',
      },
      {
        label: 'Active now',
        value: analytics.activeNow,
        icon: Sparkles,
        description: 'Chats buzzing in the last 10 min',
      },
      {
        label: 'Official feeds',
        value: analytics.officialFeeds,
        icon: ShieldCheck,
        description: 'Verified civic updates in realtime',
      },
      {
        label: 'Unread conversations',
        value: analytics.unreadConversations,
        icon: Radio,
        description: 'Threads awaiting your reply',
      },
    ],
    [analytics]
  );

  const sentimentSummary = useMemo(
    () => [
      { key: 'positive' as const, label: 'Positive vibe', count: analytics.sentimentSummary.positive },
      { key: 'neutral' as const, label: 'Community updates', count: analytics.sentimentSummary.neutral },
      { key: 'urgent' as const, label: 'Needs attention', count: analytics.sentimentSummary.urgent },
    ],
    [analytics.sentimentSummary]
  );

  const conversationList = conversations;
  const totalConversationCount = allConversations.length;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50 to-yellow-25">
      <div className="pointer-events-none fixed inset-0 opacity-15 md:opacity-10">
        <ImageWithFallback
          src={chatConversations}
          alt="Chennai Chat Conversations"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="rounded-b-[2rem] bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">
                {t('chat.title', 'Chennai Chat Dashboard')}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-orange-100">
                {t(
                  'chat.subtitle',
                  'Track conversations across localities, spot urgent updates, and keep the city talking together.'
                )}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-yellow-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      isUsingBackend ? 'bg-emerald-300' : 'bg-yellow-300'
                    }`}
                  ></span>
                  <span>
                    {isUsingBackend
                      ? 'Live sync with Chennai chat network'
                      : 'Offline community mode — syncing when online'}
                  </span>
                </div>
                <span>• Last updated {formatRelativeTime(lastSync)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <LanguageToggle />
              <Button
                onClick={() => refresh()}
                variant="secondary"
                className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                disabled={loading}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh data
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 pt-4">
            <Card className="border border-orange-200 bg-white/80 p-4 text-sm text-orange-700 shadow-sm">
              {error}
            </Card>
          </div>
        )}

        <div className="flex-1 px-6 pb-24 pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon, description }) => (
                <Card key={label} className="border border-white/60 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-orange-500/80">{label}</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className="rounded-full bg-gradient-to-br from-orange-200 to-orange-100 p-3 text-orange-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{description}</p>
                </Card>
              ))}
            </div>

            <Card className="border border-orange-100 bg-white/80 p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                    <Filter className="h-4 w-4" />
                    <span>Locality lenses</span>
                  </div>
                  <Input
                    value={filters.query}
                    onChange={event => setFilters({ query: event.target.value })}
                    placeholder="Search conversations, tags, or streets"
                    className="max-w-xs flex-1"
                  />
                  <div className="flex flex-wrap gap-2">
                    {toggleableFilters.map(({ key, label }) => (
                      <Button
                        key={key}
                        type="button"
                        variant={filters[key] ? 'default' : 'outline'}
                        className={
                          filters[key]
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'border-orange-200 text-gray-600 hover:bg-orange-50'
                        }
                        onClick={() => setFilters({ [key]: !filters[key] } as Partial<ChatFilters>)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {sentimentFilters.map(({ value, label }) => (
                    <Badge
                      key={value}
                      onClick={() => setFilters({ sentiment: value })}
                      className={`cursor-pointer border px-3 py-1 text-xs font-medium ${
                        filters.sentiment === value
                          ? 'border-orange-400 bg-orange-100 text-orange-700'
                          : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </Badge>
                  ))}

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:bg-orange-50"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>

              {localityInsights.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {localityInsights.map(locality => (
                    <Button
                      key={locality.area}
                      type="button"
                      variant={filters.area === locality.area ? 'default' : 'outline'}
                      className={`justify-start border-orange-200 text-left text-sm ${
                        filters.area === locality.area
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-white/80 text-gray-600 hover:bg-orange-50'
                      }`}
                      onClick={() =>
                        setFilters({ area: filters.area === locality.area ? null : locality.area })
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {locality.area}
                          {locality.pincode ? ` • ${locality.pincode}` : ''}
                        </span>
                        <span className="text-xs text-orange-100 md:text-orange-50">
                          {locality.unread} unread · {locality.conversations} chats
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className="space-y-4">
                <Card className="border border-white/60 bg-white/85 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                      <p className="text-xs text-gray-500">
                        Showing {conversationList.length} of {totalConversationCount} chats
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">
                      {analytics.trendingTag ? `Trending: #${analytics.trendingTag}` : 'Community pulse' }
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {loading && allConversations.length === 0 && (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-16 animate-pulse rounded-xl bg-orange-100/40"
                          ></div>
                        ))}
                      </div>
                    )}

                    {!loading && conversationList.length === 0 && (
                      <Card className="border border-dashed border-orange-200 bg-white/70 p-4 text-sm text-gray-600">
                        <p>No conversations match these filters right now.</p>
                        <Button
                          variant="link"
                          className="px-0 text-orange-600"
                          onClick={clearFilters}
                        >
                          Reset filters and show all chats
                        </Button>
                      </Card>
                    )}

                    {conversationList.map(conversation => {
                      const isSelected = conversation.id === selectedConversationId;
                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => selectConversation(conversation.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? 'border-orange-400 bg-gradient-to-r from-orange-100 to-orange-50 shadow-md'
                              : 'border-orange-100 bg-white/70 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {getConversationIcon(conversation)}
                              {conversation.isActive && (
                                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400"></span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold text-gray-900">
                                    {conversation.name}
                                  </h3>
                                  {conversation.isOfficial && (
                                    <Badge className="bg-blue-100 text-blue-700">Official</Badge>
                                  )}
                                  {conversation.verified && (
                                    <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                                  )}
                                </div>
                                <span className="flex-shrink-0 text-xs text-gray-500">{conversation.time}</span>
                              </div>
                              <p className="mt-1 truncate text-xs text-gray-600">
                                {conversation.lastMessage}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {conversation.area && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {conversation.area}
                                  </span>
                                )}
                                {conversation.members && <span>👥 {conversation.members}</span>}
                                {conversation.sentiment && (
                                  <Badge className={sentimentBadgeClasses[conversation.sentiment]}>
                                    {conversation.sentiment === 'urgent'
                                      ? 'Urgent'
                                      : conversation.sentiment === 'positive'
                                      ? 'Positive'
                                      : 'Update'}
                                  </Badge>
                                )}
                                {conversation.tags?.slice(0, 2).map(tag => (
                                  <span key={tag} className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {conversation.unread > 0 && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="border border-white/60 bg-white/85 p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Sentiment pulse</h2>
                  <div className="mt-4 space-y-2">
                    {sentimentSummary.map(({ key, label, count }) => (
                      <div key={key} className="flex items-center justify-between rounded-xl bg-orange-50/70 px-3 py-2">
                        <span className="text-sm text-gray-700">{label}</span>
                        <Badge className={sentimentBadgeClasses[key]}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="border border-white/60 bg-white/85 p-0 shadow-sm">
                {selectedConversation ? (
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between border-b border-orange-100 bg-gradient-to-r from-orange-400/90 to-orange-500/90 px-4 py-4 text-white">
                      <div className="flex flex-1 items-start gap-3">
                        <button
                          type="button"
                          className="mr-2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 lg:hidden"
                          onClick={() => selectConversation(null)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        {getConversationIcon(selectedConversation)}
                        <div>
                          <h2 className="text-lg font-semibold leading-tight">
                            {selectedConversation.name}
                          </h2>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-orange-100">
                            {selectedConversation.area && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {selectedConversation.area}
                              </span>
                            )}
                            {selectedConversation.members && <span>👥 {selectedConversation.members}</span>}
                            {selectedConversation.isActive && <span className="font-semibold">Active now</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConversation.isOfficial && (
                          <Badge className="bg-blue-100 text-blue-700">Official</Badge>
                        )}
                        {selectedConversation.verified && (
                          <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                      {messagesLoading && (
                        <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className={`h-16 w-3/4 animate-pulse rounded-2xl ${
                                index % 2 === 0 ? 'self-start bg-orange-100/50' : 'self-end bg-orange-200/60'
                              }`}
                            ></div>
                          ))}
                        </div>
                      )}

                      {!messagesLoading && messages.length === 0 && (
                        <div className="mt-12 text-center text-sm text-gray-500">
                          No messages yet—start the conversation for this neighbourhood!
                        </div>
                      )}

                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {renderMessageBubble(message)}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-orange-100 bg-white/95 p-4 backdrop-blur">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => setShowTamilKeyboard(prev => !prev)}
                          variant="outline"
                          size="sm"
                          className={`border-orange-200 ${
                            isTamilKeyboardEnabled ? 'bg-orange-100 text-orange-700' : 'text-gray-600'
                          }`}
                          disabled={selectedConversationId == null}
                        >
                          <Keyboard className="h-4 w-4" />
                        </Button>

                        <Input
                          value={activeDraft}
                          onChange={event => handleDraftChange(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              void handleSendMessage();
                            }
                          }}
                          placeholder="Type your message... • உங்கள் செய்தியை இங்கே எழுதுங்கள்"
                          className="flex-1"
                        />

                        <Button
                          type="button"
                          onClick={() => void handleSendMessage()}
                          className="bg-orange-500 text-white hover:bg-orange-600"
                          disabled={!activeDraft.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <TamilKeyboard
                        onTextChange={handleDraftChange}
                        currentText={activeDraft}
                        isVisible={isTamilKeyboardEnabled}
                        onToggle={() => setShowTamilKeyboard(prev => !prev)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                    <IllustratedIcon
                      src={ChennaiIcons.chat}
                      alt="Chat overview"
                      size="lg"
                      fallbackEmoji="💬"
                      style="rounded"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Pick a conversation to explore neighbourhood buzz
                      </h2>
                      <p className="mt-2 text-sm text-gray-600">
                        Filter by locality, official feeds, or sentiment to prioritise what matters now. Chennai
                        stays vibrant when we tune in together.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                      <Badge className="bg-orange-100 text-orange-700">Tamil keyboard ready</Badge>
                      <Badge className="bg-blue-100 text-blue-700">Live + offline sync</Badge>
                      <Badge className="bg-emerald-100 text-emerald-700">Locality first</Badge>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
