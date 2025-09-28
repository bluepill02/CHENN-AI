import { Suspense, lazy, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AutoShareProvider } from './services/AutoShareService';
import { FoodHuntProvider } from './services/FoodHuntService';
import { LanguageProvider } from './services/LanguageService';
import { LiveAlertsProvider } from './services/LiveAlertsService';
import { LocalityRatingsProvider } from './services/LocalityRatingsService';
import { LocationProvider } from './services/LocationService';
import { PincodeContextProvider } from './services/PincodeContext';

const WelcomeScreen = lazy(() =>
  import('./components/WelcomeScreen').then(module => ({ default: module.WelcomeScreen }))
);
const PincodeVerification = lazy(() =>
  import('./components/PincodeVerification').then(module => ({ default: module.PincodeVerification }))
);
const MainApp = lazy(() =>
  import('./components/MainApp').then(module => ({ default: module.MainApp }))
);
const AutoSharePage = lazy(() => import('./components/AutoSharePage'));
const AutoShareDetailPage = lazy(() => import('./components/AutoShareDetailPage'));
const AutoShareCreatePage = lazy(() => import('./components/AutoShareCreatePage'));
const MyRidesPage = lazy(() => import('./components/MyRidesPage'));
const AutoShareHistoryPage = lazy(() => import('./components/AutoShareHistoryPage'));
const LocalityRatingsPage = lazy(() => import('./src/pages/LocalityRatingsPage'));
const LocalityDetailPageNew = lazy(() => import('./src/pages/LocalityDetailPage'));
const FoodHuntPage = lazy(() => import('./components/FoodHuntPage'));
const FoodHuntCreate = lazy(() => import('./components/foodhunt/FoodHuntCreate'));
const DishDetail = lazy(() => import('./components/foodhunt/DishDetail'));
const EngaAreaPage = lazy(() => import('./components/EngaAreaPage'));

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

  const renderLoader = (message: string) => (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-lg font-semibold text-orange-600 animate-pulse">{message}</p>
    </div>
  );

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LocationProvider>
          <PincodeContextProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-25 relative overflow-hidden">
                <div className="relative z-10">
                  {currentScreen === 'welcome' && (
                    <Suspense fallback={renderLoader('Preparing your Chennai welcome...')}>
                      <WelcomeScreen onContinue={handleWelcomeContinue} />
                    </Suspense>
                  )}
                  {currentScreen === 'pincode' && (
                    <Suspense fallback={renderLoader('Loading pincode verification...')}>
                      <PincodeVerification 
                        onVerificationComplete={handlePincodeVerification}
                        onSkip={handlePincodeSkip}
                      />
                    </Suspense>
                  )}
                  {currentScreen === 'main' && (
                    <Suspense fallback={renderLoader('Loading Chennai experience...')}>
                      <AutoShareProvider>
                        <FoodHuntProvider>
                          <LocalityRatingsProvider
                            initialFilters={{
                              pincode: userLocationData?.pincode,
                              area: userLocationData?.area,
                            }}
                          >
                            <LiveAlertsProvider
                              initialFilters={{
                                pincode: userLocationData?.pincode,
                                area: userLocationData?.area,
                              }}
                            >
                              <Routes>
                                <Route path="/" element={<MainApp userLocation={userLocationData} />} />
                                <Route path="/auto-share" element={<AutoSharePage />} />
                                <Route path="/auto-share/:id" element={<AutoShareDetailPage />} />
                                <Route path="/auto-share/create" element={<AutoShareCreatePage />} />
                                <Route path="/auto-share/history" element={<AutoShareHistoryPage />} />
                                <Route path="/auto-share/my" element={<MyRidesPage />} />
                                <Route path="/localities" element={<LocalityRatingsPage />} />
                                <Route path="/localities/:id" element={<LocalityDetailPageNew />} />
                                <Route path="/food-hunt" element={<FoodHuntPage />} />
                                <Route path="/food-hunt/new" element={<FoodHuntCreate />} />
                                <Route path="/food-hunt/:dishId" element={<DishDetail />} />
                                <Route path="/enga-area" element={<EngaAreaPage />} />
                              </Routes>
                            </LiveAlertsProvider>
                          </LocalityRatingsProvider>
                        </FoodHuntProvider>
                      </AutoShareProvider>
                    </Suspense>
                  )}
                </div>
              </div>
            </Router>
          </PincodeContextProvider>
        </LocationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
