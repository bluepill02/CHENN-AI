import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ChatDashboardProvider } from '../../services/ChatDashboardService';
import { LanguageProvider } from '../../services/LanguageService';
import { ChatScreen } from '../ChatScreen';

jest.mock('../LanguageToggle', () => ({
  LanguageToggle: () => <div data-testid="language-toggle" />,
}));

jest.mock('../TamilKeyboard', () => ({
  TamilKeyboard: ({ isVisible }: { isVisible: boolean }) =>
    isVisible ? <div data-testid="tamil-keyboard" /> : null,
}));

jest.mock('../IllustratedIcon', () => ({
  IllustratedIcon: ({ alt }: { alt?: string }) => <div data-testid="illustrated-icon">{alt}</div>,
  ChennaiIcons: {
    chat: 'chat',
    group: 'group',
    announcement: 'announcement',
  },
}));

jest.mock('../figma/ImageWithFallback', () => ({
  ImageWithFallback: ({ alt }: { alt?: string }) => <div data-testid="fallback-image">{alt}</div>,
}));

describe('ChatScreen', () => {
  const originalFetch = globalThis.fetch;

  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
  fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
  globalThis.fetch = fetchMock;
    window.localStorage?.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as { fetch?: typeof fetch }).fetch;
    }
  });

  const backendConversations = [
    {
      id: 101,
      type: 'group' as const,
      name: 'Mylapore Cyclone Watch',
      lastMessage: 'Control room: Stay safe indoors',
      time: '5 min',
      unread: 2,
      members: 158,
      isActive: true,
      area: 'Mylapore',
      pincode: '600004',
      tags: ['Weather', 'Alert'],
      sentiment: 'urgent' as const,
      messages: [
        { id: 9001, sender: 'Control room', message: 'Wind speeds touching 80kmph', time: '18:42' }
      ],
    },
    {
      id: 202,
      type: 'announcement' as const,
      name: 'Anna Nagar Night Patrol',
      lastMessage: 'Ward office: Patrol starting at 11 PM',
      time: '12 min',
      unread: 0,
      isOfficial: true,
      verified: true,
      area: 'Anna Nagar',
      pincode: '600040',
      tags: ['Weather', 'Community'],
      sentiment: 'positive' as const,
      messages: [
        { id: 9101, sender: 'Ward office', message: 'Volunteers please assemble', time: '18:30' }
      ],
    },
  ];

  const backendMessages: Record<number, Array<{ id: number; sender: string; message: string; time: string }>> = {
    101: [
      { id: 9001, sender: 'Control room', message: 'Wind speeds touching 80kmph', time: '18:42' },
      { id: 9002, sender: 'Volunteer', message: 'Barricades ready on RK Mutt Road', time: '18:47' },
    ],
    202: [
      { id: 9101, sender: 'Ward office', message: 'Volunteers please assemble', time: '18:30' },
    ],
  };

  function renderChatScreen() {
    return render(
      <LanguageProvider>
        <ChatDashboardProvider>
          <ChatScreen />
        </ChatDashboardProvider>
      </LanguageProvider>
    );
  }

  function jsonResponse(payload: unknown, init?: ResponseInit) {
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  }

  function mockSuccessfulBackend() {
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url === '/api/chat/conversations') {
        return Promise.resolve(jsonResponse(backendConversations));
      }

      const matchMessages = url.match(/\/api\/chat\/(\d+)\/messages/);
      if (matchMessages && (!init || init.method === undefined || init.method === 'GET')) {
        const id = Number(matchMessages[1]);
        return Promise.resolve(jsonResponse(backendMessages[id] ?? []));
      }

      if (matchMessages && init?.method === 'POST') {
        const id = Number(matchMessages[1]);
        const body = init.body ? JSON.parse(init.body.toString()) : { message: '' };
        return Promise.resolve(
          jsonResponse({
            message: {
              id: Date.now(),
              sender: 'Me',
              message: body.message,
              time: 'Just now',
              deliveredAt: new Date().toISOString(),
              conversationId: id,
            },
          })
        );
      }

      return Promise.reject(new Error(`Unhandled fetch for ${url}`));
    });
  }

  test('displays analytics and conversations from backend data', async () => {
    mockSuccessfulBackend();

    renderChatScreen();

    await waitFor(() => {
      expect(screen.getByText('Mylapore Cyclone Watch')).toBeInTheDocument();
      expect(screen.getByText('Anna Nagar Night Patrol')).toBeInTheDocument();
    });

    const totalCard = screen.getByText('Total conversations').closest('div');
    expect(totalCard).not.toBeNull();
    expect(within(totalCard as HTMLElement).getByText('2')).toBeInTheDocument();

    const officialCard = screen.getByText('Official feeds').closest('div');
    expect(officialCard).not.toBeNull();
    expect(within(officialCard as HTMLElement).getByText('1')).toBeInTheDocument();

  expect(screen.getByText('Trending: #Weather')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('/api/chat/conversations');
  });

  test('filters conversations when locality insight is toggled', async () => {
    mockSuccessfulBackend();

    renderChatScreen();

    await screen.findByText('Mylapore Cyclone Watch');

    const annaNagarConversation = screen.getByText('Anna Nagar Night Patrol');
    expect(annaNagarConversation).toBeInTheDocument();

    const localityButton = await screen.findByRole('button', { name: /Mylapore.*600004/ });
    fireEvent.click(localityButton);

    await waitFor(() => {
      expect(screen.queryByText('Anna Nagar Night Patrol')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Mylapore Cyclone Watch')).toBeInTheDocument();

    const clearFilters = screen.getByRole('button', { name: 'Clear filters' });
    fireEvent.click(clearFilters);

    await waitFor(() => {
      expect(screen.getByText('Anna Nagar Night Patrol')).toBeInTheDocument();
    });
  });

  test('loads messages and sends a new message', async () => {
    mockSuccessfulBackend();

    renderChatScreen();

    const conversationButton = await screen.findByRole('button', { name: /Mylapore Cyclone Watch/ });
    fireEvent.click(conversationButton);

    await waitFor(() => {
      expect(screen.getByText('Wind speeds touching 80kmph')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/);
    fireEvent.change(input, { target: { value: 'Vanakkam Chennai' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Vanakkam Chennai')).toBeInTheDocument();
    });

    expect(input).toHaveValue('');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chat/101/messages',
      expect.objectContaining({ method: 'POST' })
    );

    await waitFor(() => {
      expect(screen.getByText(/Me: Vanakkam Chennai/)).toBeInTheDocument();
    });
  });

  test('falls back to local data when backend is unavailable', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    renderChatScreen();

    await waitFor(() => {
      expect(screen.getByText('Chennai chat backend unreachable. Showing the latest community snapshot.')).toBeInTheDocument();
    });

    expect(screen.getByText('Offline community mode — syncing when online')).toBeInTheDocument();
    expect(await screen.findByText('Mylapore Neighbors')).toBeInTheDocument();
  });
});
