// Chennai-themed TypeScript interfaces for Auto Share feature
// சென்னை வடிவமைத்த ஆட்டோ பகிர்வு அம்சத்திற்கான TypeScript இடைமுகங்கள்

// Chennai location interface for bilingual names
export interface ChennaiLocation {
  english: string;
  tamil: string;
  landmark?: string; // Notable nearby landmark
}

// Vehicle types available in Chennai
export type VehicleType = "auto" | "car" | "share-auto";

export type RideStatus = "upcoming" | "completed" | "cancelled" | "no-show";

// User interface with Chennai context
export interface User {
  id: string;
  name: string; // Bilingual format: "Name नाम / பெயர்"
  avatarUrl?: string;
  phoneNumber?: string;
  rating?: number; // 1-5 star rating
  ridesCompleted?: number;
  isVerified?: boolean;
}

// Ride interface with Chennai-specific features
export interface Ride {
  id: string;
  pickup: ChennaiLocation | string; // Support both formats
  drop: ChennaiLocation | string;
  time: string; // ISO 8601 format
  fare: number; // in INR
  seatsTotal: number;
  seatsAvailable: number;
  creator: User;
  status: RideStatus;
  vehicleType?: VehicleType; // Chennai transport types
  notes?: string; // Additional details
  route?: string; // Suggested route (e.g., "via ECR" / "ECR வழியே")
  createdAt?: string;
  seatBookings?: SeatBooking[]; // Track who booked which seats
}

// Seat booking interface
export interface SeatBooking {
  seatNumber: number;
  passenger: User;
  status: "reserved" | "confirmed" | "cancelled";
  bookedAt: string;
}

export interface CreateRideInput {
  pickup: ChennaiLocation | string;
  drop: ChennaiLocation | string;
  time: string;
  fare: number;
  seatsTotal: number;
  vehicleType?: VehicleType;
  route?: string;
  notes?: string;
  creator: User;
}

export interface UpdateRideStatusInput {
  status: RideStatus;
}

export interface BookSeatsInput {
  rideId: string;
  passenger: User;
  seats: number;
  note?: string;
}

export interface AutoShareBookingPayload {
  id: string;
  ride_id: string;
  passenger: {
    id: string;
    name: string;
    name_ta?: string;
  };
  seats: number;
  status: "reserved" | "confirmed" | "cancelled";
  booked_at: string;
  note?: string;
}

export interface AutoShareRidePayload {
  id: string;
  pickup: string;
  pickup_ta?: string;
  drop: string;
  drop_ta?: string;
  time: string;
  fare: number;
  seats_total: number;
  seats_available: number;
  creator: {
    id: string;
    name: string;
    name_ta?: string;
    avatar_url?: string;
    phone_number?: string;
    rating?: number;
    rides_completed?: number;
    verified?: boolean;
  };
  status: RideStatus;
  vehicle_type?: VehicleType;
  notes?: string;
  route?: string;
  created_at?: string;
  bookings?: AutoShareBookingPayload[];
}

export interface AutoShareCreateRidePayload {
  pickup: string;
  pickup_ta?: string;
  drop: string;
  drop_ta?: string;
  time: string;
  fare: number;
  seats_total: number;
  vehicle_type?: VehicleType;
  route?: string;
  notes?: string;
  creator_id: string;
  metadata?: Record<string, unknown>;
}

export interface AutoShareUpdateStatusPayload {
  status: RideStatus;
}

export interface AutoShareSeatRequestPayload {
  passenger_id: string;
  seats: number;
  note?: string;
}

// Chennai transport constants
export const CHENNAI_ROUTES = {
  POPULAR_ROUTES: [
    "T.Nagar to Velachery / டி.நகர் முதல் வேளச்சேரி",
    "Central to Anna Nagar / சென்ட்ரல் முதல் அண்ணா நகர்",
    "Adyar to Guindy / அடையாறு முதல் கிண்டி",
    "Besant Nagar to Mylapore / பேசன்ட் நகர் முதல் மயிலாப்பூர்"
  ]
} as const;
