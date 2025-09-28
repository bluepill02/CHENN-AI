/**
 * PincodePage Component
 * 
 * Centralized pincode management page that accepts any valid 6-digit Indian pincode.
 * 
 * Data Flow:
 * 1. User input → validate format (6 digits) → update pincode context
 * 2. Context update → triggers downstream services (busService, metroService, etc.)
 * 3. Services fetch → cards re-render with new data
 * 
 * Features:
 * - Real pincode validation (not mock-only)
 * - Integration with usePincodeContext
 * - Service debugging and error handling
 * - Loading states and error banners
 * - Modular design for easy card addition
 */

import { AlertCircle, CheckCircle, Loader2, MapPin, Wifi, WifiOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePincodeContext } from '../services/PincodeContext';
import { BusByPincodeCard } from './BusByPincodeCard';
import { TrafficPanel } from './LiveData/TrafficPanel';
import { WeatherPanel } from './LiveData/WeatherPanel';
import TimetableCard from './TimetableCard';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
// Uncomment when these components exist:
// import { TwitterLocalCard } from './TwitterLocalCard';
// import { TempleInfoPanel } from './TempleInfoPanel';

export interface PincodePageProps {
  /** Optional initial pincode to load */
  initialPincode?: string;
  /** Callback when pincode is successfully set */
  onPincodeSet?: (pincode: string) => void;
  /** Whether to show advanced debugging info */
  showDebugInfo?: boolean;
}

export function PincodePage({ 
  initialPincode, 
  onPincodeSet, 
  showDebugInfo = false 
}: PincodePageProps) {
  const [inputValue, setInputValue] = useState(initialPincode || '');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  const {
    currentPincode,
    isValidating,
    validationError,
    isLoadingServices,
    failedServices,
    setPincode,
    validatePincode,
    clearPincode,
    getPincodeInfo
  } = usePincodeContext();

  // Set initial pincode if provided
  useEffect(() => {
    if (initialPincode && !currentPincode) {
      handlePincodeSubmit();
    }
  }, [initialPincode, currentPincode]);

  // Call onPincodeSet when pincode is successfully set
  useEffect(() => {
    if (currentPincode && onPincodeSet) {
      onPincodeSet(currentPincode);
    }
  }, [currentPincode, onPincodeSet]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setInputValue(value);
  };

  const handlePincodeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue) {
      return;
    }

    console.debug('🏷️ PincodePage: Submitting pincode:', inputValue);
    const success = await setPincode(inputValue);
    
    if (success) {
      console.debug('✅ PincodePage: Pincode submitted successfully');
    } else {
      console.debug('❌ PincodePage: Pincode submission failed');
    }
  };

  const handleClearPincode = () => {
    setInputValue('');
    clearPincode();
    console.debug('🏷️ PincodePage: Pincode cleared');
  };

  const inputValidation = validatePincode(inputValue);
  const pincodeInfo = currentPincode ? getPincodeInfo(currentPincode) : null;
  const hasFailedServices = failedServices.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-25 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="p-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white border-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Chennai Community Hub</h1>
              <p className="text-orange-100">Enter your pincode to access local services</p>
            </div>
          </div>
          
          {/* Pincode Input Form */}
          <form onSubmit={handlePincodeSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Enter 6-digit pincode (e.g., 600001)"
                value={inputValue}
                onChange={handleInputChange}
                className={`bg-white/90 border-0 text-gray-900 placeholder-gray-500 ${
                  inputValue && !inputValidation.isValid ? 'ring-2 ring-red-400' : ''
                }`}
                disabled={isValidating}
              />
              {inputValue && !inputValidation.isValid && (
                <div className="absolute top-full left-0 mt-1 text-xs text-red-200" role="alert">
                  {inputValidation.error}
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!inputValidation.isValid || isValidating}
              className="bg-white text-orange-500 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Set Pincode"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span className="sr-only">Set Pincode</span>
                </>
              ) : (
                'Set Pincode'
              )}
            </Button>
            {currentPincode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearPincode}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Clear
              </Button>
            )}
          </form>
          {isValidating && (
            <p className="mt-3 text-sm text-orange-100" role="status">
              Validating pincode...
            </p>
          )}
        </Card>

        {/* Current Pincode Status */}
        {currentPincode && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Active Pincode: {currentPincode}</div>
                  {pincodeInfo && (
                    <div>
                      <div className="text-sm text-gray-600">
                        {pincodeInfo.area} • {pincodeInfo.zone}
                      </div>
                      {(pincodeInfo.areaTamil || pincodeInfo.zoneTamil) && (
                        <div className="text-xs text-gray-500">
                          {[pincodeInfo.areaTamil, pincodeInfo.zoneTamil]
                            .filter(Boolean)
                            .join(' • ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingServices && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Loading services...</span>
                  </div>
                )}
                {!isLoadingServices && (
                  <Badge variant={hasFailedServices ? "destructive" : "default"}>
                    {hasFailedServices ? (
                      <><WifiOff className="w-3 h-3 mr-1" /> {failedServices.length} services offline</>
                    ) : (
                      <><Wifi className="w-3 h-3 mr-1" /> All services online</>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Service Status Banner */}
        {hasFailedServices && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Some services are currently unavailable for this pincode. Showing fallback data for: {failedServices.join(', ')}.
              <Button
                variant="link"
                size="sm"
                className="ml-2 text-amber-700 underline"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
              >
                {showErrorDetails ? 'Hide' : 'Show'} details
              </Button>
            </AlertDescription>
            {showErrorDetails && (
              <div className="mt-2 text-xs text-amber-700">
                <div className="font-medium mb-1">Failed Services:</div>
                <ul className="space-y-1">
                  {failedServices.map((service) => (
                    <li key={service}>• {service}: Using mock/cached data</li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        )}

        {/* Validation Error */}
        {validationError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Cards - Only show when we have a pincode */}
        {currentPincode && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weather Panel */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Weather Information</h3>
                <WeatherPanel pincode={currentPincode} />
              </div>

              {/* Traffic Panel */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Traffic Updates</h3>
                <TrafficPanel pincode={currentPincode} />
              </div>

              {/* Bus Services */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Bus Services</h3>
                <BusByPincodeCard pincode={currentPincode} />
              </div>

              {/* Metro/CMRL Services */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Metro Services</h3>
                <TimetableCard language="en" pincode={currentPincode} />
              </div>

              {/* Twitter Local Updates */}
              {/* Uncomment when component exists:
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Local Updates</h3>
                <TwitterLocalCard pincode={currentPincode} />
              </div>
              */}

              {/* Temple Information */}
              {/* Uncomment when component exists:
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Temple Information</h3>
                <TempleInfoPanel pincode={currentPincode} />
              </div>
              */}
            </div>

          </>
        )}

        {showDebugInfo && (
          <Card className="p-4 bg-gray-50 border-dashed">
            <h4 className="font-medium mb-2">Debug Information</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>Current Pincode: {currentPincode ?? 'None'}</div>
              <div>Is Validating: {isValidating.toString()}</div>
              <div>Is Loading Services: {isLoadingServices.toString()}</div>
              <div>Failed Services: [{failedServices.join(', ')}]</div>
              <div>Validation Error: {validationError || 'None'}</div>
              <div>Pincode Info: {pincodeInfo ? JSON.stringify(pincodeInfo, null, 2) : 'None'}</div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!currentPincode && !isValidating && (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Connect</h3>
            <p className="text-gray-600">
              Enter your pincode above to access local services, weather updates, 
              transportation info, and community updates for your area.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PincodePage;