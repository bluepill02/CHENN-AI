import React, { useState } from 'react';
import { CommunityFeed } from './CommunityFeed';
import { LocalServices } from './LocalServices';
import { ChatScreen } from './ChatScreen';
import { ProfileScreen } from './ProfileScreen';
import { BottomNav } from './BottomNav';
import { LocationModal } from './LocationModal';
import { LiveDataWidget } from './LiveData';
import { LocationProvider, useLocation } from '../services/LocationService';
import { RealTimeDataProvider } from '../services/RealTimeDataService';
import { ExternalDataProvider } from '../services/ExternalDataService';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Screen = 'home' | 'services' | 'chat' | 'profile';

interface MainAppProps {
  userLocation?: any;
}

function MainAppContent({ userLocation }: MainAppProps) {
  const { currentLocation } = useLocation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showLiveData, setShowLiveData] = useState(false);

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
      <div className="flex-1 overflow-y-auto relative z-10">
        {renderScreen()}
      </div>
      
      {/* Live Data Widget - Floating */}
      <div className={`fixed bottom-20 right-4 z-30 transition-all duration-300 ease-in-out ${
        showLiveData ? 'w-80' : 'w-auto'
      }`}>
        <LiveDataWidget 
          isExpanded={showLiveData}
          onToggle={() => setShowLiveData(!showLiveData)}
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