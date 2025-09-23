import { ChevronDown, ChevronUp, MapPin, Zap } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/card';
import { LiveAlertsPanel } from './LiveAlertsPanel';
import { TrafficStatusPanel } from './TrafficStatusPanel';
import { WeatherPanel } from './WeatherPanel';

interface LocationAwareLiveDataProps {
  userLocation?: any;
  className?: string;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function LocationAwareLiveData({ 
  userLocation, 
  className = '',
  collapsed: propsCollapsed,
  onCollapseChange: propsOnCollapseChange,
}: LocationAwareLiveDataProps) {
  const locationName = userLocation?.area || userLocation?.pincode || 'Chennai';

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = typeof propsCollapsed !== 'undefined' ? propsCollapsed : internalCollapsed;

  function setCollapsedState(next: boolean) {
    if (typeof propsOnCollapseChange === 'function') propsOnCollapseChange(next);
    else setInternalCollapsed(next);
  }

  return (
    <Card
      className={`p-3 border border-blue-200 transition-all duration-300 w-full sm:w-1/2 lg:w-1/3 mx-auto ${
        collapsed ? 'h-16 overflow-hidden' : 'h-auto'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <div className="font-medium">Live Updates</div>
            <div className="text-blue-100 text-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {locationName}
            </div>
          </div>
        </div>
        <button
          className="text-sm text-blue-600 hover:text-blue-800 p-1"
          onClick={() => setCollapsedState(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls="live-updates-content"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div
          id="live-updates-content"
          className="transition-all duration-300 mt-3 space-y-4 max-h-[28rem] overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <WeatherPanel userLocation={userLocation} />
          <TrafficStatusPanel userLocation={userLocation} />
          <LiveAlertsPanel userLocation={userLocation} />
        </div>
      )}
    </Card>
  );
}
