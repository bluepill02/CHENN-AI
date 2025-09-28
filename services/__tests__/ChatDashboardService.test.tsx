import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Conversation, Message } from '../../src/services/ChatService';
import { ChatDashboardProvider, useChatDashboard } from '../ChatDashboardService';

jest.mock('../../src/services/ChatService', () => {
  const fallbackConversations: Conversation[] = [
    {
      id: 1,
      type: 'group',
      name: 'Anna Nagar Foodies',
      lastMessage: 'Meera: New filter coffee stall near Tower Park! ☕',
      time: '30 min',
      unread: 5,
      members: 102,
      isActive: true,
      area: 'Anna Nagar',
      pincode: '600040',
      tags: ['Food', 'Recommendations'],
      language: 'Tamil + English',
      sentiment: 'positive',
    },
    {
      id: 2,
      type: 'announcement',
      name: 'T. Nagar Updates',
      lastMessage: 'Water supply will be affected tomorrow 10 AM - 2 PM',
      time: '1 hour',
      unread: 0,
      isOfficial: true,
      verified: true,
      area: 'T. Nagar',
      pincode: '600017',
      tags: ['Utilities', 'Urgent'],
      sentiment: 'urgent',
    },
  ];

  const messageMap: Record<number, Message[]> = {
    1: [
      { id: 1, sender: 'Meera', message: 'Coffee meetup at 5?', time: '5:30 PM' },
      { id: 2, sender: 'Arun', message: 'Count me in!', time: '5:32 PM' },
      { id: 3, sender: 'Me', message: 'See you there!', time: '5:33 PM', isMe: true },
    ],
    2: [
      { id: 4, sender: 'Corporation', message: 'Maintenance work tomorrow', time: '9:00 AM' },
      { id: 5, sender: 'Corporation', message: 'Water will resume by 2 PM', time: '9:05 AM' },
    ],
  };

  return {
    getConversations: jest.fn(async () => fallbackConversations),
    getMessages: jest.fn(async (conversationId: number) => messageMap[conversationId] ?? []),
    sendMessage: jest.fn(async () => ({
      id: Date.now(),
      sender: 'Me',
      message: 'Dummy',
      time: 'Just now',
      isMe: true,
    })),
    getConversationById: jest.fn(async (conversationId: number) => fallbackConversations.find(conv => conv.id === conversationId) ?? null),
    updateConversation: jest.fn(async () => undefined),
    replaceConversations: jest.fn(async () => undefined),
    persistMessage: jest.fn(async () => undefined),
    saveMessages: jest.fn(async () => undefined),
  };
});

const mockedChatService = jest.requireMock('../../src/services/ChatService');

const originalFetch = globalThis.fetch;

afterEach(() => {
  jest.clearAllMocks();
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  } else {
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  }
});

afterAll(() => {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  } else {
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  }
});

function TestHarness() {
  const { conversations, analytics, isUsingBackend, error } = useChatDashboard();
  return (
    <div>
      <span data-testid="conversation-count">{conversations.length}</span>
      <span data-testid="total-conversations">{analytics.totalConversations}</span>
      <span data-testid="total-messages">{analytics.totalMessages}</span>
      <span data-testid="urgent-count">{analytics.sentimentSummary.urgent}</span>
      <span data-testid="source">{isUsingBackend ? 'backend' : 'local'}</span>
      <span data-testid="error">{error ?? ''}</span>
    </div>
  );
}

test('falls back to local data when backend fetch fails and computes analytics', async () => {
  const fetchMock = jest.fn().mockRejectedValue(new Error('Network down'));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  render(
    <ChatDashboardProvider>
      <TestHarness />
    </ChatDashboardProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('conversation-count').textContent).toBe('2');
  });

  expect(screen.getByTestId('source').textContent).toBe('local');
  expect(screen.getByTestId('error').textContent).toContain('unreachable');
  expect(screen.getByTestId('total-conversations').textContent).toBe('2');
  expect(screen.getByTestId('total-messages').textContent).toBe('5');
  expect(screen.getByTestId('urgent-count').textContent).toBe('1');

  expect(mockedChatService.getConversations).toHaveBeenCalled();
  expect(mockedChatService.getMessages).toHaveBeenCalledTimes(2);
});

function FilterHarness() {
  const { conversations, setFilters } = useChatDashboard();
  return (
    <div>
      <span data-testid="filtered-count">{conversations.length}</span>
      <button data-testid="filter-anna" onClick={() => setFilters({ query: 'anna' })}>
        Filter Anna
      </button>
      <button data-testid="clear" onClick={() => setFilters({ query: '' })}>
        Clear
      </button>
    </div>
  );
}

test('applies query filter to narrow conversations by locality name or tags', async () => {
  const fetchMock = jest.fn().mockRejectedValue(new Error('API offline'));
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  render(
    <ChatDashboardProvider>
      <FilterHarness />
    </ChatDashboardProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('filtered-count').textContent).toBe('2');
  });

  fireEvent.click(screen.getByTestId('filter-anna'));

  await waitFor(() => {
    expect(screen.getByTestId('filtered-count').textContent).toBe('1');
  });

  fireEvent.click(screen.getByTestId('clear'));

  await waitFor(() => {
    expect(screen.getByTestId('filtered-count').textContent).toBe('2');
  });
});
