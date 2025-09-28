// Chennai-themed Mock data for Auto Share feature
// சென்னை வடிவமைத்த ஆட்டோ பகிர்வு அம்சத்திற்கான மாதிரி தரவு
import { ChennaiLocation, Ride, User } from "./autoShareInterfaces";

// Chennai-specific mock users with bilingual names and local context
const mockUsers: User[] = [
  { 
    id: "u1", 
    name: "Arun Kumar / அருண் குமார்", 
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    rating: 4.8,
    ridesCompleted: 127,
    isVerified: true,
    phoneNumber: "+91 98400 xxxxx"
  },
  { 
    id: "u2", 
    name: "Priya Sharma / பிரியா ஷர்மா",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b601?w=100",
    rating: 4.9,
    ridesCompleted: 89,
    isVerified: true
  },
  { 
    id: "u3", 
    name: "Vikram Raj / விக்ரம் ராஜ்", 
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    rating: 4.6,
    ridesCompleted: 203,
    isVerified: true
  },
  { 
    id: "u4", 
    name: "Divya Krishnan / திவ்யா கிருஷ்ணன்",
    rating: 4.7,
    ridesCompleted: 156,
    isVerified: false
  },
  { 
    id: "u5", 
    name: "Suresh Anna / சுரேஷ் அண்ணா",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    rating: 4.9,
    ridesCompleted: 341,
    isVerified: true
  },
  { 
    id: "u6", 
    name: "Lakshmi Akka / லக்ஷ்மி அக்கா",
    rating: 4.5,
    ridesCompleted: 78,
    isVerified: true
  }
];

// Chennai landmarks with bilingual location data
const chennaiLocations: ChennaiLocation[] = [
  { english: "Central Station", tamil: "சென்ட்ரல் ஸ்டேஷன்", landmark: "Near Park Station" },
  { english: "T.Nagar", tamil: "டி.நகர்", landmark: "Panagal Park" },
  { english: "Velachery", tamil: "வேளச்சேரி", landmark: "Phoenix MarketCity" },
  { english: "Guindy", tamil: "கிண்டி", landmark: "National Park" },
  { english: "Adyar", tamil: "அடையாறு", landmark: "Elliot's Beach" },
  { english: "Anna Nagar", tamil: "அண்ணா நகர்", landmark: "Tower Park" },
  { english: "Mylapore", tamil: "மயிலாப்பூர்", landmark: "Kapaleeshwarar Temple" },
  { english: "Marina Beach", tamil: "மரினா கடற்கரை", landmark: "Lighthouse" },
  { english: "Tambaram", tamil: "தாம்பரம்", landmark: "Railway Junction" },
  { english: "Chromepet", tamil: "குரோம்பேட்டை", landmark: "Bus Terminus" },
  { english: "ECR IT Corridor", tamil: "ஈசிஆர் ஐடி வளாகம்", landmark: "Tech Parks" },
  { english: "Porur", tamil: "போரூர்", landmark: "Forum Vijaya Mall" },
  { english: "Sholinganallur", tamil: "ஷோலிங்கநல்லூர்", landmark: "IT Hub" },
  { english: "Besant Nagar", tamil: "பேசன்ட் நகர்", landmark: "Elliot's Beach" }
];

export const mockRides: Ride[] = [
  {
    id: "r1",
    pickup: "Central Station / சென்ட்ரல் ஸ்டேஷன்",
    drop: "T.Nagar / டி.நகர்",
    time: "2025-09-25T08:30:00Z",
    fare: 150,
    seatsTotal: 4,
    seatsAvailable: 2,
    creator: mockUsers[0],
    status: "upcoming",
    vehicleType: "car",
    route: "via Anna Salai / அண்ணா சாலை வழியே",
    notes: "AC car, music allowed / ஏசி கார், இசை அனுமதி",
    createdAt: "2025-09-24T10:00:00Z"
  },
  {
    id: "r2", 
    pickup: "Velachery / வேளச்சேரி",
    drop: "Guindy / கிண்டி", 
    time: "2025-09-23T18:00:00Z",
    fare: 100,
    seatsTotal: 3,
    seatsAvailable: 0,
    creator: mockUsers[1],
    status: "completed",
    vehicleType: "auto",
    route: "via GST Road / ஜிஎஸ்டி ரோடு வழியே",
    createdAt: "2025-09-23T15:30:00Z"
  },
  {
    id: "r3",
    pickup: "Adyar / அடையாறு", 
    drop: "ECR IT Corridor / ஈசிஆர் ஐடி வளாகம்",
    time: "2025-09-22T09:00:00Z",
    fare: 200,
    seatsTotal: 4,
    seatsAvailable: 1,
    creator: mockUsers[2],
    status: "cancelled",
    vehicleType: "car",
    route: "via ECR / ஈசிஆர் வழியே",
    notes: "Ride cancelled due to vehicle breakdown / வாகன பழுது காரணமாக பயணம் ரத்து",
    createdAt: "2025-09-21T20:00:00Z"
  },
  {
    id: "r4",
    pickup: "Tambaram / தாம்பரம்",
    drop: "Chromepet / குரோம்பேட்டை",
    time: "2025-09-21T07:45:00Z", 
    fare: 50,
    seatsTotal: 6,
    seatsAvailable: 3,
    creator: mockUsers[3],
    status: "no-show",
    vehicleType: "share-auto",
    route: "direct route / நேரடி பாதை",
    createdAt: "2025-09-20T19:15:00Z"
  },
  {
    id: "r5",
    pickup: "Anna Nagar / அண்ணா நகர்",
    drop: "Mylapore / மயிலாப்பூர்",
    time: "2025-09-25T17:30:00Z",
    fare: 120,
    seatsTotal: 3,
    seatsAvailable: 1,
    creator: mockUsers[4],
    status: "upcoming",
    vehicleType: "auto",
    route: "via Thousand Lights / தவுசண்ட் லைட்ஸ் வழியே",
    notes: "Evening temple visit / மாலை கோவில் வழிபாடு",
    createdAt: "2025-09-24T14:20:00Z"
  },
  {
    id: "r6", 
    pickup: "Marina Beach / மரினா கடற்கரை",
    drop: "Besant Nagar / பேசன்ட் நகர்",
    time: "2025-09-20T19:00:00Z",
    fare: 80,
    seatsTotal: 4,
    seatsAvailable: 0,
    creator: mockUsers[5],
    status: "completed",
    vehicleType: "car",
    route: "via Elliot's Beach Road / எலியட்ஸ் பீச் ரோடு வழியே",
    notes: "Beach to beach ride / கடற்கரை முதல் கடற்கரை பயணம்",
    createdAt: "2025-09-20T16:45:00Z"
  },
  {
    id: "r7",
    pickup: "Porur / போரூர்", 
    drop: "Sholinganallur / ஷோலிங்கநல்லூர்",
    time: "2025-09-25T09:15:00Z",
    fare: 250,
    seatsTotal: 4,
    seatsAvailable: 3,
    creator: mockUsers[0],
    status: "upcoming", 
    vehicleType: "car",
    route: "via OMR / ஓஎம்ஆர் வழியே",
    notes: "IT professionals ride / ஐடி தொழிலாளர்கள் பயணம்",
    createdAt: "2025-09-24T21:30:00Z"
  },
  {
    id: "r8",
    pickup: "T.Nagar / டி.நகர்",
    drop: "Central Station / சென்ட்ரல் ஸ்டேஷன்", 
    time: "2025-09-19T06:30:00Z",
    fare: 100,
    seatsTotal: 3,
    seatsAvailable: 0,
    creator: mockUsers[2],
    status: "completed",
    vehicleType: "auto",
    route: "via Nungambakkam / நுங்கம்பாக்கம் வழியே",
    notes: "Early morning train catch / அதிகாலை ரயில் பிடிக்க",
    createdAt: "2025-09-18T22:00:00Z"
  }
];

// Helper function to format location display
export const formatLocation = (location: string | ChennaiLocation): string => {
  if (typeof location === 'string') return location;
  return `${location.english} / ${location.tamil}`;
};

// Helper function to get Chennai-themed status colors
export const getChennaiStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-amber-100 text-amber-800 border-amber-200'; // Chennai sun colors
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'; // Success green
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'; // Alert red
    case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200'; // Warning orange
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export { chennaiLocations, mockUsers };
