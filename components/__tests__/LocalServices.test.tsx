import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { buildServiceApiPayload } from '../../tests/fixtures/serviceDirectoryFixtures';
import {
    serviceDirectoryErrorHandlers,
    serviceDirectorySuccessHandlers,
} from '../../tests/msw/serviceDirectoryHandlers';
import { LocalServices } from '../LocalServices';

jest.mock('../../services/LocationService', () => ({
  useLocation: () => ({
    currentLocation: { area: 'Alwarpet', pincode: '600020' },
    setLocationModalOpen: jest.fn(),
  }),
}));

jest.mock('../ui/select', () => {
  const React = require('react');

  const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  (SelectContent as any).__mockType = 'content';

  const Select = ({
    children,
    value,
    onValueChange,
    'data-testid': dataTestId,
    ...rest
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange?: (value: string) => void;
    'data-testid'?: string;
  }) => {
    let optionElements: React.ReactNode[] = [];
    React.Children.forEach(children, (child: React.ReactNode) => {
      if (!React.isValidElement(child)) {
        return;
      }
      const element = child as React.ReactElement;
      const typed = element.type as { __mockType?: string };
      if (typed?.__mockType === 'content') {
        optionElements = React.Children.toArray((element.props as { children?: React.ReactNode }).children);
      }
    });
    return (
      <select
        data-testid={dataTestId ?? 'service-category-select'}
        value={value}
        onChange={event => onValueChange?.(event.target.value)}
        {...rest}
      >
        {optionElements}
      </select>
    );
  };

  const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  );

  const SelectValue = (_: { placeholder?: string }) => null;

  return {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
  };
});

const backendServices = [
  buildServiceApiPayload({
    id: 901,
    name: 'Kotturpuram Electricians Guild',
    category: 'Repairs',
    rating: 4.9,
    distance: '0.3 km',
    speciality: 'Same-day wiring fixes',
    language: 'Tamil',
  }),
  buildServiceApiPayload({
    id: 902,
    name: 'Marina Wellness Collective',
    category: 'Wellness',
    rating: 4.6,
    distance: '1.8 km',
    isOpen: false,
    speciality: 'Sunrise yoga batches',
    trusted: false,
  }),
];

const server = setupServer(...serviceDirectorySuccessHandlers({ services: backendServices }));

const renderComponent = () =>
  render(<LocalServices userLocation={{ area: 'Mylapore', pincode: '600004' }} />);

describe('LocalServices (Services Dashboard)', () => {
  beforeAll(() => {
    if (!HTMLElement.prototype.hasPointerCapture) {
      HTMLElement.prototype.hasPointerCapture = () => false;
    }
    if (!HTMLElement.prototype.setPointerCapture) {
      HTMLElement.prototype.setPointerCapture = () => {};
    }
    if (!HTMLElement.prototype.releasePointerCapture) {
      HTMLElement.prototype.releasePointerCapture = () => {};
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
  });

  beforeAll(() => server.listen());

  afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => server.close());

  it('renders live backend services and status when API responds successfully', async () => {
    renderComponent();

  expect(await screen.findByText('Kotturpuram Electricians Guild')).toBeTruthy();
  expect(screen.getByText('Connected to Chennai services backend')).toBeTruthy();
  expect(screen.getByText('Same-day wiring fixes')).toBeTruthy();
  expect(screen.getByText('Showing 2 of 2 providers')).toBeTruthy();

  const repairBadges = await screen.findAllByText('Repairs', { selector: 'span' });
  expect(repairBadges.length).toBeGreaterThan(0);
  });

  it('falls back to simulation data when backend is unavailable', async () => {
    server.use(...serviceDirectoryErrorHandlers());

    renderComponent();

    expect(await screen.findByText('Raman Anna Auto Works')).toBeTruthy();
    expect(screen.getByText('Community simulation active')).toBeTruthy();
    expect(
      screen.getByText('Operating in Chennai services simulation mode. Data will sync once the backend connects.'),
    ).toBeTruthy();
  });

  it('supports filtering and search across service cards', async () => {
    renderComponent();

    const user = userEvent.setup({ pointerEventsCheck: 0 });

    await screen.findByText('Kotturpuram Electricians Guild');

    const searchInput = screen.getByPlaceholderText('என்ன தேவை? Try electrician, idli, tuition…');
    await user.clear(searchInput);
    await user.type(searchInput, 'wellness');

    await waitFor(() => {
  expect(screen.queryByText('Kotturpuram Electricians Guild')).toBeNull();
  expect(screen.getByText('Marina Wellness Collective')).toBeTruthy();
    });

    await user.clear(searchInput);

  const [categorySelect] = screen.getAllByRole('combobox') as HTMLSelectElement[];
  await user.selectOptions(categorySelect, 'Repairs');

    await waitFor(() => {
  expect(screen.getByText('Kotturpuram Electricians Guild')).toBeTruthy();
  expect(screen.queryByText('Marina Wellness Collective')).toBeNull();
    });
  });

  it('initiates contact through the API and surfaces notifications', async () => {
    const contactSpy = jest.fn();
    server.resetHandlers(...serviceDirectorySuccessHandlers({
      services: backendServices,
      onContactRequest: contactSpy,
    }));

    renderComponent();

  const user = userEvent.setup({ pointerEventsCheck: 0 });
  const [callButton] = await screen.findAllByRole('button', { name: /call & reserve/i });
    await user.click(callButton);

    expect(contactSpy).toHaveBeenCalledTimes(1);
    const [contactUrl] = contactSpy.mock.calls[0] ?? [];
    expect(contactUrl).toBeInstanceOf(URL);
    expect((contactUrl as URL).pathname).toContain('/api/services/901/contact');

    await waitFor(() => {
      expect(screen.getByText(/Dialing service 901 now/)).toBeTruthy();
    });

  });

  it('books a service slot via the modal and confirms success', async () => {
    const bookingSpy = jest.fn();
    server.resetHandlers(...serviceDirectorySuccessHandlers({
      services: backendServices,
      onBookingRequest: bookingSpy,
    }));

  const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderComponent();

  const [bookButton] = await screen.findAllByRole('button', { name: /book slot/i });
    await user.click(bookButton);

    const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(/Book Kotturpuram Electricians Guild/)).toBeTruthy();

  const [nameInput, phoneInput, timeInput] = within(dialog).getAllByRole('textbox');

    await user.type(nameInput, 'Uma');
    await user.type(phoneInput, '9876543210');
    await user.type(timeInput, 'Tomorrow 9 AM');

    const submitButton = within(dialog).getByRole('button', { name: 'Book' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(bookingSpy).toHaveBeenCalledTimes(1);
    });
    const [bookingUrl, bookingBody] = bookingSpy.mock.calls[0] ?? [];
    expect(bookingUrl).toBeInstanceOf(URL);
    expect((bookingUrl as URL).pathname).toContain('/api/services/901/book');
    expect(bookingBody).toEqual(
      expect.objectContaining({ name: 'Uma', phone: '9876543210', time: 'Tomorrow 9 AM' }),
    );

    await waitFor(() => {
      expect(screen.getByText('Booking confirmed')).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
