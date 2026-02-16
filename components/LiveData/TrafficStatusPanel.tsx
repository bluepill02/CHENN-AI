import { Car, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LiveDataService } from '../../services/LiveDataService';

interface TrafficData {
  location: string;
  status: 'heavy' | 'moderate' | 'light';
  estimatedDelay: string;
  lastUpdated: Date;
}

interface TrafficStatusPanelProps {
  trafficData?: TrafficData[];
  userLocation?: any;
  className?: string;
}

export function TrafficStatusPanel({ trafficData = [], userLocation, className = '' }: TrafficStatusPanelProps) {
  const [displayData, setDisplayData] = useState<TrafficData[]>(trafficData);
  const [loading, setLoading] = useState(trafficData.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trafficData.length > 0) {
      setDisplayData(trafficData);
      return;
    }

    const fetchTraffic = async () => {
      const area = userLocation?.area || 'Chennai';
      setLoading(true);
      setError(null);

      try {
        const realTraffic = await LiveDataService.getTraffic(area);
        setDisplayData(realTraffic);
      } catch (err) {
        console.error('Failed to fetch traffic:', err);
        setError('Unable to load traffic data');
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
  }, [userLocation?.area, trafficData]);

  const getStatusColor = (status: TrafficData['status']) => {
    switch (status) {
      case 'heavy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'light':
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusText = (status: TrafficData['status']) => {
    switch (status) {
      case 'heavy':
        return 'Heavy Traffic';
      case 'moderate':
        return 'Moderate Traffic';
      case 'light':
        return 'Light Traffic';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-600" />
          Traffic Status
        </h3>
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 shadow-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin mr-2" />
          <span className="text-gray-600">Loading traffic...</span>
        </div>
      </div>
    );
  }

  if (error || displayData.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-600" />
          Traffic Status
        </h3>
        <div className="p-4 rounded-lg border bg-red-50 border-red-200 shadow-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 text-sm">{error || 'Traffic data unavailable'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Car className="w-5 h-5 text-blue-600" />
        Traffic Status
      </h3>
      {displayData.map((traffic, index) => (
        <div
          key={index}
          className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-800">{traffic.location}</h4>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(traffic.status)}`}>
              {getStatusText(traffic.status)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Delay: {traffic.estimatedDelay}</span>
            </div>
            <span className="text-xs text-gray-500">
              Updated {Math.round((Date.now() - traffic.lastUpdated.getTime()) / (1000 * 60))}m ago
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}