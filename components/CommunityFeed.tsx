import communityScenes from 'figma:asset/39dd468cce8081c14f345796484cc8b182dc6bb6.png';
import { Heart, MapPin, MessageCircle, Navigation, Share2, Shield, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import rickshawVideo from '../assets/Rickshaw.webm';
import { useLanguage } from '../services/LanguageService';
import { getLocationAwarePosts, getLocationSpecificContent, useLocation } from '../services/LocationService';
import AutoShareCard from './AutoShareCard';
import { ChennaiPride } from './ChennaiPride';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChennaiIcons, IllustratedIcon } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { LiveInfoPage } from './LiveInfoPage';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface CommunityFeedProps {
  userLocation?: any;
  pincode?: string;
}

export function CommunityFeed({ userLocation, pincode }: CommunityFeedProps) {
  const [showChennaiPride, setShowChennaiPride] = useState(false);
  const [showLiveInfo, setShowLiveInfo] = useState(false);
  const { currentLocation, setLocationModalOpen } = useLocation();
  const { t } = useLanguage();
  
  // Use location from context if available, otherwise use prop
  const activeLocation = currentLocation || userLocation;
  
  // Get location-specific content and posts
  const locationContent = getLocationSpecificContent(activeLocation);
  const locationPosts = getLocationAwarePosts(activeLocation);
  
  const defaultPosts = [
    {
      id: 1,
      author: 'Priya Akka',
      location: 'T. Nagar • டி. நகர்',
      time: '2 hours ago',
      content: 'Anna, found the best இட்லி in our area! Amma\'s Kitchen near RS Road - semma taste da! Original கல் இட்லி with gun powder. Must try பண்ணுங்க! 🙏',
      image: ChennaiIcons.food,
      likes: 23,
      comments: 8,
      type: 'food_recommendation',
      isVerified: true
    },
    {
      id: 2,
      author: 'Rajesh Anna',
      location: 'Mylapore • மயிலாப்பூர்',
      time: '4 hours ago',
      content: 'கபாலீஸ்வரர் சுவாமி கோவில்-ல நாளை விசேஷ பூஜை. எல்லா neighbors-உம் welcome! Free prasadam and வெள்ளிக்கிழமை special அருள். 5:30 PM-ல start ஆகும். 🕉️',
      likes: 45,
      comments: 12,
      type: 'community_event',
      isVerified: true
    },
    {
      id: 3,
      author: 'Divya Sister',
      location: 'Adyar • அடையார்',
      time: '6 hours ago',
      content: 'Auto-la OMR போக 3 பேரு தேவை tomorrow 9 AM. Share panna petrol cost. DM பண்ணுங்க! IT corridor regular-a போவேன். Safe ride guaranteed! 🚗',
      likes: 8,
      comments: 15,
      type: 'help_request'
    },
    {
      id: 4,
      author: 'Venkat Anna',
      location: 'Besant Nagar • பெசன்ட் நகர்',
      time: '1 day ago',
      content: 'Marina beach cleanup drive this Sunday 6 AM sharp! நம்ம சென்னை-ய clean-a வைப்போம். Gloves, bags எல்லாம் நாங்க provide பண்றோம். Come with family! 🌊',
      image: ChennaiIcons.beach,
      likes: 67,
      comments: 23,
      type: 'community_event',
      isVerified: true
    },
    {
      id: 5,
      author: 'Lakshmi Mami',
      location: 'Mylapore • மயிலாப்பூர்',
      time: '3 hours ago',
      content: 'கார்த்திகை தீபம் plans ready! Our street-la traditional diyas with நல்லெண்ணெய். Kids-உம் welcome to help. Let\'s make this year extra special! தமிழ் tradition-a கொண்டாடுவோம்! ✨',
      likes: 34,
      comments: 18,
      type: 'cultural_event',
      isVerified: true
    }
  ];

  // Combine location-aware posts with default posts
  const posts = locationPosts.length > 0 ? [...locationPosts, ...defaultPosts.slice(0, 2)] : defaultPosts;

  const getPostBadge = (type: string) => {
    switch (type) {
      case 'food_recommendation':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1 text-xs">
            <IllustratedIcon src={ChennaiIcons.food} alt="Food" size="sm" className="w-3 h-3" />
            சாப்பாடு
          </Badge>
        );
      case 'community_event':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1 text-xs">
            <IllustratedIcon src={ChennaiIcons.community} alt="Event" size="sm" className="w-3 h-3" />
            நிகழ்ச்சி
          </Badge>
        );
      case 'cultural_event':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1 text-xs">
            <IllustratedIcon src={ChennaiIcons.temple} alt="Festival" size="sm" className="w-3 h-3" />
            பண்டிகை
          </Badge>
        );
      case 'help_request':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 text-xs">
            <IllustratedIcon src={ChennaiIcons.auto} alt="Help" size="sm" className="w-3 h-3" />
            உதவி
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Show LiveInfoPage when requested */}
      {showLiveInfo && (
        <LiveInfoPage 
          userLocation={activeLocation}
          onBack={() => setShowLiveInfo(false)}
        />
      )}
      
      {/* Show CommunityFeed when not showing LiveInfo */}
      {!showLiveInfo && (
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
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-6 rounded-b-[2rem] relative overflow-hidden">
        {/* Traditional pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='10' cy='10' r='2'/%3E%3Ccircle cx='50' cy='10' r='2'/%3E%3Ccircle cx='10' cy='50' r='2'/%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">{t('feed.title', locationContent.greeting)}</h1>
            <div className="flex items-center gap-2">
              <p className="text-orange-100">
                {activeLocation ? `${activeLocation.area} • ${activeLocation.pincode}` : 'Mylapore • மயிலாப்பூர்'}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-orange-200 hover:text-white hover:bg-white/10"
                onClick={() => setLocationModalOpen(true)}
              >
                <Navigation className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {activeLocation && (
                <>
                  <Shield className="w-3 h-3 text-green-200" />
                  <span className="text-green-200 text-xs">Verified Area</span>
                  <span className="text-orange-200 text-xs">•</span>
                </>
              )}
              <span className="text-yellow-200 text-xs">🌤️ 31°C</span>
              <span className="text-orange-200 text-xs">•</span>
              <span className="text-orange-200 text-xs">Marina breeze today</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <IllustratedIcon
                src={ChennaiIcons.family}
                alt="Profile"
                size="md"
                className="border-2 border-white/30"
              />
            </div>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="mt-4 flex gap-4">
          <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-200" />
            <span className="text-white text-sm">4.8 Trust Score</span>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-white text-sm">2.3km radius</span>
          </div>
        </div>
      </div>

      {/* Chennai Quick Actions */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Button variant="outline" className="flex-col h-auto py-3 border-orange-200 hover:bg-orange-50">
            <div className="mb-1">
              <video 
                src={rickshawVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-12 h-12 rounded-md object-cover"
              >
                <IllustratedIcon src={ChennaiIcons.auto} alt="Auto" size="sm" />
              </video>
            </div>
            <span className="text-xs text-[11px]">Auto Share</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3 border-orange-200 hover:bg-orange-50">
            <IllustratedIcon src={ChennaiIcons.food} alt="Food" size="sm" className="mb-1" />
            <span className="text-xs text-[11px]">Food Hunt</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-col h-auto py-3 border-orange-200 hover:bg-orange-50"
            onClick={() => setShowLiveInfo(true)}
          >
            <Zap className="w-4 h-4 mb-1" />
            <span className="text-xs">Live Info & Alerts</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-col h-auto py-3 border-orange-200 hover:bg-orange-50"
            onClick={() => setShowChennaiPride(!showChennaiPride)}
          >
            <IllustratedIcon src={ChennaiIcons.beach} alt="Chennai Pride" size="sm" className="mb-1" />
            <span className="text-xs text-[11px]">Chennai Pride</span>
          </Button>
        </div>
        
        {/* Chennai Pride Section */}
        {showChennaiPride && (
          <div className="mb-4">
            <ChennaiPride />
          </div>
        )}
        
        {/* Auto Share Card */}
        {pincode && (
          <div className="px-6 mb-4">
            <AutoShareCard pincode={pincode} />
          </div>
        )}
        
        {/* What's happening card - Light ivory background */}
        <Card className="p-4 bg-[#FFFFF0] backdrop-blur-md border-2 border-[#E1AD01]/60 shadow-lg shadow-orange-200/80 rounded-xl">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">You</span>
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Button
                variant="outline"
                className="w-full justify-start text-[#4B1E1E] border-orange-200 bg-orange-50 hover:bg-orange-100 whitespace-normal break-words text-left min-h-[48px] text-sm px-3 py-2 h-auto"
              >
                {t('feed.whatsHappening', "What's happening in your area?")}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Community posts */}
      <div className="px-6 space-y-4 pb-20">
        {posts.map((post) => (
          <Card key={post.id} className="p-4 bg-[#FFFFF0] backdrop-blur-md border-2 border-[#E1AD01]/60 shadow-lg shadow-orange-200/80 rounded-xl">
            {/* Post header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">{post.author.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                  </Avatar>
                  {post.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#4B1E1E] truncate">{post.author}</h3>
                    {post.isVerified && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1 py-0 flex-shrink-0">
                        பட்டியல்
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{post.location}</span>
                    <span className="text-gray-400">•</span>
                    <span className="whitespace-nowrap">{post.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {getPostBadge(post.type)}
              </div>
            </div>

            {/* Post content */}
            <p className="text-[#4B1E1E] mb-3 leading-relaxed break-words">{post.content}</p>

            {/* Post image */}
            {post.image && (
              <div className="mb-3 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt="Post content"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Post actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
              <button className="text-gray-500 hover:text-orange-500 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
        </div>
      )}
    </>
  );
}