import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../services/LanguageService';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { CustomIcon, ChennaiCustomIcons } from './CustomIcons';
import { useLocation } from '../services/LocationService';
import { useExternalData } from '../services/ExternalDataService';
import { PostService, Post } from '../services/PostService';
import { AiService } from '../services/AiService';
import { useAuth } from './auth/SupabaseAuthProvider';
import { FeedScreenBackground, StaggerContainer, StaggerItem } from './BackgroundAnimations';
import SEO from './SEO';

import { toast } from 'sonner';
import { PostSkeleton } from './SkeletonLoaders';
import AutoShareCard from './AutoShareCard';
import FoodHuntCard from './FoodHuntCard';
import TransportCard from './TransportCard';
import {
  AnimatedPostCard,
  AnimatedLikeButton,
  FloatingActionButton,
  PullToRefresh,
  StoryHighlight,
  AnimatedCommentButton,
  AnimatedShareButton,
  PostImageGallery,
} from './FeedAnimationComponents';
import { WeatherData } from '../services/WeatherService';
import { LiveDataService } from '../services/LiveDataService';

interface CommunityFeedProps {
  userLocation?: any;
}

export function CommunityFeed({ userLocation }: CommunityFeedProps) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const { currentLocation } = useLocation();
  const { } = useExternalData();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // SEO Data
  const seoData = {
    title: "Chennai Community Feed - Namma Ooru Updates",
    description: "Stay updated with the latest happenings in Chennai. Connect with locals, share news, and explore the city's vibrant community.",
    canonical: "https://chennai-community.app/home",
    ogType: "website" as const,
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [liveUpdate, setLiveUpdate] = useState<string>('');

  // Comments State
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // AI Summarization State
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<Record<string, boolean>>({});

  // Use location from context if available, otherwise use prop
  const activeLocation = currentLocation || userLocation;
  const activePincode = activeLocation?.pincode || '600004';

  const [activeView, setActiveView] = useState<'feed' | 'auto-share' | 'food-hunt' | 'commute'>('feed');
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, string>>({});

  // Translate posts when language changes
  useEffect(() => {
    const translatePosts = async () => {
      if (language === 'en') {
        setTranslatedPosts({});
        return;
      }

      const newTranslations: Record<string, string> = {};
      // Translate visible posts
      await Promise.all(posts.map(async (post) => {
        try {
          // Skip if already translated (optimization could be better but this is simple)
          const translated = await AiService.translate(post.content, language);
          newTranslations[post.id] = translated;
        } catch (error) {
          console.error(`Failed to translate post ${post.id}:`, error);
        }
      }));

      setTranslatedPosts(newTranslations);
    };

    translatePosts();
  }, [language, posts]);

  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});

  // Translate comments when loaded or language changes
  useEffect(() => {
    const translateComments = async () => {
      if (language === 'en' || comments.length === 0) {
        setTranslatedComments({});
        return;
      }

      const newTranslations: Record<string, string> = {};
      await Promise.all(comments.map(async (comment) => {
        try {
          const translated = await AiService.translate(comment.content, language);
          newTranslations[comment.id] = translated;
        } catch (error) {
          console.error(`Failed to translate comment ${comment.id}:`, error);
        }
      }));

      setTranslatedComments(newTranslations);
    };

    translateComments();
  }, [language, comments]);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);

  // Story highlights data
  const storyHighlights: {
    id: number;
    image?: string;
    icon?: keyof typeof ChennaiCustomIcons;
    title: string;
    translationKey: string;
    isNew: boolean;
  }[] = [
      { id: 1, image: '/assets/icon_auto.png', title: 'Auto Share', translationKey: 'story.auto', isNew: true },
      { id: 2, image: '/assets/icon_food.png', title: 'Food Hunt', translationKey: 'story.food', isNew: true },
      { id: 3, image: '/assets/icon_bus.png', title: 'Commute', translationKey: 'story.commute', isNew: true },
      { id: 4, image: '/assets/hero_welcome.png', title: 'Chennai Gethu', translationKey: 'story.gethu', isNew: false },
      { id: 5, image: '/assets/icon_info.png', title: 'Info', translationKey: 'story.info', isNew: false },
    ];

  const [feedFilter, setFeedFilter] = useState<'all' | 'local'>('all');

  // Fetch posts and weather
  useEffect(() => {
    fetchPosts();
    fetchWeather();
  }, [activeLocation, feedFilter]); // Refetch when filter changes

  const handleStoryClick = async (story: typeof storyHighlights[0]) => {
    if (story.title === 'Info') {
      setIsInfoDialogOpen(true);
      if (!liveUpdate) {
        setLoadingInfo(true);
        const update = await AiService.getLiveUpdates(activeLocation?.area || 'Chennai');
        setLiveUpdate(update);
        setLoadingInfo(false);
      }
      return;
    } else if (story.title === 'Auto Share') {
      setActiveView('auto-share');
    } else if (story.title === 'Food Hunt') {
      setActiveView('food-hunt');
    } else if (story.title === 'Commute') {
      setActiveView('commute');
    } else if (story.title === 'Chennai Gethu') {
      window.location.href = '/chennai-gethu';
    } else {
      toast.info(`${t(story.translationKey)} coming soon!`);
    }
  };

  const fetchWeather = async () => {
    const area = activeLocation?.area || 'Chennai';

    // Timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Weather fetch timeout')), 8000)
    );

    try {
      // Race between fetch and timeout
      const data = await Promise.race([
        LiveDataService.getWeather(area),
        timeoutPromise
      ]) as any;

      // Map condition to emoji
      let icon = '☀️';
      const condition = (data.condition || '').toLowerCase();
      if (condition.includes('cloud')) icon = '☁️';
      if (condition.includes('rain') || condition.includes('drizzle')) icon = '🌧️';
      if (condition.includes('storm') || condition.includes('thunder')) icon = '⛈️';
      if (condition.includes('snow')) icon = '❄️';
      if (condition.includes('fog') || condition.includes('mist')) icon = '🌫️';
      if (condition.includes('clear')) icon = '☀️';
      if (condition.includes('night')) icon = '🌙';

      setWeather({
        temperature: data.temp || 30,
        humidity: data.humidity || 70,
        windSpeed: 0,
        condition: data.condition || 'Sunny',
        icon: icon
      });
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Fallback to default weather on error/timeout
      setWeather({
        temperature: 30,
        humidity: 75,
        windSpeed: 0,
        condition: 'Sunny',
        icon: '☀️'
      });
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Pass the area to filter posts by location if 'local' is selected
      const area = feedFilter === 'local' ? activeLocation?.area : undefined;
      const data = await PostService.getPosts(area);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };



  const handleRefresh = async () => {
    await fetchPosts();
    toast.success('Feed refreshed! 🎉');
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Please sign in to post!');
      return;
    }

    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const newPost = await PostService.createPost(
        newPostContent,
        'General',
        activeLocation?.area || 'Chennai',
        user.id
      );

      if (newPost) {
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setIsPostDialogOpen(false);
        toast.success('Post created successfully!');
      }
    } catch (error) {
      console.error('Failed to create post', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error('Please sign in to like posts!');
      return;
    }

    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: (p.is_liked_by_user ? p.likes - 1 : p.likes + 1),
          is_liked_by_user: !p.is_liked_by_user
        };
      }
      return p;
    }));

    try {
      await PostService.likePost(postId, user.id);
    } catch (error) {
      console.error('Failed to toggle like', error);
      // Revert on error
      fetchPosts();
    }
  };

  const openComments = async (postId: string) => {
    setSelectedPostId(postId);
    setIsCommentsOpen(true);
    setLoadingComments(true);
    try {
      const data = await PostService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedPostId || !newComment.trim()) return;

    try {
      const comment = await PostService.addComment(selectedPostId, user.id, newComment);
      if (comment) {
        setComments([...comments, comment]);
        setNewComment('');

        // Update comment count in post list
        setPosts(posts.map(p =>
          p.id === selectedPostId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    }
  };

  const handleSummarize = async (postId: string, content: string) => {
    if (summaries[postId]) return; // Already summarized

    setSummarizing(prev => ({ ...prev, [postId]: true }));
    try {
      const summary = await AiService.summarizePost(content);
      setSummaries(prev => ({ ...prev, [postId]: summary.content }));
    } catch (error) {
      console.error('Failed to summarize', error);
      toast.error('Failed to summarize post');
    } finally {
      setSummarizing(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: `Post by ${post.profiles?.full_name}`,
        text: post.content,
        url: window.location.href
      });
    } catch (error) {
      console.log('Share cancelled or not supported');
      toast.info('Link copied to clipboard!');
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-yellow-25 min-h-screen relative overflow-hidden">
      <SEO {...seoData} />
      {/* ... (existing background and header) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FeedScreenBackground />
      </div>

      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/kolam-pattern.png')] opacity-10 mix-blend-overlay"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                  {t('app.name')}
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white drop-shadow-md flex items-center gap-2">
                <img src="/assets/app_logo.png" alt="Logo" className="w-8 h-8 rounded-full border-2 border-white/20" />
                {t('app.title')} <span className="animate-pulse">🧡</span>
              </h1>
            </div>
            <LanguageToggle />
          </div>

          {/* Location & Weather */}
          <div className="flex items-center gap-3 text-orange-50 bg-black/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              <CustomIcon icon="LocationPin" className="w-4 h-4 text-yellow-300" />
              <span className="font-medium text-sm">{activeLocation?.area || 'Chennai'}</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5">
              {weather ? (
                <>
                  <span className="text-lg">{weather.icon}</span>
                  <span className="font-medium text-sm">{weather.temperature}°C</span>
                </>
              ) : (
                <span className="text-xs opacity-70">{t('weather.loading')}</span>
              )}
            </div>
          </div>

          {/* Feed Filter Toggle */}
          <div className="flex justify-center mt-4 relative z-10">
            <div className="bg-black/20 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/10">
              <button
                onClick={() => setFeedFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${feedFilter === 'all'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                {t('feed.filter.all')}
              </button>
              <button
                onClick={() => setFeedFilter('local')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${feedFilter === 'local'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-white/80 hover:bg-white/10'
                  }`}
              >
                {t('feed.filter.local')}
              </button>
            </div>
          </div>
        </div>

        {/* Stories / Highlights */}
        <div className="px-6 mt-6 mb-2">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {storyHighlights.map((story) => (
              <StoryHighlight
                key={story.id}
                {...story}
                title={t(story.translationKey)}
                onClick={() => handleStoryClick(story)}
              />
            ))}
          </div>
        </div>

        {activeView === 'feed' && (
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="px-4 space-y-6 min-h-[50vh]">
              {loading ? (
                <div className="space-y-4">
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : (
                <>
                  {/* Posts Feed */}
                  <StaggerContainer>
                    <AnimatePresence>
                      {posts.map((post) => (
                        <StaggerItem key={post.id}>
                          <AnimatedPostCard>
                            <Card className="overflow-hidden border-none shadow-lg bg-white/90 backdrop-blur-sm">
                              {/* Post Header */}
                              <div className="p-4 flex items-center gap-3">
                                <Avatar className="w-10 h-10 border-2 border-orange-100">
                                  {post.profiles?.avatar_url ? (
                                    <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold">
                                      {post.profiles?.full_name?.[0] || 'U'}
                                    </div>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">{post.profiles?.full_name || 'Anonymous'}</h3>
                                    <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100">
                                      {post.category}
                                    </Badge>
                                    {post.area && (
                                      <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                        <CustomIcon icon="LocationPin" className="w-3 h-3" />
                                        {post.area}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Post Content */}
                              <div className="px-4 pb-2">
                                <p className="text-gray-800 leading-relaxed text-[15px]">
                                  {translatedPosts[post.id] || post.content}
                                </p>

                                {/* AI Summary */}
                                {summaries[post.id] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-800"
                                  >
                                    <div className="flex items-center gap-2 mb-1 font-bold text-xs uppercase tracking-wider">
                                      <CustomIcon icon="Sparkles" className="w-3 h-3" />
                                      {t('ai.summary')}
                                    </div>
                                    {summaries[post.id]}
                                  </motion.div>
                                )}
                              </div>

                              {/* Post Image */}
                              {post.image_url && (
                                <div className="mt-2">
                                  <PostImageGallery images={[post.image_url]} />
                                </div>
                              )}

                              {/* Post Actions */}
                              <div className="flex items-center justify-between p-3 border-t border-gray-100 bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                  <AnimatedLikeButton
                                    isLiked={post.is_liked_by_user || false}
                                    count={post.likes}
                                    onClick={() => handleLike(post.id)}
                                    label={t('feed.like_action')}
                                  />
                                  <AnimatedCommentButton
                                    count={post.comments_count}
                                    onClick={() => openComments(post.id)}
                                  />
                                  <motion.button
                                    className="flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-colors"
                                    onClick={() => handleSummarize(post.id, post.content)}
                                    disabled={summarizing[post.id]}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {summarizing[post.id] ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4" />
                                    )}
                                    <span className="text-sm hidden sm:inline font-medium">{t('ai.summarize')}</span>
                                  </motion.button>
                                </div>
                                <AnimatedShareButton onClick={() => handleShare(post)} />
                              </div>
                            </Card>
                          </AnimatedPostCard>
                        </StaggerItem>
                      ))}
                    </AnimatePresence>
                  </StaggerContainer>
                </>
              )}
            </div>
          </PullToRefresh>
        )}

        {activeView === 'auto-share' && (
          <div className="px-4 mt-4 min-h-[50vh]">
            <Button
              variant="ghost"
              onClick={() => setActiveView('feed')}
              className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('feed.back')}
            </Button>
            <AutoShareCard pincode={activePincode} />
          </div>
        )}

        {activeView === 'food-hunt' && (
          <div className="px-4 mt-4 min-h-[50vh]">
            <Button
              variant="ghost"
              onClick={() => setActiveView('feed')}
              className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('feed.back')}
            </Button>
            <FoodHuntCard pincode={activePincode} />
          </div>
        )}

        {activeView === 'commute' && (
          <div className="px-4 mt-4 min-h-[50vh]">
            <Button
              variant="ghost"
              onClick={() => setActiveView('feed')}
              className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('feed.back')}
            </Button>
            <TransportCard pincode={activePincode} />
          </div>
        )}

        {/* Floating Action Button - Only show on feed view */}
        {activeView === 'feed' && (
          <FloatingActionButton onClick={() => setIsPostDialogOpen(true)} />
        )}

        {/* Create Post Dialog */}
        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
          {/* ... (existing dialog content) */}
          <DialogContent className="sm:max-w-[425px] bg-[#FFFFF0] border-orange-200 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-[#4B1E1E] flex items-center gap-2 text-xl font-bold">
                <CustomIcon icon="Sparkles" className="w-6 h-6 text-orange-500" />
                {t('post.create.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder={t('post.create.placeholder')}
                className="min-h-[120px] border-orange-200 focus-visible:ring-orange-400 bg-white rounded-xl resize-none"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPostDialogOpen(false)}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl"
                >
                  {t('post.create.cancel')}
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-xl shadow-lg shadow-orange-200"
                    onClick={handleCreatePost}
                    disabled={isPosting || !newPostContent.trim()}
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('post.create.posting')}
                      </>
                    ) : (
                      <>
                        <CustomIcon icon="Sparkles" className="w-4 h-4 mr-2 text-white" />
                        {t('post.create.submit')}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comments Dialog */}
        <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
          <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 gap-0 bg-[#fffdf5] overflow-hidden rounded-2xl">
            <div className="p-4 border-b border-orange-100 bg-white/50 backdrop-blur-sm">
              <DialogTitle className="flex items-center gap-2">
                <span className="text-xl">💬</span> {t('comments.title')}
              </DialogTitle>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  {t('comments.empty')}
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 border border-orange-100">
                      {comment.profiles?.avatar_url ? (
                        <img src={comment.profiles.avatar_url} alt={comment.profiles.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                          {comment.profiles?.full_name?.[0] || 'U'}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-orange-50 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-[#4B1E1E]">{comment.profiles?.full_name || 'Anonymous'}</span>
                        <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{translatedComments[comment.id] || comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t border-orange-100">
              <div className="flex gap-2">
                <Textarea
                  placeholder={t('comments.placeholder')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[40px] max-h-[100px] resize-none border-orange-200 focus-visible:ring-orange-400"
                />
                <Button
                  size="icon"
                  className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Info Dialog */}
        <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white border-orange-200 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-[#4B1E1E] flex items-center gap-2 text-xl font-bold">
                <CustomIcon icon="Sparkles" className="w-6 h-6 text-orange-500" />
                {t('live.title')} ({activeLocation?.area || 'Chennai'})
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {loadingInfo ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <p className="text-sm text-gray-500">{t('live.loading')}</p>
                </div>
              ) : (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {liveUpdate || t('live.empty')}
                  </p>
                  <div className="mt-2 text-[10px] text-gray-400 text-right">
                    {t('live.powered')}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
