// TypeScript interfaces for Auto Share feature

// User interface
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Ride interface
export interface Ride {
  id: string;
  pickup: string;
  drop: string;
  time: string; // ISO 8601 format
  fare: number;
  seatsTotal: number;
  seatsAvailable: number;
  creator: User;
  status: "upcoming" | "completed" | "cancelled" | "no-show";
}
