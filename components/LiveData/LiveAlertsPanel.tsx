import { AlertTriangle, CheckCircle, Info, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LiveDataService } from '../../services/LiveDataService';

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

export function LiveAlertsPanel({ alerts = [], userLocation, className = '' }: LiveAlertsPanelProps) {
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>(alerts);
  const [loading, setLoading] = useState(alerts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alerts.length > 0) {
      setDisplayAlerts(alerts);
      setLoading(false);
      return;
    }

    const fetchAlerts = async () => {
      const area = userLocation?.area || 'Chennai';
      setLoading(true);
      setError(null);

      try {
        const realAlerts = await LiveDataService.getAlerts(area);
        setDisplayAlerts(realAlerts);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        setError('Unable to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userLocation?.area, alerts]);

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

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Alerts</h3>
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 shadow-sm flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin mr-2" />
          <span className="text-gray-600">Loading alerts...</span>
        </div>
      </div>
    );
  }

  if (error || displayAlerts.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Alerts</h3>
        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 shadow-sm flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <span className="text-blue-700 text-sm">{error || 'No alerts at this time'}</span>
        </div>
      </div>
    );
  }

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