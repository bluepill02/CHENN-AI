import type { Locality } from '../types/locality';
export type { Locality } from '../types/locality';

export const chennaiLocalities: Locality[] = [
  {
    id: 'adyar',
    nameEn: 'Adyar',
    nameTa: 'அடையார்',
    metrics: { liveability: 4.7, connectivity: 4.3, foodCulture: 4.6, affordability: 3.5, buzz: 4.4 },
    sources: ['99acres', 'NoBroker', 'Twitter'],
    score: 4.3,
    description: 'Upscale residential area with tree-lined streets, premium shopping, and cultural venues.',
    descriptionTa: 'மரங்கள் நிறைந்த தெருக்கள், பிரீமியம் ஷாப்பிங் மற்றும் கலாச்சார மையங்கள் கொண்ட உயர்தர குடியிருப்பு பகுதி.',
    highlights: ['Tree-lined streets', 'Premium cafes', 'Cultural venues', 'Riverside location'],
    pincode: '600020',
    popularSpots: ['Adyar Bakery', 'Elliot\'s Beach', 'Adyar Club', 'Kishkinta Theme Park'],
    sampleTweets: [
      { id: 1, text: 'Adyar-la morning walk பண்ணா peace-ஆ இருக்கும். Green and calm neighbourhood! 🌳', user: '@ChennaiWalks', time: '2h ago' },
      { id: 2, text: 'Adyar Bakery-oda filter coffee with ghee roast. This is what Chennai mornings are made of! ☕️', user: '@ChennaiEats', time: '5h ago' },
      { id: 3, text: 'Traffic bit heavy in Adyar, but the tree cover makes it bearable. Love the green canopy! 🚗🌿', user: '@AdyarResident', time: '1d ago' }
    ]
  },
  {
    id: 'besant-nagar',
    nameEn: 'Besant Nagar',
    nameTa: 'பெசன்ட் நகர்',
    metrics: { liveability: 4.5, connectivity: 4.1, foodCulture: 4.4, affordability: 3.8, buzz: 4.3 },
    sources: ['99acres', 'NoBroker', 'Twitter'],
    score: 4.2,
    description: 'Coastal residential area known for its beach, cafes, and vibrant nightlife scene.',
    descriptionTa: 'கடற்கரை, கஃபேக்கள் மற்றும் துடிப்பான இரவு வாழ்க்கைக்கு பெயர் பெற்ற கடலோர குடியிருப்பு பகுதி.',
    highlights: ['Beach proximity', 'Trendy cafes', 'Active nightlife', 'Young crowd'],
    pincode: '600090',
    popularSpots: ['Elliot\'s Beach', 'Cafe Coffee Day', 'Shree Mithai', 'Bessy Beach'],
    sampleTweets: [
      { id: 1, text: 'Besant Nagar beach sunset-அ miss பண்ணக்கூடாது! Perfect evening vibes 🌅', user: '@BeachLover', time: '3h ago' },
      { id: 2, text: 'Elliot\'s beach-la evening walk with filter coffee. Bessy life at its best! 🏖️☕', user: '@BessyLocal', time: '6h ago' },
      { id: 3, text: 'Weekend nights in Besant Nagar are always happening! Great food and vibe 🎉', user: '@ChennaiNights', time: '2d ago' }
    ]
  },
  {
    id: 'anna-nagar',
    nameEn: 'Anna Nagar',
    nameTa: 'அண்ணா நகர்',
    metrics: { liveability: 4.6, connectivity: 4.5, foodCulture: 4.3, affordability: 3.7, buzz: 4.2 },
    sources: ['99acres', 'NoBroker', 'Twitter'],
    score: 4.3,
    description: 'Well-planned residential area with excellent metro connectivity and shopping options.',
    descriptionTa: 'சிறந்த மெட்ரோ இணைப்பு மற்றும் ஷாப்பிங் வசதிகளுடன் நன்கு திட்டமிடப்பட்ட குடியிருப்பு பகுதி.',
    highlights: ['Metro connectivity', 'Planned layout', 'Shopping centers', 'Educational hubs'],
    pincode: '600040',
    popularSpots: ['Anna Nagar Tower Park', 'Forum Vijaya Mall', 'Shanthi Colony', 'Anna Nagar East'],
    sampleTweets: [
      { id: 1, text: 'Anna Nagar metro connectivity is a game changer! எங்கயும் easy-யா போகலாம் 🚇', user: '@MetroCommuter', time: '1h ago' },
      { id: 2, text: 'Forum mall-la weekend shopping with family. Anna Nagar has everything we need! 🛍️', user: '@AnnaNagarMom', time: '4h ago' },
      { id: 3, text: 'Tower park-la morning jog routine. Well-maintained and safe area 🏃‍♂️', user: '@FitnessChennai', time: '1d ago' }
    ]
  },
  {
    id: 'velachery',
    nameEn: 'Velachery',
    nameTa: 'வேளச்சேரி',
    metrics: { liveability: 4.4, connectivity: 4.4, foodCulture: 4.1, affordability: 4.0, buzz: 4.0 },
    sources: ['99acres', 'NoBroker', 'Twitter'],
    score: 4.2,
    description: 'IT corridor hub with modern apartments, good transportation, and affordable living.',
    descriptionTa: 'நவீன அடுக்குமாடி குடியிருப்புகள், நல்ல போக்குவரத்து மற்றும் கிடைக்கக்கூடிய வாழ்க்கையுடன் கூடிய ஐடி காரிடார் மையம்.',
    highlights: ['IT hub proximity', 'Modern apartments', 'Good transport', 'Value for money'],
    pincode: '600042',
    popularSpots: ['Phoenix MarketCity', 'Velachery Lake', 'IT companies', 'Residential complexes'],
    sampleTweets: [
      { id: 1, text: 'Velachery-to-office commute super convenient! IT corridor-la work பண்ணுறவங்களுக்கு perfect 💼', user: '@TechChennai', time: '2h ago' },
      { id: 2, text: 'Phoenix mall weekend shopping with parking no stress. Well organized area! 🏬', user: '@VelacheryLocal', time: '7h ago' },
      { id: 3, text: 'Lake area morning walk peaceful-ஆ இருக்கு. Nature in the city! 🏞️', user: '@NatureWalk', time: '1d ago' }
    ]
  },
  {
    id: 't-nagar',
    nameEn: 'T. Nagar',
    nameTa: 'டி. நகர்',
    metrics: { liveability: 4.2, connectivity: 4.6, foodCulture: 4.8, affordability: 4.2, buzz: 4.7 },
    sources: ['99acres', 'Twitter', 'Local Reviews'],
    score: 4.5,
    description: 'The shopping capital of Chennai with unmatched variety in textiles, jewelry, and street food.',
    descriptionTa: 'ஜவுளி, நகைகள் மற்றும் தெரு உணவுகளில் ஒப்பற்ற பல்வேறு வகைகளுடன் சென்னையின் வணிக தலைநகர்.',
    highlights: ['Shopping paradise', 'Street food hub', 'Cultural center', 'Transport hub'],
    pincode: '600017',
    popularSpots: ['Ranganathan Street', 'Pondy Bazaar', 'Mambalam Railway Station', 'Usman Road'],
    sampleTweets: [
      { id: 1, text: 'T.Nagar shopping experience தனி level! எந்த brand வேண்டுமானாலும் இங்க கிடைக்கும் 🛍️', user: '@ShoppingSister', time: '1h ago' },
      { id: 2, text: 'Pondy bazaar-la evening food walk. Street food variety amazing! 🍛🥘', user: '@StreetFoodLover', time: '3h ago' },
      { id: 3, text: 'Traffic chaos-தான் but energy and vibe unmatched! T.Nagar = Chennai heart ❤️', user: '@ChennaiPride', time: '5h ago' }
    ]
  },
  {
    id: 'omr',
    nameEn: 'OMR (IT Expressway)',
    nameTa: 'ஓ.எம்.ஆர் (ஐடி எக்ஸ்பிரஸ்வே)',
    metrics: { liveability: 4.3, connectivity: 4.2, foodCulture: 4.0, affordability: 3.6, buzz: 4.1 },
    sources: ['99acres', 'NoBroker', 'Twitter'],
    score: 4.0,
    description: 'Modern IT corridor with tech parks, international cuisine, and contemporary lifestyle.',
    descriptionTa: 'தொழில்நுட்ப பூங்காக்கள், சர்வதேச உணவு வகைகள் மற்றும் நவீன வாழ்க்கை முறையுடன் கூடிய நவீன ஐடி காரிடார்.',
    highlights: ['Tech hub', 'Modern infrastructure', 'International food', 'Beach access'],
    pincode: '600119',
    popularSpots: ['Sholinganallur', 'ECR Beach', 'Tech Parks', 'Luxury malls'],
    sampleTweets: [
      { id: 1, text: 'OMR-la work பண்ணுற advantage: beach-கு 15 mins! Weekend ECR drive perfect 🏖️🚗', user: '@OMRTechie', time: '2h ago' },
      { id: 2, text: 'International food options in OMR restaurants top-notch! Multi-cuisine paradise 🍕🍜', user: '@FoodieOMR', time: '4h ago' },
      { id: 3, text: 'Traffic morning-evening heavy but infrastructure modern. IT corridor vibes! 💻', user: '@TechCommuter', time: '1d ago' }
    ]
  },
  {
    id: 'tambaram',
    nameEn: 'Tambaram',
    nameTa: 'தாம்பரம்',
    metrics: { liveability: 4.1, connectivity: 4.3, foodCulture: 4.2, affordability: 4.4, buzz: 3.9 },
    sources: ['99acres', 'NoBroker', 'Local Reviews'],
    score: 4.2,
    description: 'Suburban hub with excellent railway connectivity and affordable housing options.',
    descriptionTa: 'சிறந்த ரயில்வே இணைப்பு மற்றும் கிடைக்கக்கூடிய வீட்டு வசதிகளுடன் கூடிய புறநகர் மையம்.',
    highlights: ['Railway junction', 'Affordable living', 'Suburban feel', 'Educational institutions'],
    pincode: '600045',
    popularSpots: ['Tambaram Railway Station', 'Local markets', 'Educational institutions', 'Parks'],
    sampleTweets: [
      { id: 1, text: 'Tambaram railway connectivity super convenient! Chennai central-கு direct trains 🚂', user: '@TrainCommuter', time: '3h ago' },
      { id: 2, text: 'Affordable living with good connectivity. Family-friendly suburb! 🏡', user: '@TambaramFamily', time: '6h ago' },
      { id: 3, text: 'Peaceful suburban life away from city chaos. Best of both worlds! 🌱', user: '@SuburbanLife', time: '2d ago' }
    ]
  }
];

export const computeLocalityScore = (metrics: Locality['metrics']): number => {
  const weights = {
    liveability: 0.25,
    connectivity: 0.20,
    foodCulture: 0.20,
    affordability: 0.15,
    buzz: 0.20
  };
  
  return Number((
    metrics.liveability * weights.liveability +
    metrics.connectivity * weights.connectivity +
    metrics.foodCulture * weights.foodCulture +
    metrics.affordability * weights.affordability +
    metrics.buzz * weights.buzz
  ).toFixed(1));
};