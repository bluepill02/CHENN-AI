import { useState } from 'react';
import { ChatDashboardProvider } from '../services/ChatDashboardService';
import { ExternalDataProvider } from '../services/ExternalDataService';
import { LocationProvider, useLocation } from '../services/LocationService';
import { ProfileDashboardProvider } from '../services/ProfileDashboardService';
import { RealTimeDataProvider } from '../services/RealTimeDataService';
import { BottomNav } from './BottomNav';
import { ChatScreen } from './ChatScreen';
import { CommunityPage } from './CommunityPage';
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

  const renderScreen = () => {
    // Use currentLocation from context if available, fallback to userLocation prop
    const locationData = currentLocation || userLocation;
    
    switch (currentScreen) {
      case 'home':
        return <CommunityPage userLocation={locationData} pincode={locationData?.pincode} />;
      case 'services':
        return <LocalServices userLocation={locationData} />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <CommunityPage userLocation={locationData} pincode={locationData?.pincode} />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Main content area - Full height minus bottom navigation */}
      <div className="flex-1 min-h-0">
        {renderScreen()}
      </div>
      
      {/* Fixed bottom navigation */}
      <div className="flex-shrink-0">
        <BottomNav currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      </div>
      
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
          <ChatDashboardProvider
            initialFilters={{
              area: userLocation?.area ?? userLocation?.location ?? null,
              query: userLocation?.area ?? '',
            }}
          >
            <ProfileDashboardProvider initialArea={userLocation?.area ?? userLocation?.location ?? null}>
              <MainAppContent userLocation={userLocation} />
            </ProfileDashboardProvider>
          </ChatDashboardProvider>
        </ExternalDataProvider>
      </RealTimeDataProvider>
    </LocationProvider>
  );
}