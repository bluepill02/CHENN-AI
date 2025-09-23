import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  location?: string;
}

interface LiveAlertsPanelProps {
  alerts?: Alert[];
  userLocation?: any;
  className?: string;
}

// Location-specific alerts based on pincode
const getLocationSpecificAlerts = (userLocation: any): Alert[] => {
  const area = userLocation?.area || 'Chennai';
  const pincode = userLocation?.pincode;
  const nearbyLandmarks = userLocation?.localContent?.nearbyLandmarks || [];
  
  const locationAlerts: Alert[] = [];
  
  // Generate area-specific alerts
  if (area.includes('T. Nagar')) {
    locationAlerts.push({
      id: '1',
      type: 'warning',
      title: 'Heavy Traffic Expected',
      message: `Shopping rush on Ranganathan Street - expect 20+ min delays`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      location: 'T. Nagar Shopping District'
    });
  } else if (area.includes('Mylapore')) {
    locationAlerts.push({
      id: '1',
      type: 'info',
      title: 'Temple Festival',
      message: `Special prayers at Kapaleeshwarar Temple - limited parking`,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      location: 'Mylapore Temple Area'
    });
  } else if (area.includes('Anna Salai')) {
    locationAlerts.push({
      id: '1',
      type: 'warning',
      title: 'Metro Construction',
      message: `Phase 2 construction near LIC - expect traffic diversions`,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      location: 'Anna Salai Metro Route'
    });
  }
  
  // Add service alerts for the area
  locationAlerts.push({
    id: '2',
    type: 'success',
    title: 'Water Supply Update',
    message: `Regular supply restored in ${area} area - ${pincode || 'your pincode'}`,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    location: area
  });
  
  // Add landmark-specific alerts if available
  if (nearbyLandmarks.length > 0) {
    const landmark = nearbyLandmarks[0];
    locationAlerts.push({
      id: '3',
      type: 'info',
      title: 'Local Update',
      message: `${landmark} area - increased security patrol during evening hours`,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      location: landmark
    });
  }
  
  return locationAlerts.slice(0, 3); // Limit to 3 alerts
};

export function LiveAlertsPanel({ alerts = [], userLocation, className = '' }: LiveAlertsPanelProps) {
  const displayAlerts = alerts.length > 0 ? alerts : getLocationSpecificAlerts(userLocation);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Alerts</h3>
      {displayAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border ${getAlertBgColor(alert.type)} transition-all duration-200`}
        >
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-800">{alert.title}</h4>
                <span className="text-xs text-gray-500">
                  {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
              {alert.location && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  📍 {alert.location}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}