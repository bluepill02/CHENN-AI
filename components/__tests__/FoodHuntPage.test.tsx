/**
 * FoodHuntPage Test Suite
 *
 * Exercises the Chennai Food Hunt experience with Jest + React Testing Library.
 * Coverage highlights:
 * - Initial loading experience and status messaging
 * - Rendering of vendor cards grouped by area with dish metadata
 * - Interactive filtering across search, price, veg type, and open-now switches
 * - Pending submission banner and offline simulation messaging
 * - Navigation to dish detail cards and manual refresh behaviour
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildDish, buildVendor, resetFoodHuntSequences } from '../../tests/fixtures/foodHuntFixtures';
import type { FoodHuntSuggestion, Vendor } from '../../types/foodhunt';
import FoodHuntPage from '../FoodHuntPage';

interface MockFoodHuntState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  isUsingBackend: boolean;
  lastSync: Date | null;
  pendingSubmissions: FoodHuntSuggestion[];
  refresh: jest.Mock<Promise<void>, []>;
}

const createState = (overrides: Partial<MockFoodHuntState> = {}): MockFoodHuntState => ({
  vendors: [],
  loading: false,
  error: null,
  isUsingBackend: true,
  lastSync: null,
  pendingSubmissions: [],
  refresh: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

let mockState = createState();

const useFoodHuntMock = jest.fn(() => mockState);

jest.mock('../../services/FoodHuntService', () => ({
  useFoodHunt: () => useFoodHuntMock(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const { TextEncoder, TextDecoder } = require('util');
  if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder as any;
  }
  if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder as any;
  }
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../ui/card', () => {
  const actual = jest.requireActual('../ui/card');
  return {
    ...actual,
    Card: ({ children, className, ...rest }: any) => (
      <div className={className} data-testid="vendor-card" {...rest}>
        {children}
      </div>
    ),
  };
});

const setState = (overrides: Partial<MockFoodHuntState> = {}) => {
  mockState = createState(overrides);
  useFoodHuntMock.mockImplementation(() => mockState);
};

const renderPage = () => render(<FoodHuntPage />);

describe('FoodHuntPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFoodHuntSequences();
    setState();
  });

  it('shows refreshing state while initial data loads', () => {
    setState({ loading: true, vendors: [], isUsingBackend: true, lastSync: null });
    const { container } = renderPage();

    expect(screen.getByText('Preparing delicious discovery feed...')).toBeInTheDocument();
    const refreshButton = screen.getByRole('button', { name: 'Refreshing…' });
    expect(refreshButton).toBeDisabled();
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('renders vendors grouped by area with dish info and distance helpers', () => {
    const adyarDish = buildDish({ id: 'dish-idli', nameEn: 'Idli Cloud', nameTa: 'இட்லி', price: 35, spicyLevel: 0 });
    const velacheryDish = buildDish({ id: 'dish-parotta', nameEn: 'Parotta', nameTa: 'பரோட்டா', price: 80, spicyLevel: 2 });

    const adyarVendor = buildVendor({
      id: 'vendor-amma',
      nameEn: "Amma's Kitchen",
      nameTa: 'அம்மாவின் சமையல்',
      areaEn: 'Adyar',
      areaTa: 'அடையார்',
      dishes: [adyarDish],
      distanceKm: 0,
      features: ['filter-coffee'],
    });

    const velacheryVendor = buildVendor({
      id: 'vendor-velachery',
      nameEn: 'Madurai Mess',
      nameTa: 'மதுரை மெஸ்',
      areaEn: 'Velachery',
      areaTa: 'வேளச்சேரி',
      dishes: [velacheryDish],
      distanceKm: 5.2,
      tags: ['spicy'],
      isCommunitySubmission: true,
    });

    setState({ vendors: [velacheryVendor, adyarVendor] });
    renderPage();

    expect(screen.getByRole('heading', { name: 'Adyar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Velachery' })).toBeInTheDocument();

    const adyarCard = screen.getByText("Amma's Kitchen").closest('[data-testid="vendor-card"]');
    expect(adyarCard).not.toBeNull();
    const adyarScope = within(adyarCard as HTMLElement);
    expect(adyarScope.getByText('Idli Cloud')).toBeInTheDocument();
    expect(adyarScope.getByText('Distance updates soon')).toBeInTheDocument();

    const velacheryCard = screen.getByText('Madurai Mess').closest('[data-testid="vendor-card"]');
    expect(velacheryCard).not.toBeNull();
    const velacheryScope = within(velacheryCard as HTMLElement);
    expect(velacheryScope.getByText('Parotta')).toBeInTheDocument();
    expect(velacheryScope.getByText('Community submission awaiting approval • சமூக உணவு பரிந்துரை')).toBeInTheDocument();
    expect(velacheryScope.getByText('5.2 km')).toBeInTheDocument();
  });

  it('filters vendors by search, price, veg type, and open-now toggle including empty state', async () => {
    const openVegVendor = buildVendor({
      id: 'vendor-veg',
      nameEn: 'Veggie Delight',
      areaEn: 'Anna Nagar',
      priceLevel: 1,
      vegType: 'veg',
      openNow: true,
      dishes: [buildDish({ id: 'dish-veg', nameEn: 'Veg Meal', nameTa: 'வெஜ் உணவு' })],
    });

    const closedNonVegVendor = buildVendor({
      id: 'vendor-nonveg',
      nameEn: 'Madurai Mess',
      areaEn: 'Velachery',
      priceLevel: 3,
      vegType: 'non-veg',
      openNow: false,
      dishes: [buildDish({ id: 'dish-nonveg', nameEn: 'Kari Dosa', nameTa: 'காரி தோசை' })],
    });

    setState({ vendors: [openVegVendor, closedNonVegVendor] });
    renderPage();

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search dishes, vendor or area');

    await user.type(searchInput, 'Madurai');
    expect(screen.getByText('Madurai Mess')).toBeInTheDocument();
    expect(screen.queryByText('Veggie Delight')).not.toBeInTheDocument();

    await user.clear(searchInput);
    await user.click(screen.getByRole('button', { name: '₹₹₹' }));
    expect(screen.getByText('Madurai Mess')).toBeInTheDocument();
    expect(screen.queryByText('Veggie Delight')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '₹' }));
    expect(screen.getByText('Veggie Delight')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'All' }));

    const vegSelect = screen.getByRole('combobox');
    await user.selectOptions(vegSelect, 'non-veg');
    expect(screen.getByText('Madurai Mess')).toBeInTheDocument();

    const openNowToggle = screen.getByLabelText('Open Now');
    await user.click(openNowToggle);

    expect(await screen.findByText('No food hunts yet')).toBeInTheDocument();
  });

  it('shows simulation banner, pending submission count, and error copy when offline', () => {
    const pendingSuggestion = (id: string): FoodHuntSuggestion => ({
      id,
      vendorNameEn: 'Community Stall',
      areaEn: 'Chromepet',
      cuisines: ['Snacks'],
      vegType: 'veg',
      priceLevel: 1,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setState({
      vendors: [],
      isUsingBackend: false,
      error: 'Offline – will sync later',
      pendingSubmissions: [pendingSuggestion('pending-1'), pendingSuggestion('pending-2')],
    });

    renderPage();

    expect(screen.getByText('Community simulation active')).toBeInTheDocument();
    expect(screen.getByText('Offline – will sync later')).toBeInTheDocument();
    expect(screen.getByText('2 community submissions awaiting sync.')).toBeInTheDocument();
  });

  it('navigates to dish details and triggers refresh on manual action', async () => {
    const refreshMock = jest.fn().mockResolvedValue(undefined);
    const dish = buildDish({ id: 'dish-click', nameEn: 'Degree Coffee', nameTa: 'டிகிரி காபி' });
    const vendor = buildVendor({
      id: 'vendor-coffee',
      nameEn: "Amma's Kitchen",
      dishes: [dish],
      openNow: true,
    });

    setState({ vendors: [vendor], refresh: refreshMock });
    renderPage();

    const user = userEvent.setup();
    await user.click(screen.getByText('Degree Coffee'));
    expect(mockNavigate).toHaveBeenCalledWith('/food-hunt/dish-click');

    await user.click(screen.getByRole('button', { name: 'Refresh spots' }));
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
