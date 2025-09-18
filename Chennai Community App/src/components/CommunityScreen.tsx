import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  Plus,
  Camera,
  Smile,
  Send,
  MoreVertical,
  Flag,
  Shield
} from "lucide-react";
import { useState } from "react";

interface CommunityScreenProps {
  onBack: () => void;
}

export function CommunityScreen({ onBack }: CommunityScreenProps) {
  const [newPost, setNewPost] = useState("");
  const [showPostInput, setShowPostInput] = useState(false);

  const posts = [
    {
      id: 1,
      author: "லக்ஷ்மி மேனன்",
      avatar: "ல",
      location: "டி. நகர்",
      timeAgo: "2 மணி முன்",
      content: "நாளைய பூஜைக்கு புதிய தேங்காய் எங்கே கிடைக்கும்? அருகிலேயே ஏதாவது கடை இருக்கா? 🥥🙏",
      englishContent: "Does anyone know where I can find fresh coconuts for tomorrow's pooja? Looking for something nearby.",
      category: "உதவி வேண்டும்",
      likes: 8,
      replies: 12,
      isLiked: false,
      isVerified: true,
      image: null,
      tags: ["பூஜை", "தேங்காய்", "உதவி"]
    },
    {
      id: 2,
      author: "ரவி குமார்",
      avatar: "ர",
      location: "பாண்டி பஜார்",
      timeAgo: "4 மணி முன்",
      content: "மெட்ரோ ஸ்டேஷன் அருகில் அழகான சுவர் ஓவியம் வருது! கலைஞர்கள் ரொம்ப அழகா செய்து கொண்டிருக்காங்க 🎨✨",
      englishContent: "Amazing street art coming up near the metro station! The artists are doing such beautiful work.",
      category: "உள்ளூர் செய்திகள்",
      likes: 23,
      replies: 7,
      isLiked: true,
      isVerified: false,
      image: "https://images.unsplash.com/photo-1704788564069-d54cab4169aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZW1wbGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU4MjA0NzkyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      tags: ["கலை", "மெட்ரோ", "கலாசாரம்"]
    },
    {
      id: 3,
      author: "சமுதாய எச்சரிக்கை",
      avatar: "🚨",
      location: "டி. நகர் பகுதி",
      timeAgo: "6 மணி முன்",
      content: "நாளை (டிசம்பர் 19) காலை 10 மணி முதல் மதியம் 2 மணி வரை ரங்கநாதன் தெரு பகுதியில் தண்ணீர் வழங்கல் நிறுத்தப்படும். முன்கூட்டியே தண்ணீர் சேமித்து வைக்கவும் 💧",
      englishContent: "Water supply will be disrupted tomorrow (Dec 19) from 10 AM to 2 PM in Ranganathan Street area. Please store water in advance.",
      category: "எச்சரிக்கை",
      likes: 45,
      replies: 3,
      isLiked: false,
      isVerified: true,
      image: null,
      tags: ["தண்ணீர்", "எச்சரிக்கை", "ரங்கநாதன்-தெரு"],
      isOfficial: true
    },
    {
      id: 4,
      author: "பிரியா ஷர்மா",
      avatar: "பி",
      location: "உஸ்மான் ரோடு",
      timeAgo: "8 மணி முன்",
      content: "எங்க அபார்ட்மெண்ட்ல குழந்தைங்களுக்கு சின்ன ரீடிங் க்ளப் ஆரம்பிச்சிருக்கேன். அருகிலுள்ள யாராவது இன்ட்ரஸ்ட் இருந்தா சொல்லுங்க! 📚👶",
      englishContent: "Started a small reading group for kids in our apartment complex. If anyone nearby is interested, please let me know!",
      category: "சமுதாய முயற்சி",
      likes: 16,
      replies: 9,
      isLiked: false,
      isVerified: false,
      image: null,
      tags: ["குழந்தைகள்", "வாசிப்பு", "கல்வி"]
    }
  ];

  const categoryColors = {
    "உதவி வேண்டும்": "bg-orange-100 text-orange-700 border-orange-200",
    "உள்ளூர் செய்திகள்": "bg-blue-100 text-blue-700 border-blue-200",
    "எச்சரிக்கை": "bg-red-100 text-red-700 border-red-200",
    "சமுதாய முயற்சி": "bg-green-100 text-green-700 border-green-200"
  };

  const handlePost = () => {
    if (newPost.trim()) {
      // Handle posting logic here
      setNewPost("");
      setShowPostInput(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl text-gray-800">சமுதாய வட்டம்</h1>
              <p className="text-gray-600">டி. நகர் & அருகிலுள்ள பகுதிகள்</p>
              <p className="text-gray-500 text-xs">T. Nagar & nearby areas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Users className="w-3 h-3 mr-1" />
              2.4k அண்டை வீட்டார்
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Create Post Button */}
        {!showPostInput && (
          <Card className="mb-6 bg-white border-gray-200">
            <CardContent className="p-4">
              <Button
                onClick={() => setShowPostInput(true)}
                variant="outline"
                className="w-full justify-start text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                உங்கள் அண்டை வீட்டார்களுடன் ஏதாவது பகிர்ந்து கொள்ளுங்கள்...
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Post Input */}
        {showPostInput && (
          <Card className="mb-6 bg-white border-red-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="உங்கள் பகுதியில் என்ன நடக்குது?"
                  className="min-h-[100px] border-gray-200 focus:border-red-400"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Camera className="w-4 h-4 mr-1" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPostInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handlePost}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={!newPost.trim()}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <Card key={post.id} className="bg-white border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      post.isOfficial ? 'bg-red-100 text-red-600' : 
                      post.avatar === 'L' ? 'bg-purple-100 text-purple-600' :
                      post.avatar === 'R' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <span className="text-sm">{post.avatar}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-gray-800">{post.author}</h3>
                        {post.isVerified && (
                          <Shield className="w-4 h-4 text-green-500" />
                        )}
                        {post.isOfficial && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                            Official
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{post.location}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" />
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Category */}
                <Badge 
                  variant="outline" 
                  className={`mb-3 ${categoryColors[post.category as keyof typeof categoryColors]}`}
                >
                  {post.category === "எச்சரிக்கை" && <AlertCircle className="w-3 h-3 mr-1" />}
                  {post.category}
                </Badge>

                {/* Post Content */}
                <p className="text-gray-700 mb-2 leading-relaxed">{post.content}</p>
                {(post as any).englishContent && (
                  <p className="text-gray-500 text-sm mb-3 leading-relaxed italic">{(post as any).englishContent}</p>
                )}

                {/* Post Image */}
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={post.image}
                      alt="Post image"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, tagIdx) => (
                      <Badge key={tagIdx} variant="outline" className="text-xs bg-gray-50">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm" className={`space-x-1 ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}>
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}