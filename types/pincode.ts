export interface PincodeLocaleLabel {
  english: string;
  tamil: string;
}

export interface PincodeLocalContent {
  communityName: string;
  localLanguage: string;
  culturalElements: string[];
  nearbyLandmarks: string[];
}

export interface PincodeMetadata {
  pincode: string;
  area: PincodeLocaleLabel;
  zone: PincodeLocaleLabel;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  metroCorridors?: string[];
  serviceZones?: string[];
  localContent?: PincodeLocalContent;
}

export interface PincodeServiceAvailability {
  busStops?: string[];
  twitterQueries?: string[];
}

export interface PincodeProfile extends PincodeMetadata, PincodeServiceAvailability {}

export interface PincodeApiResponse {
  metadata: PincodeMetadata;
  services: PincodeServiceAvailability;
}
