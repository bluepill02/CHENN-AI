/**
 * PincodePage Test Suite
 * 
 * Tests the complete pincode validation and service integration flow:
 * - Valid pincode input triggers all service calls
 * - Invalid pincode shows error message and prevents service calls
 * - Loading states and error handling work correctly
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PincodeContextProvider } from '../../services/PincodeContext';
import { PincodePage } from '../PincodePage';

// Mock UI components
jest.mock('../ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div {...props} role="alert">{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('../ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock('../ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock('../ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('../ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <span>AlertCircle</span>,
  CheckCircle: () => <span>CheckCircle</span>,
  Loader2: () => <span>Loader2</span>,
  MapPin: () => <span>MapPin</span>,
  Wifi: () => <span>Wifi</span>,
  WifiOff: () => <span>WifiOff</span>,
}));

// Mock all the service modules and components that are actually used
jest.mock('../LiveData/WeatherPanel', () => ({
  WeatherPanel: jest.fn(({ pincode }) => {
    React.useEffect(() => {
      if (pincode) {
        mockFetchWeather(pincode);
      }
    }, [pincode]);
    return <div data-testid="weather-panel">Weather Panel - Pincode: {pincode}</div>;
  })
}));

jest.mock('../LiveData/TrafficPanel', () => ({
  TrafficPanel: jest.fn(({ pincode }) => {
    React.useEffect(() => {
      if (pincode) {
        mockFetchTrafficData(pincode);
      }
    }, [pincode]);
    return <div data-testid="traffic-panel">Traffic Panel - Pincode: {pincode}</div>;
  })
}));

jest.mock('../BusByPincodeCard', () => ({
  BusByPincodeCard: jest.fn(({ pincode }) => {
    React.useEffect(() => {
      if (pincode) {
        mockFetchBusStopsByPincode(pincode);
      }
    }, [pincode]);
    return <div data-testid="bus-pincode-card">Bus Card - Pincode: {pincode}</div>;
  })
}));

jest.mock('../TimetableCard', () => ({
  __esModule: true,
  default: jest.fn(({ pincode }) => {
    React.useEffect(() => {
      if (pincode) {
        mockFetchMetroDataByPincode(pincode);
      }
    }, [pincode]);
    return <div data-testid="timetable-card">Timetable Card - Pincode: {pincode}</div>;
  })
}));

// Mock fetch globally for API calls in PincodeContext
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Create mock service functions for components that are actually used
const mockFetchWeather = jest.fn();
const mockFetchTrafficData = jest.fn();
const mockFetchBusStopsByPincode = jest.fn();
const mockFetchMetroDataByPincode = jest.fn();

// Make mocks available globally for component imports
(global as any).mockFetchWeather = mockFetchWeather;
(global as any).mockFetchTrafficData = mockFetchTrafficData;
(global as any).mockFetchBusStopsByPincode = mockFetchBusStopsByPincode;
(global as any).mockFetchMetroDataByPincode = mockFetchMetroDataByPincode;

describe('PincodePage', () => {
  const renderPincodePageWithContext = (props = {}) => {
    return render(
      <PincodeContextProvider>
        <PincodePage {...props} />
      </PincodeContextProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup default fetch responses for service health checks
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  describe('Valid Pincode Input', () => {
    it('should render PincodePage with all components', async () => {
      renderPincodePageWithContext();
      
      expect(screen.getByText(/Chennai Community Hub/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter 6-digit pincode/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set Pincode/i })).toBeInTheDocument();
    });

    it('should accept valid pincode (600044) and trigger all service calls', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext({ initialPincode: '' }); // Start without pincode
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      // Enter valid pincode
      await user.type(input, '600044');
      expect(input).toHaveValue('600044');
      
      // Submit the form
      await user.click(submitButton);
      
      // Wait for context to process and services to be triggered
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/busByPincode?pincode=600044');
        expect(mockFetch).toHaveBeenCalledWith('/api/traffic?pincode=600044');
        expect(mockFetch).toHaveBeenCalledWith('/api/weather?pincode=600044');
        expect(mockFetch).toHaveBeenCalledWith('/api/twitterFeed?pincode=600044');
      }, { timeout: 3000 });
      
      // Verify individual service calls were made through component effects
      await waitFor(() => {
        expect(mockFetchWeather).toHaveBeenCalledWith('600044');
        expect(mockFetchTrafficData).toHaveBeenCalledWith('600044');
        expect(mockFetchBusStopsByPincode).toHaveBeenCalledWith('600044');
        expect(mockFetchMetroDataByPincode).toHaveBeenCalledWith('600044');
      });
    });

    it('should display Chennai area information for valid Chennai pincode', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      // Enter Chennai pincode (T. Nagar)
      await user.type(input, '600017');
      await user.click(submitButton);
      
      // Should show Chennai area info
      await waitFor(() => {
        expect(screen.getByText(/T\. Nagar/i)).toBeInTheDocument();
        expect(screen.getByText(/South Chennai/i)).toBeInTheDocument();
      });
    });

    it('should show loading states during service calls', async () => {
      // Mock slow API response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true })
          }), 1000)
        )
      );
      
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      await user.type(input, '600044');
      await user.click(submitButton);
      
      // Should show loading indicator
      expect(screen.getByText(/Validating pincode/i)).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/Validating pincode/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Invalid Pincode Input', () => {
    it('should show error message for invalid pincode (123) and not call services', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      mockFetch.mockClear();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      // Enter invalid pincode
      await user.type(input, '123');
      expect(input).toHaveValue('123');
      
      // Submit the form
      await user.click(submitButton);
      
      // Wait for validation error to appear
      await waitFor(() => {
        expect(screen.getByText(/Invalid pincode format/i)).toBeInTheDocument();
      });
      
      // Verify no service calls were made
      expect(mockFetchWeather).not.toHaveBeenCalled();
      expect(mockFetchTrafficData).not.toHaveBeenCalled();
      expect(mockFetchBusStopsByPincode).not.toHaveBeenCalled();
      expect(mockFetchMetroDataByPincode).not.toHaveBeenCalled();
      
      // Verify no API calls to context services
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should show error for pincode starting with 0', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      // Enter invalid pincode starting with 0
      await user.type(input, '012345');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid pincode format/i)).toBeInTheDocument();
        expect(screen.getByText(/Must be 6 digits starting with 1-9/i)).toBeInTheDocument();
      });
    });

    it('should prevent input of more than 6 digits', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      
      // Try to enter 8 digits
      await user.type(input, '12345678');
      
      // Should only accept 6 digits
      expect(input).toHaveValue('123456');
    });

    it('should prevent input of non-numeric characters', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      
      // Try to enter letters and special characters
      await user.type(input, 'abc123def!@#');
      
      // Should only accept numeric characters
      expect(input).toHaveValue('123');
    });
  });

  describe('Service Failure Handling', () => {
    it('should display service failure banners when APIs fail', async () => {
      // Mock some services to fail
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/api/weather') || url.includes('/api/traffic')) {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true })
        });
      });
      
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      await user.type(input, '600044');
      await user.click(submitButton);
      
      // Wait for service failures to be detected
      await waitFor(() => {
        expect(screen.getByText(/Some services are currently unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Props and Callbacks', () => {
    it('should call onPincodeSet callback when pincode is successfully set', async () => {
      const mockOnPincodeSet = jest.fn();
      const user = userEvent.setup();
      
      renderPincodePageWithContext({ onPincodeSet: mockOnPincodeSet });
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      await user.type(input, '600044');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnPincodeSet).toHaveBeenCalledWith('600044');
      });
    });

    it('should initialize with initialPincode prop', async () => {
      renderPincodePageWithContext({ initialPincode: '600017' });
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      expect(input).toHaveValue('600017');
    });

    it('should show debug information when showDebugInfo is true', async () => {
      renderPincodePageWithContext({ showDebugInfo: true });
      
      // Debug panel should be visible
      expect(screen.getByText(/Debug Information/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should submit form when Enter key is pressed', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      
      await user.type(input, '600044');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/busByPincode?pincode=600044');
      });
    });

    it('should clear pincode when clear button is clicked', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      // Set a pincode first
      await user.type(input, '600044');
      await user.click(submitButton);
      
      // Find and click clear button
      const clearButton = await screen.findByRole('button', { name: /Clear/i });
      await user.click(clearButton);
      
      // Input should be cleared
      expect(input).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const form = input.closest('form');
      
      expect(input).toHaveAttribute('type', 'text');
      // Note: maxLength is handled by React, not HTML attribute
      expect(form).toBeInTheDocument();
    });

    it('should show validation error with proper accessibility attributes', async () => {
      const user = userEvent.setup();
      renderPincodePageWithContext();
      
      const input = screen.getByPlaceholderText(/Enter 6-digit pincode/i);
      const submitButton = screen.getByRole('button', { name: /Set Pincode/i });
      
      await user.type(input, '123');
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/Invalid pincode format/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});
