/**
 * LiveInfoPage - Comprehensive page for all live information and alerts
 * 
 * This page replaces the previous temple info functionality and provides
 * a centralized location for all live data including:
 * - Location-specific alerts
 * - Weather information
 * - Traffic status
 * - Bus stops and timing
 * - CMRL timetable
 * - Public services status
 * 
 * Features:
 * - Full-screen layout with proper scrolling
 * - Bilingual support (Tamil/English)
 * - Real-time data updates
 * - Location-aware content based on pincode
 * - Back navigation support
 */

import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../services/LanguageService';
import BusByPincodeCard from './BusByPincodeCard';
import { LiveAlertsPanel } from './LiveData/LiveAlertsPanel';
import { TrafficStatusPanel } from './LiveData/TrafficStatusPanel';
import { WeatherPanel } from './LiveData/WeatherPanel';
import TimetableCard from './TimetableCard';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface LiveInfoPageProps {
  /** User location data for location-aware content */
  userLocation?: any;
  /** Optional callback for back navigation */
  onBack?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LiveInfoPage Component
 * 
 * This page component displays all live information and alerts in one place.
 * It replaces the temple info functionality with comprehensive live data.
 */
export function LiveInfoPage({ 
  userLocation, 
  onBack,
  className = '' 
}: LiveInfoPageProps) {
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create location object for components
  const locationData = userLocation || {
    area: 'Chennai',
    pincode: '600001',
    district: 'Chennai'
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Bilingual content
  const content = {
    en: {
      title: 'Live Info & Alerts',
      subtitle: 'Real-time updates for your area',
      back: 'Back',
      refresh: 'Refresh',
      noPincode: 'Set your pincode to get location-specific information',
      loading: 'Loading live information...',
      error: 'Unable to load information. Please try again.',
      footer: 'Information updates automatically every few minutes'
    },
    ta: {
      title: 'நேரடி தகவல் மற்றும் எச்சரிக்கைகள்',
      subtitle: 'உங்கள் பகுதிக்கான நேரடி புதுப்பிப்புகள்',
      back: 'பின்செல்',
      refresh: 'புதுப்பிக்க',
      noPincode: 'இடம் சார்ந்த தகவல்களைப் பெற உங்கள் பின்கோடை அமைக்கவும்',
      loading: 'நேரடி தகவல்களை ஏற்றுகிறது...',
      error: 'தகவல்களை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      footer: 'தகவல்கள் ஒவ்வொரு சில நிமிடங்களுக்கும் தானாகவே புதுப்பிக்கப்படும்'
    }
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                onClick={onBack}
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="ml-2">{t.back}</span>
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t.title}</h1>
                <p className="text-blue-100 text-sm">
                  {locationData.area && locationData.pincode 
                    ? `${locationData.area} • ${locationData.pincode}`
                    : t.subtitle
                  }
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="ml-2">{t.refresh}</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {!locationData.pincode ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📍</div>
            <p className="text-gray-600 mb-4">{t.noPincode}</p>
          </Card>
        ) : (
          <>
            {/* Live Alerts Section */}
            <Card className="p-6">
              <LiveAlertsPanel userLocation={locationData} />
            </Card>

            {/* Weather & Traffic Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <WeatherPanel />
              </Card>
              <Card className="p-6">
                <TrafficStatusPanel userLocation={locationData} />
              </Card>
            </div>

            {/* Transportation Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <BusByPincodeCard pincode={locationData.pincode} />
              </Card>
              <Card className="p-6">
                <TimetableCard language={language === 'ta-rom' ? 'ta' : language} />
              </Card>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>{t.footer}</p>
        </div>
      </div>
    </div>
  );
}