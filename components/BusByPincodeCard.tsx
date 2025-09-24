import { Bus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePincodeContext } from '../services/PincodeContext';
import { Card } from './ui/card';

interface BusByPincodeProps {
  pincode?: string; // Optional - will use context if not provided
}

interface PincodeApiResponse {
  pincode: string;
  stops: string[];
  twitterQueries: string[];
}

export const BusByPincodeCard: React.FC<BusByPincodeProps> = ({ pincode: propPincode }) => {
  const { currentPincode } = usePincodeContext();
  const pincode = propPincode || currentPincode;
  const [busData, setBusData] = useState<PincodeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/busByPincode?pincode=${pincode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bus data');
        }
        const data = await response.json();
        setBusData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (pincode) {
      fetchBusData();
    }
  }, [pincode]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bus className="h-4 w-4" />
          <h3 className="text-sm font-medium">Bus Stops</h3>
        </div>
        <p className="text-sm text-gray-600">Loading bus data...</p>
      </Card>
    );
  }

  if (error || !busData) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bus className="h-4 w-4" />
          <h3 className="text-sm font-medium">Bus Stops</h3>
        </div>
        <p className="text-sm text-gray-600">
          {error || 'No bus data available for this area'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bus className="h-4 w-4" />
        <h3 className="text-sm font-medium">Bus Stops (Pincode {pincode})</h3>
      </div>
      
      <div className="space-y-2">
        {busData.stops.slice(0, 4).map((stop, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {stop}
            </div>
          </div>
        ))}
        
        {busData.stops.length > 4 && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Showing 4 of {busData.stops.length} bus stops
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500">
          Data from MTC official records. Services may vary.
        </p>
      </div>
    </Card>
  );
};

export default BusByPincodeCard;