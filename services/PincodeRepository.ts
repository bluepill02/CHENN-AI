import { ADDITIONAL_CHENNAI_PINCODES } from '../data/additionalPincodes';
import { COMPLETE_CHENNAI_PINCODES } from '../data/completePincodes';
import { EXTENDED_CHENNAI_PINCODES } from '../data/extendedPincodes';
import { PINCODE_METADATA } from '../data/pincodeMetadata';
import stopsData from '../data/pincodeStops.json';
import type {
  PincodeMetadata,
  PincodeProfile,
  PincodeServiceAvailability,
} from '../types/pincode';

// Merge ALL Chennai pincode data sources for complete coverage
const ALL_PINCODE_METADATA: Record<string, PincodeMetadata> = {
  ...PINCODE_METADATA,           // Original 47 pincodes
  ...EXTENDED_CHENNAI_PINCODES,  // IT Corridor & suburban areas
  ...ADDITIONAL_CHENNAI_PINCODES, // Additional missing areas  
  ...COMPLETE_CHENNAI_PINCODES   // Complete 600046-600123 coverage
};

const ALL_KNOWN_PINCODES = Object.keys(ALL_PINCODE_METADATA).sort();

const STOP_DATA: Record<string, { busStops?: string[]; twitterQueries?: string[] }> =
  stopsData as Record<string, { busStops?: string[]; twitterQueries?: string[] }>;

export function listKnownPincodes(): string[] {
  return ALL_KNOWN_PINCODES;
}

export function getPincodeMetadata(pincode: string): PincodeMetadata | null {
  return ALL_PINCODE_METADATA[pincode] ?? null;
}

export function getPincodeServices(pincode: string): PincodeServiceAvailability {
  const record = STOP_DATA[pincode] ?? {};
  return {
    busStops: record.busStops ?? [],
    twitterQueries: record.twitterQueries ?? [],
  };
}

export function getPincodeProfile(pincode: string): PincodeProfile | null {
  const metadata = getPincodeMetadata(pincode);
  if (!metadata) {
    return null;
  }
  return {
    ...metadata,
    ...getPincodeServices(pincode),
  };
}

export function getAllPincodeProfiles(): PincodeProfile[] {
  return listKnownPincodes()
    .map(getPincodeProfile)
    .filter((profile): profile is PincodeProfile => Boolean(profile));
}

// Additional utility functions for comprehensive Chennai coverage
export function getPincodesByZone(zone: string): string[] {
  return ALL_KNOWN_PINCODES.filter(pincode => {
    const metadata = ALL_PINCODE_METADATA[pincode];
    return metadata?.zone.english === zone;
  }).sort();
}

export function searchPincodesByArea(searchTerm: string): string[] {
  const term = searchTerm.toLowerCase();
  return ALL_KNOWN_PINCODES.filter(pincode => {
    const metadata = ALL_PINCODE_METADATA[pincode];
    if (!metadata) return false;
    
    return metadata.area.english.toLowerCase().includes(term) ||
           metadata.area.tamil?.includes(term) ||
           metadata.zone.english.toLowerCase().includes(term) ||
           metadata.localContent?.nearbyLandmarks?.some((landmark: string) => 
             landmark.toLowerCase().includes(term)
           );
  }).sort();
}

export function getChennaiCoverageStats() {
  const allPincodes = ALL_KNOWN_PINCODES;
  const zones = ['Central Chennai', 'North Chennai', 'South Chennai', 'West Chennai', 'IT Corridor', 'Airport Zone'];
  
  // Check for complete coverage (600001-600123)
  const expectedCount = 123;
  const actualCount = allPincodes.length;
  const completeness = actualCount >= 120 ? 'COMPREHENSIVE' : actualCount >= 100 ? 'NEAR_COMPLETE' : 'PARTIAL';
  
  const stats = {
    totalPincodes: actualCount,
    expectedTotal: expectedCount,
    coverageRange: `${allPincodes[0]} to ${allPincodes[allPincodes.length - 1]}`,
    coveragePercent: Math.round((actualCount / expectedCount) * 100),
    zones: {} as Record<string, { count: number; pincodes: string[] }>,
    coverage: 'Complete Chennai Metropolitan Area including all zones, suburbs, IT corridors, and industrial areas',
    completeness,
    status: actualCount >= expectedCount ? 'COMPLETE CHENNAI COVERAGE ✅' : `${expectedCount - actualCount} pincodes remaining`
  };
  
  zones.forEach(zone => {
    const zonePincodes = getPincodesByZone(zone);
    stats.zones[zone] = {
      count: zonePincodes.length,
      pincodes: zonePincodes.slice(0, 5) // Show first 5 for overview
    };
  });
  
  return stats;
}

// Export function to get all available Chennai pincodes for debugging/admin
export function getAllChennaiPincodes(): { pincode: string; area: string; zone: string }[] {
  return ALL_KNOWN_PINCODES.map(pincode => {
    const metadata = ALL_PINCODE_METADATA[pincode];
    return {
      pincode,
      area: metadata?.area.english || 'Unknown',
      zone: metadata?.zone.english || 'Unknown'
    };
  }).sort((a, b) => a.pincode.localeCompare(b.pincode));
}
