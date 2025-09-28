/**
 * LiveAlertsPage Test Suite
 *
 * Covers the Live Alerts & Info experience with Jest + React Testing Library.
 * Scenarios:
 * - Loading transition into populated alerts
 * - Empty state messaging
 * - Error handling with manual refresh
 * - Alert detail display and acknowledgement
 * - Auto-refresh when pincode context changes
 * - Backend parameter propagation based on user location
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LiveAlertsFilters } from '../../services/LiveAlertsService';
import type { LiveAlert } from '../../types/community';
import { LiveAlertsPage } from '../LiveAlertsPage';

interface MockLiveAlertsState {
  alerts: LiveAlert[];
  loading: boolean;
  error: string | null;
  isUsingBackend: boolean;
  lastSync: Date | null;
  pendingReports: unknown[];
  refresh: jest.Mock<Promise<void>, [LiveAlertsFilters?]>;
  acknowledge: jest.Mock<Promise<void>, [string]>;
  submitReport: jest.Mock;
  getAlertById: jest.Mock;
  currentFilters: LiveAlertsFilters;
}

let refreshMock = jest.fn<Promise<void>, [LiveAlertsFilters?]>().mockResolvedValue();
let acknowledgeMock = jest.fn<Promise<void>, [string]>().mockResolvedValue();

const createLiveAlertsState = (overrides: Partial<MockLiveAlertsState> = {}): MockLiveAlertsState => ({
  alerts: [],
  loading: false,
  error: null,
  isUsingBackend: true,
  lastSync: null,
  pendingReports: [],
  refresh: refreshMock,
  acknowledge: acknowledgeMock,
  submitReport: jest.fn(),
  getAlertById: jest.fn(),
  currentFilters: {},
  ...overrides,
});

let liveAlertsState = createLiveAlertsState();

const useLiveAlertsMock = jest.fn(() => liveAlertsState);

jest.mock('../../services/LiveAlertsService', () => ({
  useLiveAlerts: () => useLiveAlertsMock(),
}));

let mockPincodeValue = '600001';

const usePincodeContextMock = jest.fn(() => ({
  currentPincode: mockPincodeValue,
  isValidating: false,
  validationError: null,
  isLoadingServices: false,
  failedServices: [],
  setPincode: jest.fn(),
  validatePincode: jest.fn(),
  clearPincode: jest.fn(),
  getPincodeInfo: jest.fn(),
}));

jest.mock('../../services/PincodeContext', () => ({
  usePincodeContext: () => usePincodeContextMock(),
}));

jest.mock('../../services/LanguageService', () => ({
  useLanguage: () => ({
    language: 'en' as const,
    setLanguage: jest.fn(),
  }),
}));

jest.mock('lucide-react', () => ({
  AlertTriangle: () => <span role="img" aria-label="alert">⚠️</span>,
  ShieldAlert: () => <span role="img" aria-label="shield">🛡️</span>,
  Info: () => <span role="img" aria-label="info">ℹ️</span>,
  CheckCircle: () => <span role="img" aria-label="ok">✅</span>,
  RefreshCw: () => <span role="img" aria-label="refresh">🔄</span>,
}));

jest.mock('../ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

const setLiveAlertsState = (overrides: Partial<MockLiveAlertsState> = {}) => {
  liveAlertsState = createLiveAlertsState(overrides);
};

const createAlert = (overrides: Partial<LiveAlert> = {}): LiveAlert => ({
  id: 'alert-1',
  title: 'Flood Warning in Adyar',
  titleEn: 'Flood Warning in Adyar',
  message: 'Heavy waterlogging reported near Adyar bridge. Expect delays.',
  messageEn: 'Heavy waterlogging reported near Adyar bridge. Expect delays.',
  severity: 'high',
  timestamp: new Date('2024-05-01T10:30:00Z'),
  source: 'Chennai Traffic Cell',
  affectedAreas: ['Adyar'],
  pincodes: ['600020'],
  isActive: true,
  ...overrides,
});

const renderPage = (props?: Parameters<typeof LiveAlertsPage>[0]) => render(
  <LiveAlertsPage {...props} />
);

describe('LiveAlertsPage', () => {
  beforeEach(() => {
    refreshMock = jest.fn<Promise<void>, [LiveAlertsFilters?]>().mockResolvedValue();
    acknowledgeMock = jest.fn<Promise<void>, [string]>().mockResolvedValue();
    setLiveAlertsState();
    useLiveAlertsMock.mockImplementation(() => liveAlertsState);
    mockPincodeValue = '600001';
    jest.clearAllMocks();
  });

  it('transitions from loading state to rendering live alerts', async () => {
    const alert = createAlert();
    setLiveAlertsState({ alerts: [], loading: true });
    const { rerender } = renderPage();

    expect(screen.getByText('Refreshing…')).toBeInTheDocument();

    setLiveAlertsState({ alerts: [alert], loading: false, lastSync: new Date('2024-05-01T11:00:00Z') });
    rerender(<LiveAlertsPage />);

  await screen.findByText(alert.title);
  expect(screen.getAllByText(alert.message).length).toBeGreaterThan(0);
  });

  it('shows empty state when no alerts are available', () => {
    setLiveAlertsState({ alerts: [], loading: false, error: null });
    renderPage();

    expect(screen.getByText('No active alerts for your area right now.')).toBeInTheDocument();
  });

  it('displays error message and allows manual refresh', async () => {
    setLiveAlertsState({ alerts: [], loading: false, error: 'Network down' });
    renderPage();

  expect(screen.getAllByText('Network down').length).toBeGreaterThan(0);

    const callsBefore = refreshMock.mock.calls.length;
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /refresh alerts/i }));

    expect(refreshMock.mock.calls.length).toBe(callsBefore + 1);
    const lastCallArgs = refreshMock.mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toEqual(expect.objectContaining({ pincode: '600001' }));
  });

  it('renders alert detail information and acknowledges alerts', async () => {
    const alert = createAlert({ id: 'alert-42' });
    setLiveAlertsState({ alerts: [alert], loading: false });
    renderPage();

  await screen.findByText(alert.title);
  expect(screen.getAllByText(alert.message).length).toBeGreaterThan(0);
    expect(screen.getByText(`📡 ${alert.source}`)).toBeInTheDocument();
    expect(screen.getByText('📍 Adyar')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /mark read/i }));
    expect(acknowledgeMock).toHaveBeenCalledWith('alert-42');
  });

  it('auto-refreshes when pincode changes in context', async () => {
    setLiveAlertsState({ alerts: [], loading: false });
    const { rerender } = renderPage();

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    refreshMock.mockClear();

    mockPincodeValue = '600042';
    rerender(<LiveAlertsPage />);

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    const lastCallArgs = refreshMock.mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toEqual(expect.objectContaining({ pincode: '600042' }));
  });

  it('passes location filters to backend refresh call', async () => {
    setLiveAlertsState({ alerts: [], loading: false });
    renderPage({ userLocation: { area: 'Anna Nagar', pincode: '600040' } });

    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    const lastCallArgs = refreshMock.mock.calls.at(-1);
    expect(lastCallArgs?.[0]).toEqual(expect.objectContaining({
      pincode: '600001',
      area: 'Anna Nagar',
    }));

    expect(screen.getByText('📍 PIN: 600001')).toBeInTheDocument();
    expect(screen.getByText('Anna Nagar')).toBeInTheDocument();
  });
});
