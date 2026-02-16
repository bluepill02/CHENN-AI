import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MapPin, Clock, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocation, LocationData } from '../services/LocationService';

export const LocationModal: React.FC = () => {
  const { 
    isLocationModalOpen, 
    setLocationModalOpen, 
    previousLocations, 
    currentLocation, 
    switchToLocation, 
    addNewLocation,
    isVerifying 
  } = useLocation();
  
  const [newPincode, setNewPincode] = useState('');
  const [error, setError] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);

  const handleSwitchLocation = (location: LocationData) => {
    switchToLocation(location);
  };

  const handleAddNewLocation = async () => {
    if (!newPincode.trim()) {
      setError('Please enter a pincode');
      return;
    }

    if (!/^\d{6}$/.test(newPincode.trim())) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setError('');
      await addNewLocation(newPincode.trim());
      setNewPincode('');
      setShowAddNew(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify location');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={setLocationModalOpen}>
      <DialogContent className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-800">
            <MapPin className="h-5 w-5" />
            Change Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Location */}
          {currentLocation && (
            <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-orange-700">Current Location</span>
              </div>
              <div className="space-y-1">
                <p className="text-orange-900">{currentLocation.area}</p>
                <p className="text-sm text-orange-600">
                  {currentLocation.pincode} • {currentLocation.district}
                </p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  {currentLocation.localContent?.communityName}
                </Badge>
              </div>
            </div>
          )}

          {/* Previous Locations */}
          {previousLocations.length > 0 && (
            <div>
              <h4 className="text-sm text-orange-700 mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Previously Visited
              </h4>
              <div className="space-y-2">
                {previousLocations.map((location) => (
                  <div
                    key={location.pincode}
                    className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => handleSwitchLocation(location)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-orange-900">{location.area}</p>
                        <p className="text-sm text-orange-600">
                          {location.pincode} • {location.district}
                        </p>
                        <p className="text-xs text-orange-500">
                          Visited: {formatTimestamp(location.timestamp)}
                        </p>
                      </div>
                      <MapPin className="h-4 w-4 text-orange-400 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Location */}
          <div className="border-t border-orange-200 pt-4">
            {!showAddNew ? (
              <Button
                onClick={() => setShowAddNew(true)}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Location
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-orange-700 block mb-1">
                    Enter Pincode
                  </label>
                  <Input
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="e.g., 600001"
                    maxLength={6}
                    className="border-orange-300 focus:border-orange-500"
                  />
                  {error && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddNewLocation}
                    disabled={isVerifying}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Add'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddNew(false);
                      setNewPincode('');
                      setError('');
                    }}
                    variant="outline"
                    className="border-orange-300 text-orange-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 Your location helps us show relevant local content, services, and community posts from your area.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};