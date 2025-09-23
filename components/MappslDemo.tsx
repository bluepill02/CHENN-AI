import { AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useExternalData } from '../services/ExternalDataService';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

export function MappslDemo() {
  const { validateChennaiPincode, getMappslLocationData } = useExternalData();
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testPincode = async () => {
    if (!pincode.trim()) {
      setError('Please enter a pincode');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const locationData = await validateChennaiPincode(pincode.trim());
      if (locationData) {
        setResult(locationData);
      } else {
        setError('Invalid Chennai pincode or pincode not found');
      }
    } catch (err) {
      setError('Error validating pincode. Please try again.');
      console.error('Pincode validation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      setError(null);
      setResult(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = await getMappslLocationData(
              position.coords.latitude,
              position.coords.longitude
            );
            if (locationData) {
              setResult(locationData);
            } else {
              setError('Could not get location details');
            }
          } catch (err) {
            setError('Error getting location details');
            console.error('Location error:', err);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          setError('Could not access your location');
          setIsLoading(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation not supported by this browser');
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-gray-900">Mappls API Demo</h3>
          <p className="text-sm text-gray-600">Test Chennai pincode validation</p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Chennai pincode (e.g., 600001)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
            <Button onClick={testPincode} disabled={isLoading}>
              {isLoading ? <Clock className="w-4 h-4 animate-spin" /> : 'Test'}
            </Button>
          </div>

          <Button 
            onClick={testCurrentLocation} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 animate-spin mr-2" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Use Current Location
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Location validated successfully!</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Pincode:</span>
                  <Badge className="ml-1">{result.pincode}</Badge>
                </div>
                <div>
                  <span className="font-medium">Area:</span>
                  <span className="ml-1 text-gray-600">{result.area}</span>
                </div>
                <div>
                  <span className="font-medium">City:</span>
                  <span className="ml-1 text-gray-600">{result.city}</span>
                </div>
                <div>
                  <span className="font-medium">District:</span>
                  <span className="ml-1 text-gray-600">{result.district}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div><strong>Coordinates:</strong> {result.lat?.toFixed(4)}, {result.lng?.toFixed(4)}</div>
                <div><strong>Address:</strong> {result.formatted_address}</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-center text-gray-500 pt-2 border-t">
          Powered by Mappls API • Chennai Community App
        </div>
      </div>
    </Card>
  );
}