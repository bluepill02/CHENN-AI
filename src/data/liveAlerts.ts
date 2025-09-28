import type { LiveAlert } from '../../types/community';

type AlertSeverity = LiveAlert['severity'];

interface LiveAlertSeed {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  severity: AlertSeverity;
  source: string;
  affectedAreas?: string[];
  pincodes?: string[];
  minutesAgo: number;
  isActive?: boolean;
}

const baseSeeds: LiveAlertSeed[] = [
  {
    id: 'alert-water-shortage-tnagar',
    title: 'நீர் விநியோக இடைநிறுத்தம்',
    titleEn: 'Water Supply Maintenance',
    message: 'டி. நகர் பகுதியில் இன்று இரவு 10 மணி முதல் அதிகாலை 4 மணி வரை நீர் விநியோகம் கிடையாது.',
    messageEn: 'Scheduled maintenance will disrupt water supply in T. Nagar between 10:00 PM and 4:00 AM today.',
    severity: 'high',
    source: 'Chennai Metro Water',
    affectedAreas: ['T. Nagar', 'West Mambalam'],
    pincodes: ['600017', '600033'],
    minutesAgo: 35,
    isActive: true,
  },
  {
    id: 'alert-traffic-mylapore',
    title: 'போக்குவரத்து நெரிசல்',
    titleEn: 'Traffic Diversion',
    message: 'மயிலாப்பூர் கபாலீஸ்வரர் கோவில் தெருக்களில் தேரோட்டம் காரணமாக போக்குவரத்து மாற்றம்.',
    messageEn: 'Procession near Kapaleeshwarar Temple causing diversions on nearby streets in Mylapore.',
    severity: 'medium',
    source: 'Greater Chennai Traffic Police',
    affectedAreas: ['Mylapore', 'R.K. Salai'],
    pincodes: ['600004'],
    minutesAgo: 18,
    isActive: true,
  },
  {
    id: 'alert-power-anna-nagar',
    title: 'மின்விநியோக பராமரிப்பு',
    titleEn: 'Power Shutdown',
    message: 'அண்ணா நகர் 2nd Avenue-ல் திட்டமிட்ட பராமரிப்பு காரணமாக 2 மணி நேர மின்தடை.',
    messageEn: 'Two-hour maintenance shutdown scheduled for Anna Nagar 2nd Avenue feeders.',
    severity: 'medium',
    source: 'TANGEDCO',
    affectedAreas: ['Anna Nagar West', 'Thirumangalam'],
    pincodes: ['600040', '600101'],
    minutesAgo: 55,
    isActive: true,
  },
  {
    id: 'alert-rain-velachery',
    title: 'மழை எச்சரிக்கை',
    titleEn: 'Heavy Rain Advisory',
    message: 'வேளச்சேரி வெள்ளநீர் வடிகால் அருகில் இன்று மாலையில் கனமழை முன்னெச்சரிக்கை.',
    messageEn: 'Heavy rain expected around Velachery marshland this evening. Stay cautious of waterlogging.',
    severity: 'high',
    source: 'IMD Chennai',
    affectedAreas: ['Velachery', 'Pallikaranai'],
    pincodes: ['600042', '600100'],
    minutesAgo: 120,
    isActive: true,
  },
  {
    id: 'alert-metro-anna-salai',
    title: 'மெட்ரோ பணிகள்',
    titleEn: 'Metro Construction Update',
    message: 'அண்ணா சாலையில் இரவு 9 மணி முதல் மெட்ரோ பணிகள், வாகன ஓட்டிகள் பசு நீரின் வழியாக மாற்றுச் சாலை பயன்படுத்தவும்.',
    messageEn: 'Night-time metro phase-2 work on Anna Salai from 9 PM. Use alternative routes via Pasumpon Muthuramalingam Salai.',
    severity: 'medium',
    source: 'CMRL',
    affectedAreas: ['Anna Salai', 'LIC'],
    pincodes: ['600002', '600008'],
    minutesAgo: 210,
    isActive: true,
  },
  {
    id: 'alert-weather-citywide',
    title: 'வெப்ப எச்சரிக்கை',
    titleEn: 'Heat Advisory',
    message: 'சென்னை நகரம் முழுவதும் அதிக வெப்பம், மதியம் 12-3 மணி வரை வெளியில் செல்வதைத் தவிர்க்கவும்.',
    messageEn: 'City-wide heat advisory; avoid prolonged outdoor exposure between 12 PM and 3 PM.',
    severity: 'low',
    source: 'Chennai Corporation',
    affectedAreas: ['Greater Chennai'],
    minutesAgo: 300,
    isActive: true,
  },
  {
    id: 'alert-flooding-kotturpuram',
    title: 'வெள்ள எச்சரிக்கை',
    titleEn: 'Localized Flooding Alert',
    message: 'கோட்டுர்புரம் பாலம் அருகில் தாழ்வான பகுதிகளில் தண்ணீர் தேங்கி உள்ளது. மாற்றுச் சாலை பயன்படுத்தவும்.',
    messageEn: 'Water stagnation reported near Kotturpuram bridge. Please use alternate routes.',
    severity: 'critical',
    source: 'Disaster Management Cell',
    affectedAreas: ['Kotturpuram', 'Adyar'],
    pincodes: ['600085', '600020'],
    minutesAgo: 12,
    isActive: true,
  },
  {
    id: 'alert-health-chromepet',
    title: 'ஆரோக்கிய அறிவிப்பு',
    titleEn: 'Health Advisory',
    message: 'கிராம்பேட் பகுதியில் டெங்கு கண்காணிப்பு முகாம் 48 மணி நேரம் நடைபெறும்.',
    messageEn: 'Dengue monitoring drive active in Chromepet for the next 48 hours.',
    severity: 'medium',
    source: 'Public Health Department',
    affectedAreas: ['Chromepet', 'Tambaram'],
    pincodes: ['600044', '600045'],
    minutesAgo: 75,
    isActive: true,
  },
];

function toLiveAlert(seed: LiveAlertSeed): LiveAlert {
  const timestamp = new Date(Date.now() - seed.minutesAgo * 60 * 1000);
  return {
    id: seed.id,
    title: seed.title,
    titleEn: seed.titleEn,
    message: seed.message,
    messageEn: seed.messageEn,
    severity: seed.severity,
    timestamp,
    source: seed.source,
    affectedAreas: seed.affectedAreas,
    pincodes: seed.pincodes,
    isActive: seed.isActive ?? true,
  };
}

export function getSeedAlerts(options?: { pincode?: string; area?: string }): LiveAlert[] {
  const { pincode, area } = options ?? {};

  const matches = baseSeeds.filter(seed => {
    const matchesPincode = seed.pincodes ? seed.pincodes.includes(pincode ?? '') : true;
    const matchesArea = seed.affectedAreas
      ? seed.affectedAreas.some(tag => tag.toLowerCase().includes((area || '').toLowerCase()))
      : true;

    if (pincode && seed.pincodes?.length) {
      return matchesPincode;
    }

    if (area) {
      return matchesArea;
    }

    return true;
  });

  const result = matches.length > 0 ? matches : baseSeeds.slice(0, 4);
  return result.map(toLiveAlert);
}

export function mergeAlerts(existing: LiveAlert[], updates: LiveAlert[]): LiveAlert[] {
  const map = new Map<string, LiveAlert>();
  [...existing, ...updates].forEach(alert => {
    map.set(alert.id, alert);
  });
  return Array.from(map.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getAllSeedAlerts(): LiveAlert[] {
  return baseSeeds.map(toLiveAlert);
}
