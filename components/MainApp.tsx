import { Outlet, useLocation } from 'react-router-dom';
import { StreetDock } from './StreetDock';
import { ExternalDataProvider } from '../services/ExternalDataService';
import { RealTimeDataProvider } from '../services/RealTimeDataService';
import { LocationModal } from './LocationModal';
import { AiAssistant } from './AiAssistant';
import { AutoMeterLoading } from './MicroInteractions';
import { useState, useEffect } from 'react';

export function MainApp() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5s for the "Meter Podu" effect
    return () => clearTimeout(timer);
  }, []);

  // Hide bottom nav and AI assistant on live updates screen
  const isLiveUpdatesScreen = location.pathname === '/live';

  return (
    <RealTimeDataProvider>
      <ExternalDataProvider>
        <div className="w-full max-w-md mx-auto bg-gradient-to-br from-auto-black via-gray-900 to-auto-black min-h-screen flex flex-col relative overflow-hidden">

          {/* Global Auto Meter Loader */}
          <AutoMeterLoading isLoading={isLoading} />

          {/* Main content area */}
          <div className="flex-1 overflow-y-auto relative z-10 pb-24">
            <Outlet />
          </div>

          {/* AI Assistant - hide on live updates screen */}
          {!isLiveUpdatesScreen && <AiAssistant />}

          {/* Bottom navigation - hide on live updates screen */}
          {!isLiveUpdatesScreen && <StreetDock />}

          {/* Location modal */}
          <LocationModal />
        </div>
      </ExternalDataProvider>
    </RealTimeDataProvider>
  );
}