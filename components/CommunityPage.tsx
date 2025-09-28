/**
 * CommunityPage - Main community interface with responsive content + live data layout
 *
 * Layout Structure:
 * - Desktop (lg+): two-column grid with CommunityFeed (stretch) and LiveDataWidget (fixed 360px)
 * - Mobile/tablet: vertical stack with CommunityFeed first, LiveDataWidget below (collapsible)
 *
 * Features:
 * - Full viewport height with independent scroll regions (feed and live data panel)
 * - Live data column stays sticky within its container on desktop for quicker glanceability
 * - Graceful degradation when live data services are unavailable (panel collapses)
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CommunityFeed } from './CommunityFeed';
import { LiveDataWidget } from './LiveData/LiveDataWidget';
import { Button } from './ui/button';

export interface CommunityPageProps {
  /** User location data for location-aware content */
  userLocation?: any;
  /** Pincode for location-specific services */
  pincode?: string;
  /** Additional CSS classes for styling overrides */
  className?: string;
}

export function CommunityPage({
  userLocation,
  pincode = '600001',
  className = '',
}: CommunityPageProps) {
  const [showLiveDataMobile, setShowLiveDataMobile] = useState(false);
  const toggleLabel = useMemo(
    () => (showLiveDataMobile ? 'Hide live data' : 'Show live data & alerts'),
    [showLiveDataMobile],
  );

  return (
    <div
      className={`h-full bg-gradient-to-br from-orange-50 via-yellow-25 to-orange-25 ${className}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-4 px-0 pb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6 lg:px-6">
        <div className="h-full overflow-y-auto">
          <CommunityFeed userLocation={userLocation} />
        </div>

        <aside className="relative hidden h-full lg:flex">
          <div className="sticky top-4 flex h-[calc(100vh-2rem)] w-full overflow-hidden rounded-3xl border border-orange-100/70 bg-white/70 shadow-xl shadow-orange-200/30 backdrop-blur">
            <LiveDataWidget pincode={pincode} className="overflow-y-auto" />
          </div>
        </aside>

        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            className="mb-2 w-full border-orange-200 bg-white/70 text-orange-700"
            onClick={() => setShowLiveDataMobile((prev) => !prev)}
          >
            <span className="flex items-center justify-center gap-2">
              {toggleLabel}
              {showLiveDataMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </Button>
          {showLiveDataMobile ? (
            <div className="rounded-3xl border border-orange-100/70 bg-white/80 shadow-lg shadow-orange-200/20 backdrop-blur">
              <LiveDataWidget pincode={pincode} className="max-h-[75vh] overflow-y-auto" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}