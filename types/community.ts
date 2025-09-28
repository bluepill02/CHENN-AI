export interface LiveComment {
  id: string;
  author: {
    id: string;
    name: string;
  };
  messageTa?: string;
  messageEn?: string;
  createdAt: Date;
}

export interface LivePostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  thumbnailUrl?: string;
}

export interface LivePost {
  id: string;
  content?: string;
  contentTa?: string;
  contentEn?: string;
  category: string;
  categoryEn: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    isVerified: boolean;
    trustScore: number;
    avatarUrl?: string;
  };
  location: {
    area: string;
    areaEn: string;
    pincode: string;
  };
  reactions: {
    likes: number;
    likedBy: string[];
  };
  comments: LiveComment[];
  media?: LivePostMedia[];
  isUrgent?: boolean;
  isRead?: boolean;
  source?: 'local' | 'backend';
}

export interface LiveAlert {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
  affectedAreas?: string[];
  pincodes?: string[];
  isActive: boolean;
}

export interface LiveAlertReportInput {
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  area?: string;
  pincode?: string;
  source?: string;
  reporterName?: string;
  reporterContact?: string;
}

export interface LiveAlertApiPayload {
  id: string;
  title: string;
  title_en?: string;
  message: string;
  message_en?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  affected_areas?: string[];
  affected_pincodes?: string[];
  is_active: boolean;
}

export interface CreatePostInput {
  contentTa?: string;
  contentEn?: string;
  category: string;
  categoryEn?: string;
  location?: {
    area: string;
    areaEn: string;
    pincode: string;
  };
  media?: Array<{
    type: 'image' | 'video';
    file?: File;
    url?: string;
    alt?: string;
  }>;
  user?: {
    id: string;
    name: string;
    isVerified?: boolean;
    trustScore?: number;
    avatarUrl?: string;
  };
  isUrgent?: boolean;
}

export interface CreateCommentInput {
  postId: string;
  messageTa?: string;
  messageEn?: string;
  author: {
    id: string;
    name: string;
  };
}

export interface CommunityApiPostPayload {
  id: string;
  content_ta?: string;
  content_en?: string;
  category: string;
  category_en: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    verified: boolean;
    trust_score: number;
    avatar_url?: string;
  };
  location: {
    area: string;
    area_en: string;
    pincode: string;
  };
  reactions: {
    likes: number;
    liked_by: string[];
  };
  comments: Array<{
    id: string;
    author: {
      id: string;
      name: string;
    };
    message_ta?: string;
    message_en?: string;
    created_at: string;
  }>;
  media?: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    alt?: string;
    thumbnail_url?: string;
  }>;
  urgent?: boolean;
}

export interface CommunityApiCommentPayload {
  id: string;
  author: {
    id: string;
    name: string;
  };
  message_ta?: string;
  message_en?: string;
  created_at: string;
}
