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
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../services/LanguageService';
import { useLiveAlerts, type LiveAlertsFilters } from '../services/LiveAlertsService';
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
  const {
    alerts,
    loading,
    error,
    isUsingBackend,
    lastSync,
    pendingReports,
    refresh,
    acknowledge,
    currentFilters,
  } = useLiveAlerts();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const filtersRef = useRef<LiveAlertsFilters>({ ...currentFilters });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filtersRef.current = { ...currentFilters };
  }, [currentFilters]);

  useEffect(() => {
    const previous = filtersRef.current;
    const nextFilters: LiveAlertsFilters = {
      ...previous,
      pincode: currentPincode ?? userLocation?.pincode ?? previous.pincode,
      area: userLocation?.area ?? previous.area,
    };
    const changed =
      nextFilters.pincode !== previous.pincode ||
      nextFilters.area !== previous.area;

    if (changed) {
      filtersRef.current = nextFilters;
      void refresh(nextFilters);
    }
  }, [currentPincode, userLocation?.pincode, userLocation?.area, refresh]);

  const showToast = (message: string, tone: 'success' | 'error') => {
    setToast({ message, tone });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh(filtersRef.current);
    } catch (refreshError) {
      console.warn('LiveAlertsPage: refresh failed', refreshError);
      showToast(currentText.refreshError, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledge(alertId);
      showToast(currentText.ackSuccess, 'success');
    } catch (ackError) {
      console.warn('LiveAlertsPage: acknowledge failed', ackError);
      showToast(currentText.ackError, 'error');
    }
  };

  // Bilingual text mapping
  const texts = {
    en: {
      title: 'Live Alerts',
      subtitle: 'Location-based updates for your area',
      refresh: 'Refresh alerts',
      loadingLabel: 'Refreshing…',
      noPincode: 'Set your pincode to get location-specific alerts',
      footer: 'Alerts update automatically based on your location.',
      statusBackend: 'Live Chennai backend connected',
      statusSimulation: 'Community simulation active',
      pendingQueued: 'Queued reports waiting to sync: {{count}}',
      lastSynced: 'Last synced',
      noSync: 'Not synced yet',
      ackSuccess: 'Marked alert as read',
      ackError: 'Unable to update alert',
      refreshError: 'Could not refresh alerts',
      emptyMessage: 'No active alerts for your area right now.',
    },
    ta: {
      title: 'நேரடி எச்சரிக்கைகள்',
      subtitle: 'உங்கள் பகுதிக்கான இருப்பிடம் அடிப்படையிலான புதுப்பிப்புகள்',
      refresh: 'எச்சரிக்கைகளை புதுப்பிக்கவும்',
      loadingLabel: 'புதுப்பிக்கிறது...',
      noPincode: 'இருப்பிடம் சார்ந்த எச்சரிக்கைகளைப் பெற உங்கள் PIN குறியீட்டை அமைக்கவும்',
      footer: 'உங்கள் இருப்பிடத்தின் அடிப்படையில் எச்சரிக்கைகள் தானாகவே புதுப்பிக்கப்படும்.',
      statusBackend: 'சென்னை பின்புற சேவை இணைக்கப்பட்டுள்ளது',
      statusSimulation: 'சமூக சிமுலேஷன் இயங்குகிறது',
      pendingQueued: 'ஒத்திசைக்க காத்திருக்கும் சமர்ப்பிப்புகள்: {{count}}',
      lastSynced: 'கடைசியாக ஒத்திசைக்கப்பட்டது',
      noSync: 'இன்னும் ஒத்திசைக்கப்படவில்லை',
      ackSuccess: 'எச்சரிக்கை பார்க்கப்பட்டது என குறிக்கப்பட்டது',
      ackError: 'எச்சரிக்கையை இப்போது புதுப்பிக்க முடியவில்லை',
      refreshError: 'எச்சரிக்கைகளைப் புதுப்பிக்க முடியவில்லை',
      emptyMessage: 'உங்கள் பகுதியில் செயலில் உள்ள எச்சரிக்கைகள் இல்லை.',
    }
  };

  const currentText = texts[language as keyof typeof texts] || texts.en;
  const busy = loading || isRefreshing;
  const statusVariant: 'success' | 'warning' | 'danger' =
    alerts.length === 0 && !!error ? 'danger' : isUsingBackend ? 'success' : 'warning';
  const statusClasses =
    statusVariant === 'success'
      ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
      : statusVariant === 'warning'
      ? 'border-amber-200 bg-amber-50/80 text-amber-900'
      : 'border-red-200 bg-red-50/80 text-red-800';
  const primaryStatusText =
    statusVariant === 'success' ? currentText.statusBackend : error ?? currentText.statusSimulation;
  const secondaryStatusText = lastSync
    ? `${currentText.lastSynced}: ${lastSync.toLocaleString()}`
    : currentText.noSync;
  const pendingLabel = pendingReports.length > 0
    ? currentText.pendingQueued.replace('{{count}}', pendingReports.length.toString())
    : null;
  const areaLabel = userLocation?.area ?? undefined;

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
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 rounded-md px-4 py-2 shadow-lg ${
              toast.tone === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
            role="status"
          >
            {toast.message}
          </div>
        )}
        {/* Page Container with consistent padding */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          
          {/* Header Section */}
          <div className="mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentText.title}
              </h1>
              <p className="text-gray-600">
                {currentText.subtitle}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {currentPincode && (
                  <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    📍 PIN: {currentPincode}
                  </span>
                )}
                {areaLabel && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {areaLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Card className={`p-6 border ${statusClasses}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold">{primaryStatusText}</p>
                  <p className="text-sm opacity-90">{secondaryStatusText}</p>
                  {pendingLabel && (
                    <p className="text-sm opacity-90">{pendingLabel}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {busy && (
                    <span className="text-sm italic opacity-80">
                      {currentText.loadingLabel}
                    </span>
                  )}
                  <Button
                    onClick={handleRefresh}
                    disabled={busy}
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${busy ? 'animate-spin' : ''}`} />
                    {currentText.refresh}
                  </Button>
                </div>
              </div>
            </Card>

            {!currentPincode && (
              <Card className="border-dashed border-orange-300 bg-white/60 p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {currentText.noPincode}
                </h3>
                <p className="text-gray-600 text-sm">{currentText.footer}</p>
              </Card>
            )}

            <Card className="p-6 border-orange-200 bg-white/80 backdrop-blur-sm">
              <LiveAlertsPanel
                alerts={alerts}
                loading={busy}
                error={error}
                onAcknowledge={handleAcknowledge}
                className="w-full"
                emptyMessage={currentText.emptyMessage}
                heading={null}
                showSummary={false}
              />
            </Card>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {currentText.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveAlertsPage;