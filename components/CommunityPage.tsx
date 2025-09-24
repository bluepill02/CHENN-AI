/**
 * CommunityPage - Main community interface with responsive grid layout
 * 
 * Layout Structure:
 * - Desktop (lg+): 3-column grid with CommunityFeed (2/3) and LiveDataWidget (1/3)
 * - Mobile (sm): Vertical stack with CommunityFeed first, LiveDataWidget below
 * 
 * Features:
 * - Full viewport height (h-screen) with independent scrolling columns
 * - Left column: CommunityFeed takes 2/3 width on desktop, full height scrolling
 * - Right column: LiveDataWidget takes 1/3 width on desktop, full height scrolling
 * - No floating/absolute positioning - widget is always visible in grid
 * - Responsive: stacks vertically on mobile devices
 * - Visual separation with border and padding on right column
 */

import { CommunityFeed } from './CommunityFeed';

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
  className = '' 
}: CommunityPageProps) {
  return (
    <div className={`h-full bg-gradient-to-br from-orange-50 via-yellow-25 to-orange-25 ${className}`}>
      
      {/* Full Width: Community Feed Only */}
      <div className="h-full overflow-y-auto">
        <CommunityFeed 
          userLocation={userLocation} 
          pincode={pincode}
        />
      </div>
      
    </div>
  );
}