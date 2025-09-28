import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import type { LocalityFilters } from '../../../services/LocalityRatingsService';
import {
    buildLocality,
    buildLocalitySuggestion,
    resetLocalitySequences,
} from '../../../tests/fixtures/localityFixtures';
import type { Locality, LocalitySuggestion } from '../../types/locality';
import LocalityRatingsPage from '../LocalityRatingsPage';

type LocalityAnalytics = {
  total: number;
  averageScore: number;
  highestScore?: number;
  topLocalities: Locality[];
  sourcesBreakdown: Record<string, number>;
};

type MockRefresh = jest.Mock<Promise<void>, []>;
type MockRateLocality = jest.Mock<Promise<Locality | null>, [string, number]>;

type MockLocalityRatingsState = {
  localities: Locality[];
  filteredLocalities: Locality[];
  filters: LocalityFilters;
  loading: boolean;
  error: string | null;
  lastSync: Date | null;
  isUsingBackend: boolean;
  pendingSubmissions: LocalitySuggestion[];
  analytics: LocalityAnalytics;
  refresh: MockRefresh;
  rateLocality: MockRateLocality;
  setFilters: jest.Mock;
  clearFilters: jest.Mock;
  getLocalityById: jest.Mock;
  submitSuggestion: jest.Mock;
};

const createAnalytics = (
  localities: Locality[],
  overrides: Partial<LocalityAnalytics> = {}
): LocalityAnalytics => {
  const total = overrides.total ?? localities.length;
  const averageScore = overrides.averageScore ?? (localities.length
    ? Number(
        (localities.reduce((sum, loc) => sum + loc.score, 0) / localities.length).toFixed(1)
      )
    : 0);
  const highestScore = overrides.highestScore ?? (localities.length
    ? Math.max(...localities.map(loc => loc.score))
    : undefined);
  const topLocalities = overrides.topLocalities ?? localities.slice(0, 3);
  const sourcesBreakdown = overrides.sourcesBreakdown ?? {
    Community: localities.length || 1,
  };

  return {
    total,
    averageScore,
    highestScore,
    topLocalities,
    sourcesBreakdown,
  };
};

const createState = (
  overrides: Partial<MockLocalityRatingsState> = {}
): MockLocalityRatingsState => {
  const localities = overrides.localities ?? [];
  const filteredLocalities = overrides.filteredLocalities ?? localities;

  return {
    localities,
    filteredLocalities,
    filters: overrides.filters ?? {},
    loading: overrides.loading ?? false,
    error: overrides.error ?? null,
    lastSync: overrides.lastSync ?? new Date('2024-01-01T00:00:00Z'),
    isUsingBackend: overrides.isUsingBackend ?? true,
    pendingSubmissions: overrides.pendingSubmissions ?? [],
    analytics: overrides.analytics ?? createAnalytics(filteredLocalities),
    refresh: overrides.refresh ?? jest.fn().mockResolvedValue(undefined),
    rateLocality: overrides.rateLocality ?? jest.fn().mockResolvedValue(null),
    setFilters: overrides.setFilters ?? jest.fn(),
    clearFilters: overrides.clearFilters ?? jest.fn(),
    getLocalityById: overrides.getLocalityById ?? jest.fn(),
    submitSuggestion: overrides.submitSuggestion ?? jest.fn(),
  };
};

let mockState = createState();
const useLocalityRatingsMock = jest.fn(() => mockState);

jest.mock('../../../services/LocalityRatingsService', () => ({
  useLocalityRatings: () => useLocalityRatingsMock(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } = require('util');
  if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder;
  }
  if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder;
  }
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLeaderboardRender = jest.fn();

jest.mock('../../../components/locality/LocalityLeaderboard', () => ({
  __esModule: true,
  default: (props: any) => {
    mockLeaderboardRender(props);
    return (
      <div data-testid="locality-leaderboard">
        {props.localities.map((loc: Locality) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => props.onLocalityClick?.(loc)}
          >
            {loc.nameEn}
          </button>
        ))}
        {props.localities.length > 0 && (
          <button
            type="button"
            onClick={() => props.onRate?.(props.localities[0].id, 4.5)}
          >
            rate-first
          </button>
        )}
      </div>
    );
  },
}));

const setState = (overrides: Partial<MockLocalityRatingsState> = {}) => {
  mockState = createState(overrides);
  useLocalityRatingsMock.mockImplementation(() => mockState);
};

const renderPage = () => render(<LocalityRatingsPage />);

describe('LocalityRatingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLocalitySequences();
    setState();
  });

  it('renders hero metrics, primary source, and top localities when data is available', () => {
    const localityA = buildLocality({ id: 'adyar', nameEn: 'Adyar', score: 4.7 });
    const localityB = buildLocality({ id: 'velachery', nameEn: 'Velachery', score: 4.4 });
    const localityC = buildLocality({ id: 'anna', nameEn: 'Anna Nagar', score: 4.5 });

    setState({
      localities: [localityA, localityB, localityC],
      filteredLocalities: [localityA, localityB, localityC],
      analytics: createAnalytics([localityA, localityB, localityC], {
        total: 3,
        averageScore: 4.5,
        highestScore: 4.7,
        sourcesBreakdown: {
          Community: 24,
          'Chennai Data': 12,
        },
      }),
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Locality Ratings' })).toBeInTheDocument();
    expect(screen.getByText('3 areas mapped')).toBeInTheDocument();
    expect(screen.getByText('Top source: Community')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Refresh data' })).toBeEnabled();

    const topLocalityHeadings = screen.getAllByRole('heading', { name: /Adyar|Velachery|Anna Nagar/ });
    expect(topLocalityHeadings.length).toBeGreaterThanOrEqual(3);

    expect(mockLeaderboardRender).toHaveBeenCalledWith(
      expect.objectContaining({
        localities: expect.arrayContaining([localityA, localityB, localityC]),
      })
    );
  });

  it('shows filtered empty state and triggers clearFilters when no matches', async () => {
    const clearFiltersMock = jest.fn();

    setState({
      filteredLocalities: [],
      analytics: createAnalytics([]),
      filters: { query: 'Adyar' },
      clearFilters: clearFiltersMock,
    });

    renderPage();

    expect(screen.getByText('Filters active')).toBeInTheDocument();
    expect(screen.getByText('No matches for these filters')).toBeInTheDocument();

    const user = userEvent.setup();
    const emptyStateHeading = screen.getByRole('heading', { name: 'No matches for these filters' });
    const emptyStateCard = emptyStateHeading.closest('div');
    expect(emptyStateCard).not.toBeNull();

    const clearButton = screen.getAllByRole('button', { name: 'Clear filters' }).pop();
    expect(clearButton).toBeDefined();

    await user.click(clearButton as HTMLButtonElement);
    expect(clearFiltersMock).toHaveBeenCalledTimes(1);
  });

  it('displays offline simulation messaging and pending submission count', () => {
    const pendingOne = buildLocalitySuggestion({ id: 'pending-1' });
    const pendingTwo = buildLocalitySuggestion({ id: 'pending-2' });

    setState({
      localities: [],
      filteredLocalities: [],
      analytics: createAnalytics([]),
      isUsingBackend: false,
      error: 'Operating offline',
      pendingSubmissions: [pendingOne, pendingTwo],
    });

    renderPage();

    expect(screen.getByText('Community simulation mode')).toBeInTheDocument();
    expect(screen.getByText('Operating offline')).toBeInTheDocument();
    expect(screen.getByText(/Pending submissions waiting for sync:/)).toHaveTextContent('2');
  });

  it('navigates to locality details from spotlight card and disables refresh during sync', async () => {
    const locality = buildLocality({ id: 'adyar', nameEn: 'Adyar' });
    let resolveRefresh: () => void = () => {};
    const refreshMock: MockRefresh = jest.fn(() =>
      new Promise<void>(resolve => {
        resolveRefresh = resolve;
      })
    );

    setState({
      localities: [locality],
      filteredLocalities: [locality],
      refresh: refreshMock,
    });

    renderPage();

    const user = userEvent.setup();
    const spotlightHeading = screen.getAllByRole('heading', { name: 'Adyar' })[0];
    await user.click(spotlightHeading);
    expect(mockNavigate).toHaveBeenCalledWith('/localities/adyar');

    const refreshButton = screen.getByRole('button', { name: 'Refresh data' });
    await user.click(refreshButton);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(refreshButton).toBeDisabled();

    act(() => {
      resolveRefresh();
    });

    await waitFor(() => expect(refreshButton).not.toBeDisabled());
  });

  it('submits ratings via leaderboard callback and surfaces success notification', async () => {
    jest.useFakeTimers();
    const locality = buildLocality({ id: 'adyar', nameEn: 'Adyar', score: 4.2 });
    const updated = { ...locality, score: 4.4 };
    const rateLocalityMock: MockRateLocality = jest.fn().mockResolvedValue(updated);

    setState({
      localities: [locality],
      filteredLocalities: [locality],
      rateLocality: rateLocalityMock,
    });

    renderPage();

  const rateButton = screen.getByRole('button', { name: 'rate-first' });
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.click(rateButton);

    expect(rateLocalityMock).toHaveBeenCalledWith('adyar', 4.5);

    const notification = await screen.findByRole('status');
    expect(notification).toHaveTextContent('Thanks — updated Adyar to 4.4');

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
    jest.useRealTimers();
  });
});
