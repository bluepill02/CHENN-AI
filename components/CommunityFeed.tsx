
import communityScenes from 'figma:asset/39dd468cce8081c14f345796484cc8b182dc6bb6.png';
import { Heart, MapPin, MessageCircle, Navigation, Plus, Share2, Shield, Star, X } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rickshawVideo from '../assets/Rickshaw.webm';
import { useLanguage } from '../services/LanguageService';
import { useLocation } from '../services/LocationService';
import { getRelativeTime, getRelativeTimeTamil, useRealTimeData } from '../services/RealTimeDataService';
import { getUser, UserProfile } from '../src/services/UserService';
import type { LivePost } from '../types/community';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChennaiIcons, IllustratedIcon } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from './ui/drawer';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';

const LiveInfoPageLazy = lazy(() =>
  import('./LiveInfoPage').then(module => ({ default: module.LiveInfoPage }))
);

interface CommunityFeedProps {
  userLocation?: any;
}

export function CommunityFeed({ userLocation }: CommunityFeedProps) {
  const navigate = useNavigate();
  const [showLiveInfo, setShowLiveInfo] = useState(false);
  const { currentLocation, setLocationModalOpen } = useLocation();
  const { language, t } = useLanguage();
  const { posts, simulateNewPost, toggleLike, addComment, connectionStatus, lastUpdate } = useRealTimeData();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const hasSeededInitialPosts = useRef(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerCategory, setComposerCategory] = useState('community');
  const [composerContentTa, setComposerContentTa] = useState('');
  const [composerContentEn, setComposerContentEn] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});
  const [selectedPostIdForComments, setSelectedPostIdForComments] = useState<string | null>(null);
  const [commentTextTa, setCommentTextTa] = useState('');
  const [commentTextEn, setCommentTextEn] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const composerCloseReasonRef = useRef<'cancel_button' | 'submit_success' | null>(null);
  const commentCloseReasonRef = useRef<'close_button' | 'submit_success' | null>(null);

  const activeLocation = currentLocation || userLocation;
  const activeArea = activeLocation?.area ?? null;
  const activePincode = activeLocation?.pincode ?? null;

  const trackCommunityEvent = useCallback(
    (eventName: string, details: Record<string, unknown> = {}) => {
      const payload = {
        event: eventName,
        timestamp: Date.now(),
        language,
        userId: currentUser?.id ?? 'guest',
        area: activeArea,
        pincode: activePincode,
        ...details,
      };

      if (typeof window !== 'undefined') {
        try {
          const globalWindow = window as typeof window & { dataLayer?: Record<string, unknown>[] };
          if (!Array.isArray(globalWindow.dataLayer)) {
            globalWindow.dataLayer = [];
          }
          globalWindow.dataLayer.push(payload);
          window.dispatchEvent(new CustomEvent('community-telemetry', { detail: payload }));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[CommunityTelemetry] dispatch failed', error);
          }
        }
      }

      if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
        console.debug('[CommunityTelemetry]', payload);
      }
    },
    [activeArea, activePincode, currentUser?.id, language],
  );

  const openLiveInfo = useCallback(
    (source: 'quick_action' | 'fab' | 'status_banner' = 'quick_action') => {
      trackCommunityEvent('live_info_opened', { source });
      setShowLiveInfo(true);
    },
    [trackCommunityEvent],
  );

  const closeLiveInfo = useCallback(
    (reason: 'backdrop' | 'close_button' | 'back_action' | 'escape_key' = 'close_button') => {
      if (!showLiveInfo) {
        return;
      }
      setShowLiveInfo(false);
      trackCommunityEvent('live_info_closed', { reason });
    },
    [showLiveInfo, trackCommunityEvent],
  );

  const composerCategoryOptions = useMemo(
    () => [
      { value: 'community', labelEn: 'Community Update', labelTa: 'சமூக தகவல்' },
      { value: 'event', labelEn: 'Local Event', labelTa: 'நிகழ்ச்சி' },
      { value: 'food', labelEn: 'Food & Spots', labelTa: 'சாப்பாடு' },
      { value: 'help', labelEn: 'Help Request', labelTa: 'உதவி வேண்டுகோள்' }
    ],
    []
  );

  const quickActionItems = useMemo(
    () => [
      {
        key: 'auto_share',
        label: t('feed.quickActions.autoShare', 'Auto Share'),
        description: t('feed.quickActions.autoShareHint', 'Plan or join a shared ride'),
        onSelect: () => {
          trackCommunityEvent('quick_action_triggered', {
            action: 'auto_share',
            destination: '/auto-share',
          });
          navigate('/auto-share');
        },
        media: {
          type: 'video' as const,
          source: rickshawVideo,
          poster: ChennaiIcons.auto,
        },
      },
      {
        key: 'food',
        label: t('feed.quickActions.foodHunt', 'Food Hunt'),
        description: t('feed.quickActions.foodHuntHint', 'Discover trusted local eats'),
        onSelect: () => {
          trackCommunityEvent('quick_action_triggered', {
            action: 'food_hunt',
            destination: '/food-hunt',
          });
          navigate('/food-hunt');
        },
        media: {
          type: 'icon' as const,
          source: ChennaiIcons.food,
        },
      },
      {
        key: 'live_info',
        label: t('feed.quickActions.liveInfo', 'Live Alerts'),
        description: t('feed.quickActions.liveInfoHint', 'Traffic, weather, civic updates'),
        onSelect: () => openLiveInfo('quick_action'),
        media: {
          type: 'icon' as const,
          source: ChennaiIcons.community,
        },
      },
      {
        key: 'localities',
        label: t('feed.quickActions.engaArea', 'Enga Area'),
        description: t('feed.quickActions.engaAreaHint', 'Rankings & locality insights'),
        onSelect: () => {
          trackCommunityEvent('quick_action_triggered', {
            action: 'localities',
            destination: '/localities',
          });
          navigate('/localities');
        },
        media: {
          type: 'icon' as const,
          source: ChennaiIcons.beach,
        },
      },
    ],
    [navigate, openLiveInfo, t, trackCommunityEvent],
  );

  const selectedCategory = composerCategoryOptions.find(option => option.value === composerCategory) || composerCategoryOptions[0];

  const canSubmitPost = composerContentTa.trim().length > 0 || composerContentEn.trim().length > 0;

  // Use location from context if available, otherwise use prop
  const locationLabel = activeLocation
    ? `${activeLocation.area}${activeLocation.pincode ? ` • ${activeLocation.pincode}` : ''}`
    : t('feed.location.fallback', 'Mylapore • 600004');
  const locationCommunityName = activeLocation?.localContent?.communityName ?? null;
  const heroStats = useMemo(
    () => [
      {
        key: 'trust-score',
        label: t('feed.hero.trustScore', 'Trust score'),
        value: '4.8',
        icon: <Star className="h-4 w-4 text-yellow-200" aria-hidden={true} />,
        helper: t('feed.hero.trustScoreHint', 'Community reliability index'),
      },
      {
        key: 'radius',
        label: t('feed.hero.radius', 'Local radius'),
        value: '2.3 km',
        icon: <Navigation className="h-4 w-4 text-orange-100" aria-hidden={true} />,
        helper: t('feed.hero.radiusHint', 'Updates within walking distance'),
      },
      {
        key: 'live-stories',
        label: t('feed.hero.liveStories', 'Live stories'),
        value: `${Math.max(posts.length, 1)}+`,
        icon: <MessageCircle className="h-4 w-4 text-orange-100" aria-hidden={true} />,
        helper: t('feed.hero.liveStoriesHint', 'Shared in the last day'),
      },
    ],
    [posts.length, t],
  );

  const composerHelperTopics = useMemo(
    () => [
      t('feed.composer.topicTraffic', 'Traffic'),
      t('feed.composer.topicEvents', 'Events'),
      t('feed.composer.topicFood', 'Food'),
      t('feed.composer.topicHelp', 'Help'),
    ],
    [t],
  );

  useEffect(() => {
    let mounted = true;

    getUser()
      .then(user => {
        if (mounted) {
          setCurrentUser(user);
        }
      })
      .catch(error => {
        console.error('CommunityFeed: failed to load user profile', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasSeededInitialPosts.current || posts.length > 0) {
      return;
    }

    const now = Date.now();
    const baseLocation = activeLocation
      ? {
          area: activeLocation.area,
          areaEn: activeLocation.area,
          pincode: activeLocation.pincode
        }
      : {
          area: 'மயிலாப்பூர்',
          areaEn: 'Mylapore',
          pincode: '600004'
        };

    const seedPosts: Partial<LivePost>[] = [
      {
        id: 'seed_food_spot',
        contentTa: `நம்ம ${baseLocation.area} பகுதியில் super இட்லி கடை கண்டுபிடிச்சேன்! அன்னைவர் mess-ல காலை 6-9 மணிக்கு hot கல் இட்லி கிடைக்கும். வருங்க!`,
        contentEn: `Found an amazing idli spot near ${baseLocation.areaEn}! Amma's Kitchen serves piping hot kal idli between 6-9 AM. Come try!`,
        category: 'சாப்பாடு',
        categoryEn: 'food',
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        user: {
          id: 'user-priya-akka',
          name: 'Priya Akka',
          isVerified: true,
          trustScore: 92
        },
        location: {
          area: baseLocation.area,
          areaEn: baseLocation.areaEn,
          pincode: baseLocation.pincode
        },
        reactions: {
          likes: 23,
          likedBy: []
        },
        comments: [
          {
            id: 'seed-food-comment-1',
            author: { id: 'user-venkat', name: 'Venkat' },
            messageTa: 'Thanks akka! நா முற்றிலும் miss பண்ணிட்டேன். இன்று மாலை போயிட்டு வர்றேன்.',
            messageEn: 'Thanks akka! Was looking for a new breakfast spot. Heading there this evening!',
            createdAt: new Date(now - 90 * 60 * 1000)
          }
        ],
        media: [
          {
            id: 'seed-food-media-1',
            type: 'image',
            url: ChennaiIcons.food,
            alt: 'Hot idli served with gun powder'
          }
        ]
      },
      {
        id: 'seed_mylapore_event',
        contentTa: 'கபாலீஸ்வரர் கோவிலில் இந்த வெள்ளிக்கிழமை special தீப ஆராதனை இருக்கு. எல்லாரும் குடும்பத்தோட வருங்க!',
        contentEn: 'Special deeparathanai at Kapaleeshwarar temple this Friday evening. Bring your family and join us!',
        category: 'நிகழ்ச்சி',
        categoryEn: 'event',
        timestamp: new Date(now - 4 * 60 * 60 * 1000),
        user: {
          id: 'user-rajesh-anna',
          name: 'Rajesh Anna',
          isVerified: true,
          trustScore: 88
        },
        location: {
          area: 'மயிலாப்பூர்',
          areaEn: 'Mylapore',
          pincode: '600004'
        },
        reactions: {
          likes: 45,
          likedBy: []
        },
        comments: [
          {
            id: 'seed-event-comment-1',
            author: { id: 'user-lakshmi', name: 'Lakshmi Mami' },
            messageTa: 'மாலை 5 மணிக்கே நாங்கள் வர்றோம். prasadam கொஞ்சம் வைத்துருங்க!',
            messageEn: 'We will be there by 5 PM. Please save some prasadam!',
            createdAt: new Date(now - 150 * 60 * 1000)
          }
        ]
      },
      {
        id: 'seed_beach_cleanup',
        contentTa: 'இந்த ஞாயிறு காலை 6 மணிக்கு மெரினா கடற்கரை சுத்தம் பண்ணும் நிகழ்ச்சி. Gloves, bags எல்லாம் நாங்க arrange பண்ணிருக்கோம்.',
        contentEn: 'Beach cleanup drive at Marina this Sunday 6 AM. We\'ll bring gloves and bags. Join us to keep Chennai clean!',
        category: 'சமூகம்',
        categoryEn: 'community',
        timestamp: new Date(now - 26 * 60 * 60 * 1000),
        user: {
          id: 'user-venkat-anna',
          name: 'Venkat Anna',
          isVerified: true,
          trustScore: 95
        },
        location: {
          area: 'பெசன்ட் நகர்',
          areaEn: 'Besant Nagar',
          pincode: '600090'
        },
        reactions: {
          likes: 67,
          likedBy: []
        },
        comments: [
          {
            id: 'seed-cleanup-comment-1',
            author: { id: 'user-meera', name: 'Meera Devi' },
            messageTa: 'நாங்க family உடன் வர்றோம்! cleanup கு பிறகு இடி்லி சாப்பிடலாம்!',
            messageEn: 'Coming with my family! Let\'s grab breakfast after the cleanup!',
            createdAt: new Date(now - 20 * 60 * 60 * 1000)
          }
        ],
        media: [
          {
            id: 'seed-beach-media-1',
            type: 'image',
            url: ChennaiIcons.beach,
            alt: 'Marina beach cleanup'
          }
        ]
      }
    ];

    seedPosts.forEach(postData => {
      simulateNewPost(postData);
    });

    hasSeededInitialPosts.current = true;
  }, [activeLocation, posts.length, simulateNewPost]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
  setIsMobileViewport(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!showLiveInfo || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLiveInfo('escape_key');
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeLiveInfo, showLiveInfo]);

  const feedPosts = useMemo(() => {
    if (!activeLocation) {
      return posts;
    }

    const areaName = activeLocation.area?.toLowerCase();
    const pincode = activeLocation.pincode;

    const filtered = posts.filter(post => {
      const matchesPincode = post.location.pincode === pincode;
      const matchesArea =
        post.location.area?.toLowerCase() === areaName ||
        post.location.areaEn?.toLowerCase() === areaName;

      return matchesPincode || matchesArea;
    });

    return filtered.length > 0 ? filtered : posts;
  }, [activeLocation, posts]);

  const selectedPostForComments = useMemo(() => {
    if (!selectedPostIdForComments) {
      return null;
    }

    return posts.find(post => post.id === selectedPostIdForComments) || null;
  }, [posts, selectedPostIdForComments]);

  const isCommentPanelOpen = Boolean(selectedPostForComments);
  const canSubmitComment = commentTextTa.trim().length > 0 || commentTextEn.trim().length > 0;

  const getPostBadge = (post: LivePost) => {
    const categoryKey = (post.categoryEn || post.category || '').toLowerCase();
    const labelTa = post.category || '';
    const labelEn = post.categoryEn || '';
    const label = labelTa && labelEn ? `${labelEn} • ${labelTa}` : labelEn || labelTa;

    switch (categoryKey) {
      case 'food':
        return (
          <Badge className="badge-temple flex items-center gap-1 text-xs px-2 py-0">
            <IllustratedIcon src={ChennaiIcons.food} alt="Food" size="sm" className="w-3 h-3" />
            <span className="ml-1">{label || 'Food'}</span>
          </Badge>
        );
      case 'event':
      case 'community':
        return (
          <Badge className="badge-commute flex items-center gap-1 text-xs px-2 py-0">
            <IllustratedIcon src={ChennaiIcons.community} alt="Event" size="sm" className="w-3 h-3" />
            <span className="ml-1">{label || 'Community'}</span>
          </Badge>
        );
      case 'festival':
        return (
          <Badge className="badge-festival flex items-center gap-1 text-xs px-2 py-0">
            <IllustratedIcon src={ChennaiIcons.temple} alt="Festival" size="sm" className="w-3 h-3" />
            <span className="ml-1">{label || 'Festival'}</span>
          </Badge>
        );
      case 'help':
      case 'alert':
        return (
          <Badge className="badge-commute flex items-center gap-1 text-xs px-2 py-0">
            <IllustratedIcon src={ChennaiIcons.auto} alt="Help" size="sm" className="w-3 h-3" />
            <span className="ml-1">{label || 'Help'}</span>
          </Badge>
        );
      default:
        if (!label) return null;
        return (
          <Badge className="flex items-center gap-1 text-xs px-2 py-0 bg-orange-100 text-orange-800 border-orange-200">
            <span>{label}</span>
          </Badge>
        );
    }
  };

  const getPostContent = (post: LivePost) => {
    if (language === 'ta') {
      return post.contentTa || post.content || post.contentEn || '';
    }

    return post.contentEn || post.content || post.contentTa || '';
  };

  const formatRelativeTime = (timestamp: Date) => {
    return language === 'ta' ? getRelativeTimeTamil(timestamp) : getRelativeTime(timestamp);
  };

  const formatLocationLabel = (post: LivePost) => {
    const areaTa = post.location.area;
    const areaEn = post.location.areaEn;

    if (areaTa && areaEn && areaTa !== areaEn) {
      return `${areaEn} • ${areaTa}`;
    }

    return areaTa || areaEn || t('common.Chennai', 'Chennai');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');

  const isPostLikedByCurrentUser = (post: LivePost) => {
    const likeUserId = currentUser?.id ?? 'guest-user';
    return post.reactions.likedBy.includes(likeUserId);
  };

  const handleLike = (post: LivePost) => {
    const likeUserId = currentUser?.id ?? 'guest-user';
    const previouslyLiked = post.reactions.likedBy.includes(likeUserId);
    const likesBefore = post.reactions.likes;
    const likesAfter = previouslyLiked ? Math.max(likesBefore - 1, 0) : likesBefore + 1;

    toggleLike(post.id, likeUserId);

    trackCommunityEvent('post_like_toggled', {
      postId: post.id,
      liked: !previouslyLiked,
      previouslyLiked,
      likesBefore,
      likesAfter,
      source: 'feed_card',
    });
  };

  const resetComposer = () => {
    setComposerContentTa('');
    setComposerContentEn('');
    setComposerCategory(composerCategoryOptions[0]?.value ?? 'community');
  };

  const resetCommentDrafts = () => {
    setCommentTextTa('');
    setCommentTextEn('');
    setIsSubmittingComment(false);
  };

  const handleComposerOpen = (source: 'cta_card' | 'fab' | 'inline_cta' = 'cta_card') => {
    composerCloseReasonRef.current = null;
    trackCommunityEvent('composer_opened', { source });
    setIsComposerOpen(true);
  };

  const handleComposerOpenChange = (open: boolean) => {
    if (!open && isComposerOpen) {
      if (composerCloseReasonRef.current) {
        composerCloseReasonRef.current = null;
      } else {
        trackCommunityEvent('composer_closed', { reason: 'overlay_dismiss' });
        setIsSubmittingPost(false);
        resetComposer();
      }
    }

    setIsComposerOpen(open);
  };

  const handleComposerClose = (reason: 'cancel_button' | 'submit_success') => {
    composerCloseReasonRef.current = reason;
    trackCommunityEvent('composer_closed', { reason });
    setIsComposerOpen(false);
    setIsSubmittingPost(false);
    resetComposer();
  };

  const handleComposerCancel = () => {
    handleComposerClose('cancel_button');
  };

  const handleSubmitPost = () => {
    if (!canSubmitPost || isSubmittingPost) {
      return;
    }

    setIsSubmittingPost(true);

    const fallbackLocation = {
      area: 'மயிலாப்பூர்',
      areaEn: 'Mylapore',
      pincode: '600004'
    };

    const locationSource = activeLocation ? 'user_location' : 'fallback';
    const location = activeLocation
      ? {
          area: activeLocation.area,
          areaEn: activeLocation.area,
          pincode: activeLocation.pincode
        }
      : fallbackLocation;

    const rawTrustScore = currentUser?.trustScore ? parseFloat(currentUser.trustScore) : NaN;
    const trustScore = Number.isFinite(rawTrustScore) ? rawTrustScore : 82;
    const hasTamil = composerContentTa.trim().length > 0;
    const hasEnglish = composerContentEn.trim().length > 0;
    const contentLengthTa = composerContentTa.trim().length;
    const contentLengthEn = composerContentEn.trim().length;

    simulateNewPost({
      content: composerContentTa || composerContentEn,
      contentTa: composerContentTa || undefined,
      contentEn: composerContentEn || undefined,
      category: selectedCategory?.labelTa || 'சமூக தகவல்',
      categoryEn: selectedCategory?.labelEn || 'Community Update',
      timestamp: new Date(),
      user: {
        id: currentUser?.id ?? 'guest-user',
        name: currentUser?.name ?? 'Community Member',
        isVerified: true,
        trustScore
      },
      location,
      reactions: {
        likes: 0,
        likedBy: currentUser?.id ? [currentUser.id] : []
      },
      comments: []
    });

    trackCommunityEvent('composer_post_submitted', {
      category: composerCategory,
      categoryLabelEn: selectedCategory?.labelEn,
      categoryLabelTa: selectedCategory?.labelTa,
      hasTamil,
      hasEnglish,
      contentLengthTa,
      contentLengthEn,
      locationSource,
      trustScore,
    });

    handleComposerClose('submit_success');
  };

  const renderComposerFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="composer-category">
          {t('feed.composer.categoryLabel', 'Category')}
        </Label>
        <Select value={composerCategory} onValueChange={setComposerCategory}>
          <SelectTrigger id="composer-category">
            <SelectValue placeholder={t('feed.composer.categoryPlaceholder', 'Select a category')} />
          </SelectTrigger>
          <SelectContent>
            {composerCategoryOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-maroon">{option.labelEn}</span>
                  <span className="text-xs text-slate-500">{option.labelTa}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="composer-content-ta">
          {t('feed.composer.tamilLabel', 'Tamil message')}
        </Label>
        <Textarea
          id="composer-content-ta"
          placeholder={t('feed.composer.tamilPlaceholder', 'என்ன நடக்குது? உங்கள் தகவலை பகிரவும்...')}
          value={composerContentTa}
          onChange={event => setComposerContentTa(event.target.value)}
          onKeyDown={event => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              handleSubmitPost();
            }
          }}
          rows={4}
        />
        <p className="text-xs text-slate-500">
          {t('feed.composer.tamilHelper', 'தமிழில் பகிர்ந்தால் நம்ம அண்டை வீட்டுக்காரர்கள் விரைவாக புரிந்து கொள்வார்கள்.')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="composer-content-en">
          {t('feed.composer.englishLabel', 'English message')}
        </Label>
        <Textarea
          id="composer-content-en"
          placeholder={t('feed.composer.englishPlaceholder', 'Share a quick summary in English for everyone else...')}
          value={composerContentEn}
          onChange={event => setComposerContentEn(event.target.value)}
          onKeyDown={event => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              handleSubmitPost();
            }
          }}
          rows={4}
        />
        <p className="text-xs text-slate-500">
          {t('feed.composer.englishHelper', 'Optional but helpful for multilingual neighbors.')}
        </p>
      </div>
    </div>
  );

  const handleCommentButtonClick = (
    postId: string,
    source: 'post_action' | 'preview_reply' | 'preview_view_all' = 'post_action',
  ) => {
    commentCloseReasonRef.current = null;
    const targetPost = posts.find(post => post.id === postId) || null;
    setSelectedPostIdForComments(postId);
    resetCommentDrafts();

    trackCommunityEvent('comments_panel_opened', {
      postId,
      source,
      commentCount: targetPost?.comments.length ?? 0,
      hasExistingComments: Boolean(targetPost && targetPost.comments.length > 0),
    });
  };

  const closeCommentsPanel = (reason: 'close_button' | 'submit_success' = 'close_button') => {
    if (!selectedPostIdForComments) {
      return;
    }

    commentCloseReasonRef.current = reason;

    const postId = selectedPostIdForComments;
    const commentCount = selectedPostForComments?.comments.length ?? null;

    trackCommunityEvent('comments_panel_closed', {
      postId,
      reason,
      commentCount,
    });

    setSelectedPostIdForComments(null);
    resetCommentDrafts();
  };

  const handleCommentsOpenChange = (open: boolean) => {
    if (!open && isCommentPanelOpen) {
      if (commentCloseReasonRef.current) {
        commentCloseReasonRef.current = null;
      } else if (selectedPostForComments) {
        trackCommunityEvent('comments_panel_closed', {
          postId: selectedPostForComments.id,
          reason: 'overlay_dismiss',
          commentCount: selectedPostForComments.comments.length,
        });
        setSelectedPostIdForComments(null);
        resetCommentDrafts();
        commentCloseReasonRef.current = null;
      } else {
        setSelectedPostIdForComments(null);
        resetCommentDrafts();
      }
    }
  };

  const handleSubmitComment = () => {
    if (!selectedPostForComments || !canSubmitComment || isSubmittingComment) {
      return;
    }

    setIsSubmittingComment(true);
    const commentCountBefore = selectedPostForComments.comments.length;
    const hasTamil = commentTextTa.trim().length > 0;
    const hasEnglish = commentTextEn.trim().length > 0;
    const commentLengthTa = commentTextTa.trim().length;
    const commentLengthEn = commentTextEn.trim().length;

    try {
      addComment(selectedPostForComments.id, {
        author: {
          id: currentUser?.id ?? 'guest-user',
          name: currentUser?.name ?? 'Community Member'
        },
        messageTa: commentTextTa || undefined,
        messageEn: commentTextEn || undefined
      });

      setCommentTextTa('');
      setCommentTextEn('');

      trackCommunityEvent('comment_submitted', {
        postId: selectedPostForComments.id,
        hasTamil,
        hasEnglish,
        commentLengthTa,
        commentLengthEn,
        commentCountBefore,
        source: isMobileViewport ? 'mobile_panel' : 'dialog',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const togglePostExpanded = (postId: string) => {
    setExpandedPostIds(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <>
  <Dialog open={isComposerOpen && !isMobileViewport} onOpenChange={handleComposerOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('feed.composer.title', 'Share with your neighborhood')}</DialogTitle>
            <DialogDescription>
              {t('feed.composer.subtitle', 'Add bilingual details to help every neighbor stay informed.')}
            </DialogDescription>
          </DialogHeader>
          {renderComposerFormFields()}
          <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleComposerCancel} disabled={isSubmittingPost}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSubmitPost} disabled={!canSubmitPost || isSubmittingPost}>
              {isSubmittingPost ? t('common.loading', 'Loading...') : t('feed.share', 'Share')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  <Drawer open={isComposerOpen && isMobileViewport} onOpenChange={handleComposerOpenChange}>
        <DrawerContent className="bg-ivory">
          <DrawerHeader>
            <DrawerTitle>{t('feed.composer.title', 'Share with your neighborhood')}</DrawerTitle>
            <p className="text-xs text-slate-600">
              {t('feed.composer.mobileSubtitle', 'Type in Tamil or English — we\'ll share it with your nearby neighbors.')}
            </p>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {renderComposerFormFields()}
          </div>
          <DrawerFooter className="gap-2 border-t border-orange-200 bg-white/60">
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleComposerCancel} disabled={isSubmittingPost}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </DrawerClose>
            <Button onClick={handleSubmitPost} disabled={!canSubmitPost || isSubmittingPost}>
              {isSubmittingPost ? t('common.loading', 'Loading...') : t('feed.share', 'Share')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={isCommentPanelOpen && !isMobileViewport} onOpenChange={handleCommentsOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('feed.comments.title', 'Community comments')}</DialogTitle>
            {selectedPostForComments && (
              <DialogDescription>
                {selectedPostForComments.user.name} • {formatLocationLabel(selectedPostForComments)}
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedPostForComments ? (
            <div className="space-y-4">
              <Card className="bg-ivory border border-orange-200/60 shadow-sm">
                <p className="text-sm text-slate-800 whitespace-pre-line">
                  {getPostContent(selectedPostForComments)}
                </p>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-maroon">
                    {t('feed.comments.thread', 'Neighbor responses')}
                  </h4>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                    {selectedPostForComments.comments.length}
                  </Badge>
                </div>
                <ScrollArea className="max-h-60 pr-2">
                  <div className="space-y-3 py-1">
                    {selectedPostForComments.comments.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {t('feed.comments.empty', 'No comments yet. Start the conversation!')}
                      </p>
                    ) : (
                      selectedPostForComments.comments.map(comment => {
                        const commentInitials = getInitials(comment.author.name);

                        return (
                          <div key={comment.id} className="flex items-start gap-3 bg-white/80 border border-orange-100 rounded-lg p-2">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                {commentInitials}
                              </div>
                            </Avatar>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-maroon truncate">{comment.author.name}</p>
                                <span className="text-[10px] text-slate-400">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              {comment.messageTa && (
                                <p className="text-sm text-slate-800 whitespace-pre-line">
                                  {comment.messageTa}
                                </p>
                              )}
                              {comment.messageEn && (
                                <p className="text-xs text-slate-500 whitespace-pre-line">
                                  {comment.messageEn}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="comment-ta">
                    {t('feed.comments.tamilLabel', 'Reply in Tamil')}
                  </Label>
                  <Textarea
                    id="comment-ta"
                    value={commentTextTa}
                    onChange={event => setCommentTextTa(event.target.value)}
                    placeholder={t('feed.comments.tamilPlaceholder', 'உங்கள் பதிலை இங்கே எழுதவும்...')}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment-en">
                    {t('feed.comments.englishLabel', 'Reply in English')}
                  </Label>
                  <Textarea
                    id="comment-en"
                    value={commentTextEn}
                    onChange={event => setCommentTextEn(event.target.value)}
                    placeholder={t('feed.comments.englishPlaceholder', 'Add an English version (optional)...')}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {t('feed.comments.noPost', 'Select a post to view community replies.')}
            </p>
          )}
          <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:items-center gap-2 pt-4">
            <Button variant="outline" onClick={() => closeCommentsPanel('close_button')}>
              {t('common.close', 'Close')}
            </Button>
            <Button
              onClick={handleSubmitComment}
              disabled={!canSubmitComment || isSubmittingComment || !selectedPostForComments}
            >
              {isSubmittingComment ? t('common.loading', 'Loading...') : t('feed.comments.add', 'Add comment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={isCommentPanelOpen && isMobileViewport} onOpenChange={handleCommentsOpenChange}>
        <DrawerContent className="bg-ivory">
          <DrawerHeader>
            <DrawerTitle>{t('feed.comments.title', 'Community comments')}</DrawerTitle>
            {selectedPostForComments && (
              <p className="text-xs text-slate-600">
                {selectedPostForComments.user.name} • {formatLocationLabel(selectedPostForComments)}
              </p>
            )}
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4">
            {selectedPostForComments ? (
              <>
                <Card className="bg-white/80 border border-orange-200/60 shadow-sm">
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {getPostContent(selectedPostForComments)}
                  </p>
                </Card>
                <ScrollArea className="max-h-56 pr-2">
                  <div className="space-y-3 py-1">
                    {selectedPostForComments.comments.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {t('feed.comments.empty', 'No comments yet. Start the conversation!')}
                      </p>
                    ) : (
                      selectedPostForComments.comments.map(comment => {
                        const commentInitials = getInitials(comment.author.name);

                        return (
                          <div key={comment.id} className="flex items-start gap-3 bg-white border border-orange-100 rounded-lg p-2">
                            <Avatar className="w-7 h-7 flex-shrink-0">
                              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                {commentInitials}
                              </div>
                            </Avatar>
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-maroon truncate">{comment.author.name}</p>
                                <span className="text-[10px] text-slate-400">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              {comment.messageTa && (
                                <p className="text-sm text-slate-800 whitespace-pre-line">
                                  {comment.messageTa}
                                </p>
                              )}
                              {comment.messageEn && (
                                <p className="text-xs text-slate-500 whitespace-pre-line">
                                  {comment.messageEn}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="comment-ta-mobile">
                      {t('feed.comments.tamilLabel', 'Reply in Tamil')}
                    </Label>
                    <Textarea
                      id="comment-ta-mobile"
                      value={commentTextTa}
                      onChange={event => setCommentTextTa(event.target.value)}
                      placeholder={t('feed.comments.tamilPlaceholder', 'உங்கள் பதிலை இங்கே எழுதவும்...')}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment-en-mobile">
                      {t('feed.comments.englishLabel', 'Reply in English')}
                    </Label>
                    <Textarea
                      id="comment-en-mobile"
                      value={commentTextEn}
                      onChange={event => setCommentTextEn(event.target.value)}
                      placeholder={t('feed.comments.englishPlaceholder', 'Add an English version (optional)...')}
                      rows={3}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                {t('feed.comments.noPost', 'Select a post to view community replies.')}
              </p>
            )}
          </div>
          <DrawerFooter className="gap-2 border-t border-orange-200 bg-white/60">
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => closeCommentsPanel('close_button')}>
                {t('common.close', 'Close')}
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSubmitComment}
              disabled={!canSubmitComment || isSubmittingComment || !selectedPostForComments}
            >
              {isSubmittingComment ? t('common.loading', 'Loading...') : t('feed.comments.add', 'Add comment')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="bg-gradient-to-b from-orange-50 to-yellow-25 min-h-screen relative">
      {/* Community scenes background */}
      <div className="fixed inset-0 opacity-15 md:opacity-10 pointer-events-none">
        <ImageWithFallback
          src={communityScenes}
          alt="Chennai Community Scenes"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Header */}
      <header className="kolam-pattern relative overflow-hidden rounded-b-[2rem] bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-8">
        {/* Traditional pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-white">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {t('feed.title', 'Community Feed')}
                </h1>
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-orange-50">
                  {t('feed.title.ta', 'சமூக பகிர்வு')}
                </span>
              </div>
              <p className="text-sm text-orange-100 md:text-base">
                {t(
                  'feed.hero.tagline',
                  'Hyperlocal stories, trusted updates, and festival vibes from your verified neighbors.'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-orange-50">
                <MapPin className="h-4 w-4 text-white" aria-hidden={true} />
                <span className="font-medium">{locationLabel}</span>
                {locationCommunityName ? (
                  <>
                    <span aria-hidden="true" className="hidden sm:inline">
                      •
                    </span>
                    <span className="text-orange-100/90">{locationCommunityName}</span>
                  </>
                ) : null}
                {activeLocation?.verified ? (
                  <span className="flex items-center gap-1 text-xs text-green-100">
                    <Shield className="h-3 w-3" aria-hidden={true} />
                    {t('feed.hero.verifiedArea', 'Verified area')}
                  </span>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-medium text-orange-50 transition hover:bg-white/20 hover:text-white"
                  onClick={() => setLocationModalOpen(true)}
                >
                  <Navigation className="mr-1 h-3 w-3" aria-hidden={true} />
                  {t('feed.actions.changeLocation', 'Update location')}
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-3 self-start rounded-2xl border border-white/20 bg-white/10 p-3 shadow-sm shadow-orange-900/10 backdrop-blur">
              <LanguageToggle />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <IllustratedIcon
                  src={ChennaiIcons.family}
                  alt={t('feed.hero.profileAlt', 'Your neighborhood crew')}
                  size="md"
                  className="border-2 border-white/30"
                />
              </div>
            </div>
          </div>

          <dl
            className="grid gap-3 text-orange-50 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={t('feed.hero.snapshot', 'Community snapshot')}
          >
            {heroStats.map((stat) => (
              <div
                key={stat.key}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm shadow-sm shadow-orange-900/10"
              >
                <dt className="text-[11px] uppercase tracking-wide text-orange-100/90">{stat.label}</dt>
                <dd className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
                  {stat.icon}
                  {stat.value}
                </dd>
                <p className="mt-1 text-xs text-orange-100/80">{stat.helper}</p>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2">
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-xs text-white backdrop-blur-sm"
            >
              {connectionStatus === 'connected' ? (
                lastUpdate ? (
                  <span>
                    {t('feed.status.updated', 'Last synced')} • {formatRelativeTime(lastUpdate)}
                  </span>
                ) : (
                  <span>{t('feed.status.live', 'Live updates are streaming in real-time.')}</span>
                )
              ) : connectionStatus === 'connecting' ? (
                <span>{t('feed.status.connecting', 'Reconnecting to community updates...')}</span>
              ) : connectionStatus === 'disconnected' ? (
                <span>
                  {t(
                    'feed.status.disconnected',
                    "You're offline. Showing recent posts while we retry..."
                  )}
                </span>
              ) : (
                <span>{t('feed.status.error', "Trouble reaching the community feed. We'll keep trying!")}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chennai Quick Actions */}
      <section aria-labelledby="community-quick-actions" className="px-6 py-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="community-quick-actions" className="text-base font-semibold text-maroon">
              {t('feed.quickActions.title', 'Quick actions for you')}
            </h2>
            <p className="text-sm text-slate-600">
              {t('feed.quickActions.subtitle', 'Stay ahead with Chennai essentials in one tap.')}
            </p>
          </div>
          <Badge className="self-start border-orange-200 bg-orange-100 text-xs text-orange-700">
            {quickActionItems.length} {t('feed.quickActions.shortcutLabel', 'shortcuts')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickActionItems.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              className="flex h-auto flex-col items-start gap-2 rounded-2xl border-orange-200 bg-white/70 px-3 py-4 text-left transition hover:-translate-y-0.5 hover:bg-orange-50"
              onClick={action.onSelect}
              aria-label={`${action.label} – ${action.description}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  {action.media.type === 'video' ? (
                    <video
                      src={action.media.source}
                      className="h-12 w-12 rounded-lg object-cover"
                      muted
                      loop
                      playsInline
                      preload="none"
                      poster={action.media.poster}
                      aria-hidden={true}
                    />
                  ) : (
                    <IllustratedIcon
                      src={action.media.source}
                      alt={action.label}
                      size="sm"
                      className="h-8 w-8"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-maroon truncate">{action.label}</p>
                  <p className="text-xs text-slate-500 truncate">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* What's happening card - Light ivory background */}
        <Card className="mt-6 rounded-2xl border-2 border-turmeric/60 bg-ivory p-4 text-sm shadow-md shadow-orange-200/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500">
                  <span className="text-white text-sm">You</span>
                </div>
              </Avatar>
              <div>
                <p className="text-xs uppercase tracking-wide text-maroon/70">
                  {t('feed.composer.prompt', 'Ready to share?')}
                </p>
                <p className="text-sm font-semibold text-maroon">
                  {t('feed.composer.promptSubtitle', 'Your neighbors trust your updates.')}
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <Button
                variant="outline"
                className="h-auto min-h-[52px] w-full justify-between gap-3 break-words border-turmeric bg-paper px-3 py-3 text-left text-sm text-maroon hover:bg-orange-50"
                onClick={() => handleComposerOpen('cta_card')}
                aria-label={t('feed.composer.open', 'Open post composer')}
              >
                <span className="flex-1 text-left">
                  {t('feed.whatsHappening', "What's happening in your area?")}
                </span>
                <span className="hidden text-xs font-semibold text-orange-600 sm:inline">
                  {t('feed.composer.openCTA', 'Compose')}
                </span>
              </Button>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="text-slate-500">
                  {t('feed.composer.helperPrompt', 'Tell neighbors about')}
                </span>
                {composerHelperTopics.map(topic => (
                  <Badge
                    key={topic}
                    variant="outline"
                    className="rounded-full border-orange-200 bg-white/60 px-2 py-0.5 text-[11px] text-orange-700"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>



      {/* Community posts */}
      <div className="px-6 space-y-4 pb-28">
        {feedPosts.length === 0 ? (
          connectionStatus === 'connecting' ? (
            <Card className="p-4 bg-ivory border-2 border-dashed border-orange-200 text-center text-sm text-slate-600">
              <p className="font-medium text-maroon mb-1">{t('feed.loading.title', 'Fetching neighborhood updates...')}</p>
              <p>{t('feed.loading.subtitle', 'Hold on while we sync the latest info from your area.')}</p>
            </Card>
          ) : (
            <Card className="p-4 bg-ivory border-2 border-dashed border-orange-200 text-center text-sm text-slate-600">
              <p className="font-medium text-maroon mb-1">{t('feed.empty.title', 'No neighborhood updates yet')}</p>
              <p>{t('feed.empty.subtitle', 'Be the first to share what\'s happening around you!')}</p>
            </Card>
          )
        ) : (
          feedPosts.map(post => {
            const initials = getInitials(post.user.name);

            const liked = isPostLikedByCurrentUser(post);
            const content = getPostContent(post);
            const isExpanded = Boolean(expandedPostIds[post.id]);
            const shouldTruncate = content.length > 220;
            const displayContent = shouldTruncate && !isExpanded
              ? `${content.slice(0, 220).trimEnd()}…`
              : content;
            const previewComments = post.comments.slice(0, 2);
            const remainingComments = Math.max(post.comments.length - previewComments.length, 0);

            return (
              <Card key={post.id} className="p-3 bg-ivory backdrop-blur-md border-2 border-turmeric/60 shadow-md shadow-orange-200/60 rounded-xl text-sm">
                {/* Post header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">{initials}</span>
                        </div>
                      </Avatar>
                      {post.user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-maroon truncate">{post.user.name}</h3>
                        {post.user.isVerified && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1 py-0 flex-shrink-0">
                            பட்டியல்
                          </Badge>
                        )}
                        {post.user.trustScore && (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-1 py-0 flex-shrink-0">
                            {post.user.trustScore} ⭐
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{formatLocationLabel(post)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="whitespace-nowrap">{formatRelativeTime(post.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {getPostBadge(post)}
                  </div>
                </div>

                {/* Post content */}
                <p className="text-slate-800 mb-2 leading-normal break-words text-sm whitespace-pre-line">
                  {displayContent}
                </p>
                {shouldTruncate && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    onClick={() => togglePostExpanded(post.id)}
                  >
                    {isExpanded
                      ? t('feed.readLess', 'Read less')
                      : t('feed.readMore', 'Read more')}
                  </button>
                )}

                {/* Post media */}
                {post.media && post.media.length > 0 && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={post.media[0].url}
                      alt={post.media[0].alt || 'Post media'}
                      className="w-full h-36 md:h-48 object-cover"
                    />
                  </div>
                )}

                {previewComments.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-xl border border-orange-100 bg-white/70 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        {t('feed.comments.previewTitle', 'What neighbors said')}
                      </p>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px]">
                        {post.comments.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {previewComments.map(comment => {
                        const commentInitials = getInitials(comment.author.name);
                        return (
                          <div key={comment.id} className="flex items-start gap-2 rounded-lg bg-white/90 p-2">
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xs text-white">
                                {commentInitials}
                              </div>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-xs font-semibold text-maroon">
                                  {comment.author.name}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  {formatRelativeTime(comment.createdAt)}
                                </span>
                              </div>
                              {comment.messageTa && (
                                <p className="whitespace-pre-line text-xs text-slate-700">
                                  {comment.messageTa.length > 120
                                    ? `${comment.messageTa.slice(0, 120).trimEnd()}…`
                                    : comment.messageTa}
                                </p>
                              )}
                              {comment.messageEn && (
                                <p className="whitespace-pre-line text-[11px] text-slate-500">
                                  {comment.messageEn.length > 120
                                    ? `${comment.messageEn.slice(0, 120).trimEnd()}…`
                                    : comment.messageEn}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        className="font-semibold text-orange-600 hover:text-orange-700"
                        onClick={() => handleCommentButtonClick(post.id, 'preview_reply')}
                      >
                        {t('feed.comments.addResponse', 'Add your reply')}
                      </button>
                      {remainingComments > 0 && (
                        <button
                          type="button"
                          className="text-orange-500 hover:text-orange-600"
                          onClick={() => handleCommentButtonClick(post.id, 'preview_view_all')}
                        >
                          {t('feed.comments.viewAllInline', 'View all')} {post.comments.length}{' '}
                          {t('feed.comments.commentsLabel', 'comments')}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Post actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-2 text-sm transition-colors',
                        liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      )}
                      onClick={() => handleLike(post)}
                    >
                      <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
                      <span>{post.reactions.likes}</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                      onClick={() => handleCommentButtonClick(post.id, 'post_action')}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
      </div>
      {!isComposerOpen && !showLiveInfo && (
        <Button
          type="button"
          variant="default"
          className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/40 transition hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-500"
          onClick={() => handleComposerOpen('fab')}
          aria-label={t('feed.composer.fabLabel', 'Share an update')}
        >
          <Plus className="h-6 w-6" aria-hidden={true} />
        </Button>
      )}

      {showLiveInfo && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label={t('feed.liveInfo.closeOverlay', 'Close live info overlay')}
            onClick={() => closeLiveInfo('backdrop')}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('feed.liveInfo.ariaLabel', 'Live information and alerts')}
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-ivory shadow-2xl transition-transform duration-300 ease-out md:rounded-l-3xl md:border-l md:border-orange-200"
            tabIndex={-1}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow hover:bg-white"
              onClick={() => closeLiveInfo('close_button')}
              aria-label={t('feed.liveInfo.close', 'Close live info')}
            >
              <X className="h-4 w-4" aria-hidden={true} />
            </button>
            <div className="flex-1 overflow-y-auto pt-6">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    {t('feed.liveInfo.loading', 'Loading live information...')}
                  </div>
                }
              >
                <LiveInfoPageLazy
                  userLocation={activeLocation}
                  onBack={() => closeLiveInfo('back_action')}
                  className="!min-h-full pb-20"
                />
              </Suspense>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
