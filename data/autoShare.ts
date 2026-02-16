export interface AutoSharePost {
  id: string;
  user: string;
  from: string;
  to: string;
  seatsAvailable: number;
  timestamp: string;
  expiresAt: string;
  pincode: string;
}

// Temporary in-memory store (replace with DB later)
export const autoSharePosts: AutoSharePost[] = [];
