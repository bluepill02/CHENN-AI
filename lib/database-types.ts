// Database Models for Chennai Community App

export interface User {
  _id?: string;
  id: string;
  name: string;
  email?: string;
  about?: string;
  location?: string;
  trustScore?: string;
  connections?: number;
  postsShared?: number;
  eventsJoined?: number;
  badges?: Array<{
    title: string;
    description: string;
    earned: boolean;
    rarity: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  preferences?: {
    language: 'en' | 'ta' | 'both';
    notifications: boolean;
    privacy: 'public' | 'neighbors' | 'private';
  };
}

export interface Post {
  _id?: string;
  id: string;
  userId: string;
  content?: string;
  contentTa?: string;
  contentEn?: string;
  category: string;
  categoryEn: string;
  location: {
    area: string;
    areaEn: string;
    pincode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  reactions: {
    likes: number;
    likedBy: string[];
    hearts?: number;
    helpful?: number;
  };
  comments: Comment[];
  media?: Array<{
    id: string;
    type: 'image' | 'video' | 'document';
    url: string;
    thumbnailUrl?: string;
    alt?: string;
  }>;
  isUrgent?: boolean;
  isRead?: boolean;
  status: 'active' | 'archived' | 'deleted';
  visibility: 'public' | 'neighbors' | 'private';
  source: 'user' | 'import' | 'system';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Comment {
  _id?: string;
  id: string;
  postId: string;
  userId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    trustScore?: number;
  };
  messageTa?: string;
  messageEn?: string;
  reactions?: {
    likes: number;
    likedBy: string[];
  };
  replyTo?: string; // For nested comments
  status: 'active' | 'deleted' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  _id?: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActive: Date;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    location?: string;
  };
}

export interface CommunityMetrics {
  _id?: string;
  pincode: string;
  area: string;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    postsThisWeek: number;
    totalComments: number;
    averageTrustScore: number;
    topCategories: Array<{
      category: string;
      count: number;
    }>;
  };
  updatedAt: Date;
}

// Database collection names
export const Collections = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  SESSIONS: 'user_sessions',
  METRICS: 'community_metrics'
} as const;

// Database indexes to create
export const DatabaseIndexes = {
  users: [
    { key: { id: 1 }, unique: true },
    { key: { email: 1 }, unique: true, sparse: true },
    { key: { 'location': 1 } },
    { key: { createdAt: -1 } }
  ],
  posts: [
    { key: { id: 1 }, unique: true },
    { key: { userId: 1 } },
    { key: { 'location.pincode': 1 } },
    { key: { category: 1 } },
    { key: { createdAt: -1 } },
    { key: { status: 1 } },
    { key: { isUrgent: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
  ],
  comments: [
    { key: { id: 1 }, unique: true },
    { key: { postId: 1 } },
    { key: { userId: 1 } },
    { key: { createdAt: -1 } },
    { key: { status: 1 } }
  ],
  sessions: [
    { key: { userId: 1 } },
    { key: { sessionToken: 1 }, unique: true },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
  ],
  metrics: [
    { key: { pincode: 1 }, unique: true },
    { key: { updatedAt: -1 } }
  ]
} as const;