import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import type {
  CreatePostInput,
  LiveAlert,
  LiveComment,
  LivePost,
  LivePostMedia
} from '../types/community';
import { CommunityApiClient } from './CommunityApiClient';
import { COMMUNITY_FEATURE_FLAGS, COMMUNITY_MEDIA_UPLOAD_ENABLED } from './communityConfig';

interface RealTimeDataContextType {
  posts: LivePost[];
  alerts: LiveAlert[];
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date | null;
  postsCount: number;
  isUsingBackend: boolean;
  createPost: (postData: CreatePostInput) => Promise<LivePost>;
  simulateNewPost: (postData: Partial<LivePost>) => Promise<LivePost>;
  markPostAsRead: (postId: string) => void;
  addAlert: (alert: Partial<LiveAlert>) => void;
  dismissAlert: (alertId: string) => void;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (
    postId: string,
    comment: Omit<LiveComment, 'id' | 'createdAt'> & { id?: string; createdAt?: Date }
  ) => Promise<LiveComment | null>;
  uploadMedia?: (file: File) => Promise<{ url: string; thumbnailUrl?: string } | null>;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | undefined>(undefined);

interface RealTimeDataProviderProps {
  children: ReactNode;
}

// Simulated Chennai locations
const chennaiLocations = [
  { area: 'T. Nagar', areaEn: 'T. Nagar', pincode: '600017' },
  { area: 'மயிலாப்பூர்', areaEn: 'Mylapore', pincode: '600004' },
  { area: 'அடையார்', areaEn: 'Adyar', pincode: '600020' },
  { area: 'அண்ணா நகர்', areaEn: 'Anna Nagar', pincode: '600040' },
  { area: 'வேளச்சேரி', areaEn: 'Velachery', pincode: '600042' }
];

// Sample community content for simulation
const sampleContents = {
  ta: [
    'நம்ம area-ல கிட்ட traffic jam ஆச்சு, alternate route use பண்ணுங்க',
    'புதிய coffee shop திறந்திருக்கிறது, filter coffee semma taste!',
    'நாளை temple-ல special பூஜை, எல்லோரும் வாங்க',
    'Auto-ல share போக வேண்டியவர்கள் இருக்கீங்களா?',
    'Street light-கள் கெட்டு போச்சு, corporation-க்கு complaint பண்ணலாம்',
    'Metro station-ல lift வேலை செய்யலை, stairs use பண்ணுங்க'
  ],
  en: [
    'Heavy traffic near our area, please use alternate routes',
    'New coffee shop opened, their filter coffee is amazing!',
    'Special prayers at temple tomorrow, everyone welcome',
    'Anyone need auto share? Going towards OMR',
    'Street lights not working, should we file corporation complaint?',
    'Metro station lift is down, please use stairs'
  ]
};

const sampleAlerts: Partial<LiveAlert>[] = [
  {
    title: 'போக்குவரத்து நெரிசல்',
    titleEn: 'Heavy Traffic Alert',
    message: 'GST Road-ல heavy traffic. Mount Road வழியா போங்க.',
    messageEn: 'Heavy traffic on GST Road. Please use Mount Road route.',
    severity: 'medium',
    source: 'Traffic Control',
    affectedAreas: ['GST Road', 'Guindy', 'St. Thomas Mount']
  },
  {
    title: 'நீர் விநியோக இடையூறு',
    titleEn: 'Water Supply Disruption',
    message: 'T.Nagar பகுதியில் நாளை காலை 6-10 AM நீர் விநியோகம் இல்லை.',
    messageEn: 'Water supply will be disrupted in T.Nagar area tomorrow 6-10 AM.',
    severity: 'high',
    source: 'Chennai Water Board',
    affectedAreas: ['T. Nagar', 'West Mambalam']
  }
];

export function RealTimeDataProvider({ children }: RealTimeDataProviderProps) {
  const apiClientRef = useRef(new CommunityApiClient());
  const backendConfigured = COMMUNITY_FEATURE_FLAGS.enableBackend && apiClientRef.current.isEnabled;

  const [posts, setPosts] = useState<LivePost[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [isConnected, setIsConnected] = useState(!backendConfigured);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>(
    backendConfigured ? 'connecting' : 'connected'
  );
  const [lastUpdate, setLastUpdate] = useState<Date | null>(backendConfigured ? null : new Date());
  const [isUsingBackend, setIsUsingBackend] = useState(false);

  const simulationInitializedRef = useRef(false);
  const postIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backendPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSimulationIntervals = () => {
    if (postIntervalRef.current) {
      clearInterval(postIntervalRef.current);
      postIntervalRef.current = null;
    }
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
  };

  const clearBackendTimers = () => {
    if (backendPollIntervalRef.current) {
      clearInterval(backendPollIntervalRef.current);
      backendPollIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const ensureSimulationSeeded = () => {
    if (simulationInitializedRef.current) {
      return;
    }

    simulationInitializedRef.current = true;
    for (let i = 0; i < 4; i += 1) {
      simulateRandomPost();
    }
    sampleAlerts.forEach(alert => addAlert(alert));
  };

  const startSimulationMode = () => {
    clearBackendTimers();
    setIsUsingBackend(false);
    setIsConnected(true);
    setConnectionStatus('connected');
    setLastUpdate(new Date());
    ensureSimulationSeeded();

    if (!postIntervalRef.current) {
      const interval = 15000 + Math.random() * 15000;
      postIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.3) {
          simulateRandomPost();
        }
      }, interval);
    }

    if (!alertIntervalRef.current) {
      alertIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.1) {
          simulateRandomAlert();
        }
      }, 60000);
    }
  };

  useEffect(() => {
    return () => {
      clearSimulationIntervals();
      clearBackendTimers();
    };
  }, []);

  const refreshFromBackend = async () => {
    const postsFromBackend = await apiClientRef.current.fetchPosts();
    setPosts(postsFromBackend);
    setIsUsingBackend(true);
    setIsConnected(true);
    setConnectionStatus('connected');
    setLastUpdate(new Date());
  };

  useEffect(() => {
    let cancelled = false;

    const attemptConnection = async () => {
      if (cancelled) {
        return;
      }

      if (!backendConfigured) {
        startSimulationMode();
        return;
      }

      setConnectionStatus('connecting');

      try {
        await refreshFromBackend();
        clearSimulationIntervals();
      } catch (error) {
        console.error('Failed to connect to community backend. Falling back to simulation.', error);
        setIsConnected(false);
        setConnectionStatus('error');
        startSimulationMode();

        if (!cancelled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            attemptConnection();
          }, 20000);
        }
      }
    };

    attemptConnection();

    return () => {
      cancelled = true;
      clearBackendTimers();
    };
  }, [backendConfigured]);

  useEffect(() => {
    if (!backendConfigured || !isUsingBackend) {
      return;
    }

    if (backendPollIntervalRef.current) {
      clearInterval(backendPollIntervalRef.current);
    }

    const poll = async () => {
      try {
        await refreshFromBackend();
      } catch (error) {
        console.warn('Community backend poll failed.', error);
        setConnectionStatus('error');
        setIsConnected(false);
      }
    };

    backendPollIntervalRef.current = setInterval(poll, 45000);

    return () => {
      if (backendPollIntervalRef.current) {
        clearInterval(backendPollIntervalRef.current);
        backendPollIntervalRef.current = null;
      }
    };
  }, [backendConfigured, isUsingBackend]);

  useEffect(() => {
    if (isUsingBackend) {
      return;
    }

    const connectionInterval = setInterval(() => {
      const shouldDisconnect = Math.random() < 0.05;

      if (shouldDisconnect && isConnected) {
        setIsConnected(false);
        setConnectionStatus('disconnected');

        setTimeout(() => {
          setIsConnected(true);
          setConnectionStatus('connected');
          setLastUpdate(new Date());
        }, 2000 + Math.random() * 3000);
      }
    }, 10000);

    return () => clearInterval(connectionInterval);
  }, [isConnected, isUsingBackend]);

  const simulateRandomPost = () => {
    const location = chennaiLocations[Math.floor(Math.random() * chennaiLocations.length)];
    const isTamil = Math.random() < 0.7; // 70% chance of Tamil content
    const content = isTamil 
      ? sampleContents.ta[Math.floor(Math.random() * sampleContents.ta.length)]
      : sampleContents.en[Math.floor(Math.random() * sampleContents.en.length)];

    const categories = [
      { ta: 'உதவி', en: 'help' },
      { ta: 'நிகழ்ச்சி', en: 'event' },
      { ta: 'சாப்பாடு', en: 'food' },
      { ta: 'எச்சரிக்கை', en: 'alert' }
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const names = ['Priya', 'Rajesh', 'Divya', 'Venkat', 'Lakshmi', 'Suresh', 'Meera', 'Kumar'];
    const name = names[Math.floor(Math.random() * names.length)];

    simulateNewPost({
      content,
      contentTa: isTamil ? content : undefined,
      contentEn: isTamil ? sampleContents.en[Math.floor(Math.random() * sampleContents.en.length)] : content,
      category: category.ta,
      categoryEn: category.en,
      user: {
        id: `user_${name.toLowerCase()}`,
        name,
        isVerified: Math.random() < 0.6,
        trustScore: Math.floor(Math.random() * 50) + 50
      },
      location
    });
  };

  const simulateRandomAlert = () => {
    const alertTemplate = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    addAlert(alertTemplate);
  };

  const simulateNewPost = async (postData: Partial<LivePost>) => {
    const now = new Date();
    const newPost: LivePost = {
      id: postData.id || `post_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      content: postData.content || postData.contentTa || postData.contentEn || 'New community update!',
      contentTa: postData.contentTa,
      contentEn: postData.contentEn,
      category: postData.category || 'நிகழ்ச்சி',
      categoryEn: postData.categoryEn || 'event',
      timestamp: postData.timestamp || now,
      user: {
        id: postData.user?.id || 'guest-user',
        name: postData.user?.name || 'Community Member',
        isVerified: postData.user?.isVerified || false,
        trustScore: postData.user?.trustScore ?? 75
      },
      location: postData.location || {
        area: 'மயிலாப்பூர்',
        areaEn: 'Mylapore',
        pincode: '600004'
      },
      reactions: {
        likes: postData.reactions?.likes ?? Math.floor(Math.random() * 20),
        likedBy: postData.reactions?.likedBy ? [...postData.reactions.likedBy] : []
      },
      comments: postData.comments ? postData.comments.map(comment => ({
        ...comment,
        id: comment.id || `comment_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: comment.createdAt || now
      })) : [],
      media: postData.media?.map(media => ({
        ...media,
        id: media.id || `media_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      isUrgent: postData.isUrgent || false,
      isRead: false,
      source: postData.source || 'local'
    };

    setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 49)]); // Keep last 50 posts
    setLastUpdate(new Date());
    return newPost;
  };

  const markPostAsRead = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, isRead: true } : post
      )
    );
  };

  const toggleLike = async (postId: string, userId: string) => {
    const existingPost = posts.find(post => post.id === postId);
    const alreadyLiked = existingPost?.reactions.likedBy.includes(userId) ?? false;
    const shouldLike = !alreadyLiked;

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        const updatedLikedBy = shouldLike
          ? [...new Set([...post.reactions.likedBy, userId])]
          : post.reactions.likedBy.filter(id => id !== userId);

        return {
          ...post,
          reactions: {
            likes: Math.max(0, post.reactions.likes + (shouldLike ? 1 : -1)),
            likedBy: updatedLikedBy
          }
        };
      })
    );
    setLastUpdate(new Date());

    if (backendConfigured && isUsingBackend) {
      try {
        await apiClientRef.current.toggleLike(postId, userId, shouldLike);
        setIsConnected(true);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to update like on backend', error);
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id !== postId) return post;

            const revertedLikedBy = alreadyLiked
              ? [...new Set([...post.reactions.likedBy, userId])]
              : post.reactions.likedBy.filter(id => id !== userId);

            return {
              ...post,
              reactions: {
                likes: Math.max(0, post.reactions.likes + (alreadyLiked ? 1 : -1)),
                likedBy: revertedLikedBy
              }
            };
          })
        );
        setConnectionStatus('error');
        setIsConnected(false);
        throw error;
      }
    }
  };

  const addComment = async (
    postId: string,
    comment: Omit<LiveComment, 'id' | 'createdAt'> & { id?: string; createdAt?: Date }
  ): Promise<LiveComment | null> => {
    const provisionalComment: LiveComment = {
      id: comment.id || `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: comment.author,
      messageTa: comment.messageTa,
      messageEn: comment.messageEn,
      createdAt: comment.createdAt || new Date()
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [provisionalComment, ...post.comments]
            }
          : post
      )
    );
    setLastUpdate(new Date());

    if (backendConfigured && isUsingBackend) {
      try {
        const created = await apiClientRef.current.addComment({
          postId,
          author: comment.author,
          messageTa: comment.messageTa,
          messageEn: comment.messageEn
        });

        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map(existingComment =>
                    existingComment.id === provisionalComment.id ? created : existingComment
                  )
                }
              : post
          )
        );

        return created;
      } catch (error) {
        console.error('Failed to add comment on backend', error);
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.filter(existingComment => existingComment.id !== provisionalComment.id)
                }
              : post
          )
        );
        setConnectionStatus('error');
        setIsConnected(false);
        throw error;
      }
    }

    return provisionalComment;
  };

  const addAlert = (alertData: Partial<LiveAlert>) => {
    const newAlert: LiveAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: alertData.title || 'சமூக எச்சரிக்கை',
      titleEn: alertData.titleEn || 'Community Alert',
      message: alertData.message || 'Important community notification',
      messageEn: alertData.messageEn || 'Important community notification',
      severity: alertData.severity || 'medium',
      timestamp: new Date(),
      source: alertData.source || 'Community System',
      affectedAreas: alertData.affectedAreas || [],
      isActive: true
    };

    setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 9)]); // Keep last 10 alerts
    setLastUpdate(new Date());
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      ).filter(alert => alert.isActive)
    );
  };

  const createPost = async (postData: CreatePostInput): Promise<LivePost> => {
    if (backendConfigured && isUsingBackend) {
      try {
        const created = await apiClientRef.current.createPost(postData);
        setPosts(prevPosts => [created, ...prevPosts]);
        setLastUpdate(new Date());
        setIsConnected(true);
        setConnectionStatus('connected');
        return created;
      } catch (error) {
        console.error('Failed to create post on backend', error);
        setConnectionStatus('error');
        setIsConnected(false);
        throw error;
      }
    }

    return simulateNewPost({
      content: postData.contentEn ?? postData.contentTa,
      contentTa: postData.contentTa,
      contentEn: postData.contentEn,
      category: postData.category,
      categoryEn: postData.categoryEn ?? postData.category,
      location:
        postData.location ||
        {
          area: 'மயிலாப்பூர்',
          areaEn: 'Mylapore',
          pincode: '600004'
        },
      user: postData.user
        ? {
            id: postData.user.id,
            name: postData.user.name,
            isVerified: postData.user.isVerified ?? false,
            trustScore: postData.user.trustScore ?? 75,
            avatarUrl: postData.user.avatarUrl
          }
        : undefined,
      media: postData.media
        ?.filter(media => Boolean(media.url))
        .map((media, index) => ({
          id: `media_${Date.now()}_${index}`,
          type: media.type,
          url: media.url as string,
          alt: media.alt
        } as LivePostMedia)),
      isUrgent: postData.isUrgent,
      source: 'local'
    });
  };

  const uploadMediaFn = COMMUNITY_MEDIA_UPLOAD_ENABLED
    ? async (file: File) => {
        if (!backendConfigured || !isUsingBackend) {
          return null;
        }

        return apiClientRef.current.uploadMedia(file);
      }
    : undefined;

  const value: RealTimeDataContextType = {
    posts,
    alerts: alerts.filter(alert => alert.isActive),
    isConnected,
    connectionStatus,
    lastUpdate,
    postsCount: posts.length,
    isUsingBackend,
    createPost,
    simulateNewPost,
    markPostAsRead,
    addAlert,
    dismissAlert,
    toggleLike,
    addComment,
    uploadMedia: uploadMediaFn
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>
  );
}

export function useRealTimeData() {
  const context = useContext(RealTimeDataContext);
  if (context === undefined) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
}

// Utility functions for time formatting
export function getRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getRelativeTimeTamil(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'இப்போது';
  if (diffInMinutes < 60) return `${diffInMinutes} நிமிடங்கள் முன்`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} மணிநேரம் முன்`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} நாட்கள் முன்`;
}