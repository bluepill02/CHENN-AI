import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from './LanguageService';
import { MapPin, Shield, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation } from './LocationService';
import chennaiWaterfront from 'figma:asset/8ee111ffe3789e0e3d9ea32a4a2b2a606ac32e8f.png';

interface PincodeVerificationProps {
  onVerificationComplete: (pincodeData: any) => void;
  onSkip: () => void;
}

export function PincodeVerification({ onVerificationComplete, onSkip }: PincodeVerificationProps) {
  const [pincode, setPincode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [locationData, setLocationData] = useState<any>(null);
  const { verifyLocation, isVerifying } = useLocation();
  const { t } = useLanguage();

  // Chennai pincode database with local areas
  const chennaiPincodes = {
    '600001': { area: 'Fort St. George • ஃபோர்ட்', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600002': { area: 'Mount Road • மவுண்ட் ரோடு', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600003': { area: 'Broadway • பிராட்வே', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600004': { area: 'Mylapore • மயிலாப்பூர்', zone: 'South Chennai', tamil: 'தென் சென்னை' },
    '600005': { area: 'Triplicane • திருவல்லிக்கேணி', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600006': { area: 'Chepauk • செப்பாக்கம்', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600014': { area: 'Vadapalani • வடபழனி', zone: 'West Chennai', tamil: 'மேற்கு சென்னை' },
    '600017': { area: 'T. Nagar • டி. நகர்', zone: 'South Chennai', tamil: 'தென் சென்னை' },
    '600020': { area: 'Adyar • அடையார்', zone: 'South Chennai', tamil: 'தென் சென்னை' },
    '600024': { area: 'Anna Nagar • அண்ணா நகர்', zone: 'North Chennai', tamil: 'வட சென்னை' },
    '600028': { area: 'Velachery • வேளச்சேரி', zone: 'South Chennai', tamil: 'தென் சென்னை' },
    '600034': { area: 'Kodambakkam • கோடம்பாக்கம்', zone: 'West Chennai', tamil: 'மேற்கு சென்னை' },
    '600041': { area: 'Royapettah • ராயப்பேட்டை', zone: 'Central Chennai', tamil: 'மத்திய சென்னை' },
    '600090': { area: 'Besant Nagar • பெசன்ட் நகர்', zone: 'South Chennai', tamil: 'தென் சென்னை' },
    '600119': { area: 'Sholinganallur • சோளிங்கநல்லூர்', zone: 'IT Corridor', tamil: 'IT காரிடார்' }
  };

  const handleVerification = async () => {
    if (pincode.length !== 6) {
      setVerificationStatus('error');
      return;
    }

    try {
      const locationData = await verifyLocation(pincode);
      setLocationData(locationData);
      setVerificationStatus('success');
      
      setTimeout(() => {
        onVerificationComplete(locationData);
      }, 2000);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-400 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>
      
      {/* Beautiful Chennai waterfront background */}
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src={chennaiWaterfront}
          alt="Chennai Waterfront"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/80 via-orange-300/80 to-yellow-400/80"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-sm w-full">
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900 mb-2">
              {t('pincode.title', 'Verify Your Location')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('pincode.subtitle', 'Enter your pincode to connect with your local community')}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
              <Shield className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Trusted Neighbors Only</p>
                <p className="text-xs text-gray-600">Same area-வில் உள்ளவர்களோடு மட்டும் connect</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Local Services</p>
                <p className="text-xs text-gray-600">உங்கள் area-ல உள்ள services மட்டும்</p>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          {verificationStatus !== 'success' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('pincode.placeholder', 'Enter Chennai pincode')}
                </label>
                <Input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(value);
                    setVerificationStatus('idle');
                  }}
                  placeholder="600004"
                  className="text-center text-lg tracking-wider"
                  maxLength={6}
                />
                {verificationStatus === 'error' && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Sorry! This pincode is not in Chennai area
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerification}
                disabled={pincode.length !== 6 || isVerifying}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  t('pincode.verify', 'Verify Location')
                )}
              </Button>
            </div>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && locationData && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">வாழ்த்துக்கள்! 🎉</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Successfully verified for
                </p>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2">
                  📍 {locationData.area}
                </Badge>
                <p className="text-xs text-gray-500 mt-2">
                  Zone: {locationData.zone} • {locationData.tamil}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                Redirecting to your local community...
              </div>
            </div>
          )}

          {/* Skip option */}
          {verificationStatus !== 'success' && (
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('pincode.skip', 'Skip for now')}
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Limited features without verification
              </p>
            </div>
          )}
        </Card>

        {/* Chennai areas info */}
        
      </div>
    </div>
  );
}