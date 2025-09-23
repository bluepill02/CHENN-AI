import { Car, Clock, MapPin } from 'lucide-react';

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

// Location-specific traffic data based on pincode
const getLocationSpecificTraffic = (userLocation: any): TrafficData[] => {
  if (!userLocation?.pincode) {
    return [
      {
        location: 'Anna Salai',
        status: 'heavy',
        estimatedDelay: '15-20 mins',
        lastUpdated: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        location: 'Mount Road', 
        status: 'moderate',
        estimatedDelay: '5-10 mins',
        lastUpdated: new Date(Date.now() - 8 * 60 * 1000)
      }
    ];
  }

  const area = userLocation.area || 'Chennai';
  const nearbyLandmarks = userLocation.localContent?.nearbyLandmarks || [];
  
  // Generate location-specific traffic based on pincode area
  const locationTraffic: TrafficData[] = [];
  
  // Add main area traffic
  locationTraffic.push({
    location: area,
    status: Math.random() > 0.6 ? 'heavy' : Math.random() > 0.3 ? 'moderate' : 'light',
    estimatedDelay: area.includes('T. Nagar') ? '20-25 mins' : area.includes('Mylapore') ? '8-12 mins' : '10-15 mins',
    lastUpdated: new Date(Date.now() - Math.random() * 10 * 60 * 1000)
  });

  // Add nearby landmarks traffic
  nearbyLandmarks.slice(0, 2).forEach(landmark => {
    locationTraffic.push({
      location: landmark,
      status: Math.random() > 0.7 ? 'heavy' : Math.random() > 0.4 ? 'moderate' : 'light',
      estimatedDelay: landmark.includes('Stadium') ? '15-20 mins' : landmark.includes('Temple') ? '5-8 mins' : '6-12 mins',
      lastUpdated: new Date(Date.now() - Math.random() * 15 * 60 * 1000)
    });
  });

  return locationTraffic;
};

export function TrafficStatusPanel({ trafficData = [], userLocation, className = '' }: TrafficStatusPanelProps) {
  const displayData = trafficData.length > 0 ? trafficData : getLocationSpecificTraffic(userLocation);

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