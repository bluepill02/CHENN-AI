import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { MainApp } from './components/MainApp';
import { PincodeVerification } from './components/PincodeVerification';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LanguageProvider } from './services/LanguageService';
import { LocationProvider } from './services/LocationService';
import { PincodeContextProvider } from './services/PincodeContext';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'pincode' | 'main'>('welcome');
  const [userLocationData, setUserLocationData] = useState<any>(null);

  const handleWelcomeContinue = () => {
    setCurrentScreen('pincode');
  };

  const handlePincodeVerification = (locationData: any) => {
    setUserLocationData(locationData);
    setCurrentScreen('main');
  };

  const handlePincodeSkip = () => {
    setCurrentScreen('main');
  };

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LocationProvider>
          <PincodeContextProvider>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-25 relative overflow-hidden">
            <div className="relative z-10">
              {currentScreen === 'welcome' && (
                <WelcomeScreen onContinue={handleWelcomeContinue} />
              )}
              {currentScreen === 'pincode' && (
                <PincodeVerification 
                  onVerificationComplete={handlePincodeVerification}
                  onSkip={handlePincodeSkip}
                />
              )}
              {currentScreen === 'main' && (
                <MainApp userLocation={userLocationData} />
              )}
            </div>
          </div>
          </PincodeContextProvider>
        </LocationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}