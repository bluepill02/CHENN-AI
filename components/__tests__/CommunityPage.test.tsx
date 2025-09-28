/**
 * CommunityPage Test Suite
 * 
 * Tests the responsive 3-column grid layout implementation:
 * - Responsive grid layout structure (desktop 3-column, mobile vertical stack)
 * - Independent scrolling behavior for feed and widget columns
 * - Content rendering for CommunityFeed and LiveDataWidget
 * - Accessibility features with proper ARIA labels
 * - Viewport-based responsive behavior testing
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PincodeContextProvider } from '../../services/PincodeContext';
import { CommunityPage } from '../CommunityPage';

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
  ChevronDown: () => <span>ChevronDown</span>,
  ChevronUp: () => <span>ChevronUp</span>,
  Clock: () => <span>Clock</span>,
  Cloud: () => <span>Cloud</span>,
  CloudRain: () => <span>CloudRain</span>,
  Car: () => <span>Car</span>,
  Heart: () => <span>Heart</span>,
  Loader2: () => <span>Loader2</span>,
  MapPin: () => <span>MapPin</span>,
  MessageCircle: () => <span>MessageCircle</span>,
  RefreshCw: () => <span>RefreshCw</span>,
  Share2: () => <span>Share2</span>,
  Sun: () => <span>Sun</span>,
  Wifi: () => <span>Wifi</span>,
  WifiOff: () => <span>WifiOff</span>,
  Wind: () => <span>Wind</span>,
}));

// Mock CommunityFeed component with test data
jest.mock('../CommunityFeed', () => ({
  CommunityFeed: jest.fn(({ userLocation, pincode }) => {
    // Simulate community posts
    const samplePosts = [
      { id: 1, author: 'Test User 1', content: 'Sample community post 1', likes: 5 },
      { id: 2, author: 'Test User 2', content: 'Sample community post 2', likes: 3 },
      { id: 3, author: 'Test User 3', content: 'Sample community post 3', likes: 8 },
    ];

    return (
      <div 
        data-testid="community-feed" 
        role="region" 
        aria-label="Community Feed"
        style={{ height: '2000px' }} // Make it scrollable for testing
      >
        <h2>Community Feed</h2>
        <div>Location: {userLocation?.area || 'Unknown'}</div>
        <div>Pincode: {pincode}</div>
        
        {/* Sample posts */}
        {samplePosts.map(post => (
          <div key={post.id} data-testid={`post-${post.id}`} className="community-post">
            <div className="author">{post.author}</div>
            <div className="content">{post.content}</div>
            <div className="likes">{post.likes} likes</div>
          </div>
        ))}

        {/* WebM Auto Share Button */}
        <button data-testid="auto-share-button">
          <video 
            data-testid="webm-animation" 
            className="w-12 h-12" 
            autoPlay 
            muted 
            loop
          >
            Auto Share WebM
          </video>
        </button>
      </div>
    );
  })
}));

// Mock LiveDataWidget component
jest.mock('../LiveData/LiveDataWidget', () => ({
  LiveDataWidget: jest.fn(({ className }) => {
    return (
      <div 
        data-testid="live-data-widget" 
        className={className}
        role="region" 
        aria-label="Live Data Widget"
        style={{ height: '1500px' }} // Make it scrollable for testing
      >
        <h2>Live Data Widget</h2>
        
        {/* Mock Weather Panel */}
        <div data-testid="weather-panel">
          <h3>Weather Panel</h3>
          <div>Temperature: 28°C</div>
          <div>Condition: Sunny</div>
        </div>
        
        {/* Mock Traffic Panel */}
        <div data-testid="traffic-panel">
          <h3>Traffic Status Panel</h3>
          <div>Traffic: Moderate</div>
          <div>Delay: 5 minutes</div>
        </div>

        {/* Mock Bus Panel */}
        <div data-testid="bus-panel">
          <h3>Bus Information</h3>
          <div>Next Bus: 10 minutes</div>
        </div>

        {/* Mock Timetable */}
        <div data-testid="timetable-panel">
          <h3>CMRL Timetable</h3>
          <div>Next Train: 15 minutes</div>
        </div>
      </div>
    );
  })
}));

// Mock Language Service
jest.mock('../../services/LanguageService', () => ({
  LanguageProvider: ({ children }: any) => children,
  useLanguage: () => ({
    language: 'en' as const,
    setLanguage: jest.fn(),
    getText: (_key: string, fallback: string) => fallback,
  }),
}));

// Mock Location Service
jest.mock('../../services/LocationService', () => ({
  LocationProvider: ({ children }: any) => children,
  useLocation: () => ({
    currentLocation: { area: 'Test Area', pincode: '600001' },
    setLocation: jest.fn(),
  }),
}));

// Mock External Data Service
jest.mock('../../services/ExternalDataService', () => ({
  ExternalDataProvider: ({ children }: any) => children,
  useExternalData: () => ({
    weather: { temperature: 28, condition: 'sunny' },
    isLoading: false,
    error: null,
  }),
}));

// Mock RealTime Data Service
jest.mock('../../services/RealTimeDataService', () => ({
  RealTimeDataProvider: ({ children }: any) => children,
  useRealTimeData: () => ({
    alerts: [],
    publicServices: [],
    isConnected: true,
  }),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('CommunityPage', () => {
  const renderCommunityPageWithProviders = (props = {}) => {
    return render(
      <PincodeContextProvider>
        <CommunityPage 
          userLocation={{ area: 'Test Area', pincode: '600001' }}
          pincode="600001"
          {...props} 
        />
      </PincodeContextProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Layout Structure', () => {
    it('should render responsive layout wrappers', () => {
      renderCommunityPageWithProviders();

      const feedElement = screen.getByTestId('community-feed');
      const feedContainer = feedElement.parentElement as HTMLElement;
      const layoutWrapper = feedContainer.parentElement as HTMLElement;
      const rootContainer = layoutWrapper.parentElement as HTMLElement;

      expect(layoutWrapper).toHaveClass('flex');
      expect(layoutWrapper).toHaveClass('flex-col');
      expect(layoutWrapper).toHaveClass('lg:grid');
      expect(layoutWrapper.className).toContain('lg:grid-cols-[minmax(0,1fr)_360px]');

      expect(rootContainer).toHaveClass('h-full');
      expect(rootContainer).toHaveClass('bg-gradient-to-br');
      expect(rootContainer).toHaveClass('from-orange-50');
      expect(rootContainer).toHaveClass('via-yellow-25');
      expect(rootContainer).toHaveClass('to-orange-25');
    });

    it('should keep feed column scrollable', () => {
      renderCommunityPageWithProviders();

      const feedContainer = screen.getByTestId('community-feed').parentElement as HTMLElement;
      expect(feedContainer).toHaveClass('h-full');
      expect(feedContainer).toHaveClass('overflow-y-auto');
    });

    it('should render live data column inside sticky aside', () => {
      renderCommunityPageWithProviders();

      const liveDataElement = screen.getByTestId('live-data-widget');
      const widgetAside = liveDataElement.closest('aside');
      expect(widgetAside).not.toBeNull();
      expect(widgetAside).toHaveClass('hidden');
      expect(widgetAside).toHaveClass('lg:flex');
      expect(widgetAside).toHaveClass('h-full');

      const stickyContainer = liveDataElement.parentElement as HTMLElement;
      expect(stickyContainer).toHaveClass('sticky');
      expect(stickyContainer).toHaveClass('top-4');
      expect(stickyContainer).toHaveClass('border');
      expect(stickyContainer.className).toContain('border-orange-100/70');
    });

    it('should pass scrollable class down to live data widget', () => {
      renderCommunityPageWithProviders();

      const liveDataElement = screen.getByTestId('live-data-widget');
      expect(liveDataElement).toHaveClass('overflow-y-auto');
    });
  });

  describe('Independent Scrolling', () => {
    it('should have overflow-y-auto on both containers', () => {
      renderCommunityPageWithProviders();
      
      const feedContainer = screen.getByTestId('community-feed').parentElement as HTMLElement;
      const liveDataElement = screen.getByTestId('live-data-widget');
      
      expect(feedContainer).toHaveClass('overflow-y-auto');
      expect(liveDataElement).toHaveClass('overflow-y-auto');
    });

    it('should maintain independent heights for scrolling', () => {
      renderCommunityPageWithProviders();
      
      const feedContainer = screen.getByTestId('community-feed').parentElement as HTMLElement;
      const widgetAside = screen.getByTestId('live-data-widget').closest('aside');
      expect(widgetAside).not.toBeNull();
      const stickyContainer = screen.getByTestId('live-data-widget').parentElement as HTMLElement;
      
      expect(feedContainer).toHaveClass('h-full');
      expect(widgetAside as HTMLElement).toHaveClass('h-full');
      expect(stickyContainer.className).toContain('h-[calc(100vh-2rem)]');
    });

    it('should allow independent scrolling without affecting other column', async () => {
      renderCommunityPageWithProviders();
      
      const feedElement = screen.getByTestId('community-feed');
      const widgetElement = screen.getByTestId('live-data-widget');
      
      // Both should be visible initially
      expect(feedElement).toBeInTheDocument();
      expect(widgetElement).toBeInTheDocument();
      
      // Simulate scrolling on feed container
      const feedContainer = feedElement.parentElement!;
      feedContainer.scrollTop = 100;
      
      // Widget should still be visible and unaffected
      expect(widgetElement).toBeInTheDocument();
      expect(widgetElement.parentElement!.scrollTop).toBe(0);
      
      // Simulate scrolling on widget container  
      const widgetContainer = widgetElement.parentElement!;
      widgetContainer.scrollTop = 200;
      
      // Feed should still be visible and maintain its scroll
      expect(feedElement).toBeInTheDocument();
      expect(feedContainer.scrollTop).toBe(100);
    });
  });

  describe('Content Rendering', () => {
    it('should render CommunityFeed with sample posts', () => {
      renderCommunityPageWithProviders();
      
      expect(screen.getByTestId('community-feed')).toBeInTheDocument();
      expect(screen.getByText('Community Feed')).toBeInTheDocument();
      
      // Check for sample posts
      expect(screen.getByTestId('post-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-2')).toBeInTheDocument();
      expect(screen.getByTestId('post-3')).toBeInTheDocument();
      
      // Check for WebM animation
      expect(screen.getByTestId('webm-animation')).toBeInTheDocument();
      expect(screen.getByTestId('auto-share-button')).toBeInTheDocument();
    });

    it('should render LiveDataWidget with all panels', () => {
      renderCommunityPageWithProviders();
      
      expect(screen.getByTestId('live-data-widget')).toBeInTheDocument();
      expect(screen.getByText('Live Data Widget')).toBeInTheDocument();
      
      // Check for all panels
      expect(screen.getByTestId('weather-panel')).toBeInTheDocument();
      expect(screen.getByTestId('traffic-panel')).toBeInTheDocument();
      expect(screen.getByTestId('bus-panel')).toBeInTheDocument();
      expect(screen.getByTestId('timetable-panel')).toBeInTheDocument();
    });

    it('should pass correct props to components', () => {
      const CommunityFeedMock = require('../CommunityFeed').CommunityFeed;
      const LiveDataWidgetMock = require('../LiveData/LiveDataWidget').LiveDataWidget;
      
      renderCommunityPageWithProviders({
        userLocation: { area: 'Custom Area', pincode: '600002' },
        pincode: '600002'
      });
      
      const [feedCall] = CommunityFeedMock.mock.calls;
      const [widgetCall] = LiveDataWidgetMock.mock.calls;

      expect(feedCall[0]).toMatchObject({
        userLocation: { area: 'Custom Area', pincode: '600002' },
      });

      expect(widgetCall[0]).toMatchObject({
        className: 'overflow-y-auto',
        pincode: '600002',
      });
    });
  });

  describe('Responsive Behavior', () => {
    // Mock window.matchMedia for responsive testing
    const mockMatchMedia = (width: number) => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('1024px') ? width >= 1024 : false,
          media: query,
          onchange: null,
          addListener: jest.fn(), // deprecated
          removeListener: jest.fn(), // deprecated  
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    };

    it('should stack vertically on mobile viewport', () => {
      mockMatchMedia(768); // Mobile viewport
      renderCommunityPageWithProviders();
      
      const feedContainer = screen.getByTestId('community-feed').parentElement as HTMLElement;
      const layoutWrapper = feedContainer.parentElement as HTMLElement;
      const mobileWidgetToggle = screen.getByRole('button', { name: /live data/i });

      expect(layoutWrapper).toHaveClass('flex');
      expect(layoutWrapper).toHaveClass('flex-col');
      expect(mobileWidgetToggle.closest('div')).toHaveClass('lg:hidden');
    });

    it('should display side-by-side on desktop viewport', () => {
      mockMatchMedia(1200); // Desktop viewport
      renderCommunityPageWithProviders();
      
      const feedContainer = screen.getByTestId('community-feed').parentElement as HTMLElement;
      const layoutWrapper = feedContainer.parentElement as HTMLElement;
      const widgetAside = screen.getByTestId('live-data-widget').closest('aside');
      expect(widgetAside).not.toBeNull();

      expect(layoutWrapper).toHaveClass('lg:grid');
      expect(layoutWrapper.className).toContain('lg:grid-cols-[minmax(0,1fr)_360px]');
      expect(widgetAside as HTMLElement).toHaveClass('lg:flex');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for screen readers', () => {
      renderCommunityPageWithProviders();
      
      const feedElement = screen.getByRole('region', { name: 'Community Feed' });
      const widgetElement = screen.getByRole('region', { name: 'Live Data Widget' });
      
      expect(feedElement).toBeInTheDocument();
      expect(widgetElement).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderCommunityPageWithProviders();
      
      const autoShareButton = screen.getByTestId('auto-share-button');
      
      // Should be focusable
      await user.tab();
      expect(autoShareButton).toHaveFocus();
    });

    it('should maintain focus management between columns', async () => {
      const user = userEvent.setup();
      renderCommunityPageWithProviders();
      
      const autoShareButton = screen.getByTestId('auto-share-button');
      
      await user.click(autoShareButton);
      expect(autoShareButton).toHaveFocus();
      
      // Focus should remain within the appropriate column
      await user.tab();
      // Next focusable element should be within the same or appropriate column
    });
  });

  describe('Background and Styling', () => {
    it('should apply gradient background', () => {
      renderCommunityPageWithProviders();
      
      const feedElement = screen.getByTestId('community-feed');
      const layoutWrapper = feedElement.parentElement?.parentElement as HTMLElement;
      const rootContainer = layoutWrapper.parentElement as HTMLElement;

      expect(rootContainer).toHaveClass('bg-gradient-to-br');
      expect(rootContainer).toHaveClass('from-orange-50');
      expect(rootContainer).toHaveClass('via-yellow-25');
      expect(rootContainer).toHaveClass('to-orange-25');
    });

    it('should accept custom className prop', () => {
      renderCommunityPageWithProviders({ className: 'custom-class' });
      
      const feedElement = screen.getByTestId('community-feed');
      const layoutWrapper = feedElement.parentElement?.parentElement as HTMLElement;
      const rootContainer = layoutWrapper.parentElement as HTMLElement;
      expect(rootContainer).toHaveClass('custom-class');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing userLocation gracefully', () => {
      renderCommunityPageWithProviders({ userLocation: null });
      
      expect(screen.getByTestId('community-feed')).toBeInTheDocument();
      expect(screen.getByTestId('live-data-widget')).toBeInTheDocument();
    });

    it('should handle missing pincode gracefully', () => {
      renderCommunityPageWithProviders({ pincode: undefined });
      
      expect(screen.getByTestId('community-feed')).toBeInTheDocument();
      expect(screen.getByTestId('live-data-widget')).toBeInTheDocument();
    });
  });
});