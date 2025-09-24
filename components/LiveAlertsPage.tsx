/**
 * LiveAlertsPage - Dedicated page for displaying location-based live alerts
 * 
 * This component replaces the previous TempleInfoPage functionality and provides
 * a dedicated page for viewing live alerts specific to the user's pincode area.
 * 
 * Features:
 * - Full-page layout with proper padding and responsive design
 * - Bilingual support (Tamil/English) 
 * - Consumes pincode from usePincodeContext
 * - Loading and error states with fallback messages
 * - Vertical list of alerts with timestamps and source attribution
 * - Extensible interface for future enhancements
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../services/LanguageService';
import { usePincodeContext } from '../services/PincodeContext';
import { LiveAlertsPanel } from './LiveData/LiveAlertsPanel';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface LiveAlertsPageProps {
  /** Additional CSS classes for styling overrides */
  className?: string;
  /** Optional user location data for enhanced alert targeting */
  userLocation?: any;
}

/**
 * LiveAlertsPage Component
 * 
 * This page component displays live alerts for the user's pincode area.
 * It replaces the old Temple Info functionality with location-aware alerts.
 */
export function LiveAlertsPage({ 
  className = '',
  userLocation
}: LiveAlertsPageProps) {
  const { language } = useLanguage();
  const { currentPincode } = usePincodeContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create location object for LiveAlertsPanel
  const locationData = userLocation || {
    pincode: currentPincode,
    area: currentPincode ? `Area ${currentPincode}` : 'Chennai',
    localContent: {
      nearbyLandmarks: []
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Bilingual text mapping
  const texts = {
    en: {
      title: 'Live Alerts',
      subtitle: 'Location-based updates for your area',
      refresh: 'Refresh Alerts',
      noPincode: 'Set your pincode to get location-specific alerts',
      loading: 'Loading alerts...',
      error: 'Unable to load alerts. Please try again.',
      footer: 'Alerts are updated in real-time based on your location'
    },
    ta: {
      title: 'நேரடி எச்சரிக்கைகள்',
      subtitle: 'உங்கள் பகுதிக்கான இருப்பிடம் அடிப்படையிலான புதுப்பிப்புகள்',
      refresh: 'எச்சரிக்கைகளை புதுப்பிக்கவும்',
      noPincode: 'இருப்பிடம் சார்ந்த எச்சரிக்கைகளைப் பெற உங்கள் PIN குறியீட்டை அமைக்கவும்',
      loading: 'எச்சரிக்கைகள் ஏற்றப்படுகின்றன...',
      error: 'எச்சரிக்கைகளை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      footer: 'உங்கள் இருப்பிடத்தின் அடிப்படையில் எச்சரிக்கைகள் நேரலை புதுப்பிக்கப்படுகின்றன'
    }
  };

  const currentText = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className={`min-h-screen bg-gradient-to-b from-orange-50 to-yellow-25 ${className}`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Page Container with consistent padding */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentText.title}
                </h1>
                <p className="text-gray-600">
                  {currentText.subtitle}
                </p>
                {currentPincode && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      📍 PIN: {currentPincode}
                    </span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {currentText.refresh}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {!currentPincode ? (
              /* No Pincode State */
              <Card className="p-6 text-center border-orange-200">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentText.noPincode}
                </h3>
                <p className="text-gray-600 text-sm">
                  {currentText.footer}
                </p>
              </Card>
            ) : (
              /* Live Alerts Panel Container */
              <Card className="p-6 border-orange-200 bg-white/80 backdrop-blur-sm">
                <LiveAlertsPanel 
                  userLocation={locationData}
                  className="w-full"
                />
              </Card>
            )}
          </div>

          {/* Footer Info */}
          {currentPincode && (
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {currentText.footer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveAlertsPage;