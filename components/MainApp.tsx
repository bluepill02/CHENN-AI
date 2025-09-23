import { useRef, useState } from 'react';
import { ExternalDataProvider } from '../services/ExternalDataService';
import { LocationProvider, useLocation } from '../services/LocationService';
import { RealTimeDataProvider } from '../services/RealTimeDataService';
import { BottomNav } from './BottomNav';
import { ChatScreen } from './ChatScreen';
import { CommunityFeed } from './CommunityFeed';
import { LocationAwareLiveData } from './LiveData/LocationAwareLiveData';
import { LocalServices } from './LocalServices';
import { LocationModal } from './LocationModal';
import { ProfileScreen } from './ProfileScreen';

type Screen = 'home' | 'services' | 'chat' | 'profile';

interface MainAppProps {
  userLocation?: any;
}

function MainAppContent({ userLocation }: MainAppProps) {
  const { currentLocation } = useLocation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showLiveData, setShowLiveData] = useState(false);
  const scrollRef = useRef<number>(0);

  const renderScreen = () => {
    // Use currentLocation from context if available, fallback to userLocation prop
    const locationData = currentLocation || userLocation;
    
    switch (currentScreen) {
      case 'home':
        return <CommunityFeed userLocation={locationData} />;
      case 'services':
        return <LocalServices userLocation={locationData} />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <CommunityFeed userLocation={locationData} />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-orange-50 via-yellow-25 to-orange-25 min-h-screen flex flex-col relative overflow-hidden">
      {/* Main content area */}
      <div
        className="flex-1 overflow-y-auto relative z-10"
        onScroll={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          const currentY = target.scrollTop;
          const lastY = (scrollRef.current ?? 0) as number;
          const delta = currentY - lastY;

          // small threshold to avoid jitter
          if (Math.abs(delta) < 15) {
            // update last position but do nothing
            scrollRef.current = currentY as any;
            return;
          }

          if (delta > 0) {
            // scrolling down -> minimize
            setShowLiveData(false);
          } else if (delta < 0) {
            // scrolling up -> expand
            setShowLiveData(true);
          }

          scrollRef.current = currentY as any;
        }}
      >
        {renderScreen()}
      </div>
      {/* Live Data Widget - Floating */}
      <div className="live-widget-wrapper fixed bottom-20 right-4 z-30 transition-all duration-300 ease-in-out w-auto">
        <LocationAwareLiveData 
          collapsed={!showLiveData}
          onCollapseChange={(c) => setShowLiveData(!c)}
          userLocation={userLocation}
        />
      </div>

      
      {/* Bottom navigation */}
      <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      
      {/* Location modal */}
      <LocationModal />
    </div>
  );
}

export function MainApp({ userLocation }: MainAppProps) {
  return (
    <LocationProvider>
      <RealTimeDataProvider>
        <ExternalDataProvider>
          <MainAppContent userLocation={userLocation} />
        </ExternalDataProvider>
      </RealTimeDataProvider>
    </LocationProvider>
  );
}