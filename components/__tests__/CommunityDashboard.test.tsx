import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { ExternalDataProvider } from '../../services/ExternalDataService';
import { LanguageProvider } from '../../services/LanguageService';
import {
    communityDashboardErrorHandlers,
    communityDashboardSuccessHandlers,
} from '../../tests/msw/communityDashboardHandlers';
import { LiveDataWidget } from '../LiveData/LiveDataWidget';

jest.mock('../../services/RealTimeDataService', () => ({
  useRealTimeData: () => ({
    isConnected: true,
    connectionStatus: 'connected',
    lastUpdate: new Date('2024-05-01T04:55:00Z'),
    postsCount: 12,
  }),
}));

jest.mock('../../services/PincodeContext', () => ({
  usePincodeContext: () => ({
    currentPincode: '600004',
    isValidating: false,
    validationError: null,
    isLoadingServices: false,
    failedServices: [],
    setPincode: jest.fn(),
    validatePincode: jest.fn(),
    clearPincode: jest.fn(),
    getPincodeInfo: jest.fn(),
  }),
}));

const busRequestHistory: string[] = [];

const defaultHandlers = communityDashboardSuccessHandlers({
  onBusRequest: (url) => {
    const pincode = url.searchParams.get('pincode');
    if (pincode) {
      busRequestHistory.push(pincode);
    }
  },
});

const server = setupServer(...defaultHandlers);

const renderWidget = (pincode = '600004') =>
  render(
    <LanguageProvider>
      <ExternalDataProvider>
        <LiveDataWidget pincode={pincode} />
      </ExternalDataProvider>
    </LanguageProvider>,
  );

describe('Community Dashboard integrations', () => {
  beforeAll(() => server.listen());

  afterEach(() => {
    busRequestHistory.length = 0;
    server.resetHandlers(...defaultHandlers);
    jest.clearAllMocks();
  });

  afterAll(() => server.close());

  it('renders live weather, transit, and services data from network handlers', async () => {
    renderWidget();

  await screen.findByText('31°C');
  expect(screen.getByText('Bright and clear with a gentle breeze')).toBeTruthy();
  await screen.findByText('Bus Stops (Pincode 600004)');
  await screen.findByText('Kapaleeshwarar Temple Stop');
  await screen.findByText('Public Services');
  await screen.findByText(/Blue Line/);
  });

  it('requests bus data for each pincode provided to the widget', async () => {
    const view = renderWidget('600004');

    expect(await screen.findByText('Bus Stops (Pincode 600004)')).toBeInTheDocument();
    expect(busRequestHistory).toEqual(expect.arrayContaining(['600004']));

    busRequestHistory.length = 0;

    view.rerender(
      <LanguageProvider>
        <ExternalDataProvider>
          <LiveDataWidget pincode="600090" />
        </ExternalDataProvider>
      </LanguageProvider>,
    );

    expect(await screen.findByText('Bus Stops (Pincode 600090)')).toBeInTheDocument();
    expect(busRequestHistory).toEqual(expect.arrayContaining(['600090']));
  });

  it('surfaces graceful fallbacks when services report errors', async () => {
    server.resetHandlers(...communityDashboardErrorHandlers());

    renderWidget();

    expect(await screen.findByText('Weather data unavailable')).toBeInTheDocument();
    expect(await screen.findByText('Failed to fetch bus data')).toBeInTheDocument();
    expect(screen.getAllByText('error').length).toBeGreaterThan(0);
  });
});
