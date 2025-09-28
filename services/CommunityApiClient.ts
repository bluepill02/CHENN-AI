import type {
    CommunityApiCommentPayload,
    CommunityApiPostPayload,
    CreateCommentInput,
    CreatePostInput,
    LiveComment,
    LivePost,
} from '../types/community';
import { COMMUNITY_API_BASE_URL, COMMUNITY_API_KEY } from './communityConfig';

export class CommunityApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(baseUrl: string = COMMUNITY_API_BASE_URL, apiKey: string = COMMUNITY_API_KEY) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || undefined;
  }

  get isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  private buildHeaders(extra?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return {
      ...headers,
      ...extra,
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!this.isEnabled) {
      throw new Error('Community API client is not enabled. Provide VITE_COMMUNITY_API_BASE_URL.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Community API request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return (await response.json()) as T;
  }

  async fetchPosts(): Promise<LivePost[]> {
    const data = await this.request<CommunityApiPostPayload[]>('/community/posts');
    return data.map(deserializePost);
  }

  async createPost(input: CreatePostInput): Promise<LivePost> {
    const payload = serializeCreatePost(input);
    const post = await this.request<CommunityApiPostPayload>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return deserializePost(post);
  }

  async toggleLike(postId: string, userId: string, like: boolean): Promise<void> {
    const method = like ? 'POST' : 'DELETE';
    await this.request(`/community/posts/${postId}/likes`, {
      method,
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async addComment(input: CreateCommentInput): Promise<LiveComment> {
    const payload = serializeCreateComment(input);
    const comment = await this.request<CommunityApiCommentPayload>(
      `/community/posts/${input.postId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return deserializeComment(comment);
  }

  async uploadMedia(file: File): Promise<{ url: string; thumbnailUrl?: string } | null> {
    if (!this.isEnabled) {
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/community/media`, {
      method: 'POST',
      headers: this.apiKey
        ? {
            'x-api-key': this.apiKey,
          }
        : undefined,
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Media upload failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { url: string; thumbnail_url?: string };
    return {
      url: payload.url,
      thumbnailUrl: payload.thumbnail_url,
    };
  }
}

function deserializePost(payload: CommunityApiPostPayload): LivePost {
  return {
    id: payload.id,
    content: payload.content_ta ?? payload.content_en,
    contentTa: payload.content_ta,
    contentEn: payload.content_en,
    category: payload.category,
    categoryEn: payload.category_en,
    timestamp: new Date(payload.timestamp),
    user: {
      id: payload.user.id,
      name: payload.user.name,
      isVerified: payload.user.verified,
      trustScore: payload.user.trust_score,
      avatarUrl: payload.user.avatar_url,
    },
    location: {
      area: payload.location.area,
      areaEn: payload.location.area_en,
      pincode: payload.location.pincode,
    },
    reactions: {
      likes: payload.reactions.likes,
      likedBy: payload.reactions.liked_by,
    },
    comments: payload.comments.map(deserializeComment),
    media: payload.media?.map(media => ({
      id: media.id,
      type: media.type,
      url: media.url,
      alt: media.alt,
      thumbnailUrl: media.thumbnail_url,
    })),
    isUrgent: payload.urgent ?? false,
    source: 'backend',
    isRead: false,
  };
}

function deserializeComment(payload: CommunityApiCommentPayload): LiveComment {
  return {
    id: payload.id,
    author: payload.author,
    messageTa: payload.message_ta,
    messageEn: payload.message_en,
    createdAt: new Date(payload.created_at),
  };
}

function serializeCreatePost(input: CreatePostInput) {
  return {
    content_ta: input.contentTa,
    content_en: input.contentEn,
    category: input.category,
    category_en: input.categoryEn ?? input.category,
    location: input.location,
    media: input.media?.map(item => ({
      type: item.type,
      alt: item.alt,
      url: item.url,
    })),
    user: input.user,
    urgent: input.isUrgent ?? false,
  };
}

function serializeCreateComment(input: CreateCommentInput) {
  return {
    message_ta: input.messageTa,
    message_en: input.messageEn,
    author: input.author,
  };
}
