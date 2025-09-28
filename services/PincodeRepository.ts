import { KNOWN_PINCODES, PINCODE_METADATA } from '../data/pincodeMetadata';
import stopsData from '../data/pincodeStops.json';
import type {
    PincodeMetadata,
    PincodeProfile,
    PincodeServiceAvailability,
} from '../types/pincode';

const STOP_DATA: Record<string, { busStops?: string[]; twitterQueries?: string[] }> =
  stopsData as Record<string, { busStops?: string[]; twitterQueries?: string[] }>;

export function listKnownPincodes(): string[] {
  return KNOWN_PINCODES;
}

export function getPincodeMetadata(pincode: string): PincodeMetadata | null {
  return PINCODE_METADATA[pincode] ?? null;
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
