import { useState, useEffect } from 'react';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { AchievementBadges } from './AchievementBadges';
import { ChennaiIcons } from './IllustratedIcon';
import { useLocation } from '../services/LocationService';
import { useAuth } from './auth/SupabaseAuthProvider';
import { ProfileService, type Profile, type ProfileStats } from '../services/ProfileService';
import { toast } from 'sonner';
import { ProfileScreenBackground } from './BackgroundAnimations';
import {
  MapPin,
  ChevronRight,
  Edit2,
  Loader2,
  Shield,
  HelpCircle,
  Leaf,
  Mail,
  Globe
} from 'lucide-react';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBio, setEditBio] = useState('');

  // Dialog States
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');
  const { currentLocation, setLocationModalOpen, previousLocations } = useLocation();

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [profileData, statsData] = await Promise.all([
        ProfileService.getProfile(user.id),
        ProfileService.getProfileStats(user.id)
      ]);

      if (profileData) {
        setProfile(profileData);
        // Initialize edit form with current values
        setEditFullName(profileData.full_name || '');
        setEditArea(profileData.area || '');
        setEditAvatarUrl(profileData.avatar_url || '');
        setEditBio(profileData.bio || '');
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const updated = await ProfileService.updateProfile(user.id, {
        full_name: editFullName || undefined,
        area: editArea || undefined,
        avatar_url: editAvatarUrl || undefined,
        bio: editBio || undefined,
      });

      if (updated) {
        setProfile(updated);
        setEditDialogOpen(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageToggle = async (checked: boolean) => {
    if (!user) return;
    const newLang = checked ? 'ta' : 'en';
    try {
      const updated = await ProfileService.updateProfile(user.id, { language: newLang });
      if (updated) {
        setProfile(updated);
        toast.success(`Language changed to ${newLang === 'ta' ? 'Tamil' : 'English'}`);
      }
    } catch (error) {
      toast.error("Failed to update language");
    }
  };

  const handleLocationPrivacyToggle = async (checked: boolean) => {
    if (!user) return;
    try {
      const updated = await ProfileService.updateProfile(user.id, { share_location: checked });
      if (updated) {
        setProfile(updated);
        toast.success(`Location sharing ${checked ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error("Failed to update privacy settings");
    }
  };

  const userStats = [
    {
      label: 'Trust Score',
      value: stats?.trustScore.toFixed(1) || '3.0',
      iconSrc: ChennaiIcons.trust,
      iconEmoji: '⭐',
      color: 'text-yellow-600'
    },
    {
      label: 'Rides Shared',
      value: stats?.ridesShared.toString() || '0',
      iconSrc: ChennaiIcons.auto,
      iconEmoji: '🛺',
      color: 'text-blue-600'
    },
    {
      label: 'Posts Shared',
      value: stats?.postsCount.toString() || '0',
      iconSrc: ChennaiIcons.chat,
      iconEmoji: '💬',
      color: 'text-green-600'
    },
    {
      label: 'Actions',
      value: stats?.eventsJoined.toString() || '0',
      iconSrc: ChennaiIcons.celebration,
      iconEmoji: '🎉',
      color: 'text-purple-600'
    }
  ];

  const achievements = [
    {
      title: 'நல்ல பக்கத்து வீட்டுக்காரர்',
      description: '10+ neighbors-க்கு உதவி செய்தது',
      icon: '🤝',
      earned: (stats?.ridesShared || 0) > 10,
      rarity: 'Common'
    },
    {
      title: 'சென்னை Food Expert',
      description: '5+ authentic food spots share',
      icon: '🍽️',
      earned: false, // Need food hunt stats
      rarity: 'Rare'
    },
    {
      title: 'Trust-ed Chennai-ite',
      description: '4.5+ நம்பிக்கை score',
      icon: '⭐',
      earned: (stats?.trustScore || 0) >= 4.5,
      rarity: 'Legendary'
    },
    {
      title: 'Active Citizen',
      description: 'Posted 5+ updates',
      icon: '📢',
      earned: (stats?.postsCount || 0) >= 5,
      rarity: 'Rare'
    }
  ];

  const menuItems = [
    {
      iconSrc: ChennaiIcons.verified,
      iconEmoji: '📍',
      label: 'Manage Locations',
      subtitle: `${previousLocations.length + (currentLocation ? 1 : 0)} areas • Change or add locations`,
      action: () => setLocationModalOpen(true)
    },
    {
      iconSrc: ChennaiIcons.verified,
      iconEmoji: '⚙️',
      label: 'Settings',
      subtitle: 'Privacy, notifications, language',
      action: () => setSettingsOpen(true)
    },
    {
      iconSrc: ChennaiIcons.trust,
      iconEmoji: '🛡️',
      label: 'Safety & Trust',
      subtitle: 'Community guidelines, reporting',
      action: () => setSafetyOpen(true)
    },
    {
      iconSrc: ChennaiIcons.helper,
      iconEmoji: '💝',
      label: 'Your Impact',
      subtitle: 'See how you\'ve helped the community',
      action: () => setImpactOpen(true)
    },
    {
      iconSrc: ChennaiIcons.community,
      iconEmoji: '❓',
      label: 'Help & Support',
      subtitle: 'FAQ, contact us',
      action: () => setHelpOpen(true)
    },
    {
      iconSrc: ChennaiIcons.community,
      iconEmoji: '🚪',
      label: 'Sign Out',
      subtitle: 'Log out of your account',
      isDestructive: true,
      action: signOut
    }
  ];

  const getDynamicAchievements = () => {
    if (!stats) return undefined;

    return [
      {
        id: 'first_post',
        title: 'First Post',
        tamilTitle: 'முதல் பதிவு',
        description: 'Posted your first message in the community',
        icon: '✍️',
        color: 'from-blue-400 to-blue-600',
        progress: stats.postsCount,
        maxProgress: 1,
        isUnlocked: stats.postsCount >= 1,
        rarity: 'common',
        category: 'community'
      },
      {
        id: 'neighborhood_helper',
        title: 'Neighborhood Helper',
        tamilTitle: 'சமூக உதவியாளர்',
        description: 'Helped 10 neighbors with local services',
        icon: '🤝',
        color: 'from-green-400 to-green-600',
        progress: stats.ridesShared, // Using rides as proxy for help
        maxProgress: 10,
        isUnlocked: stats.ridesShared >= 10,
        rarity: 'rare',
        category: 'community'
      },
      {
        id: 'trust_builder',
        title: 'Trust Builder',
        tamilTitle: 'நம்பிக்கை கட்டுபவர்',
        description: 'Maintained 4.5+ trust score',
        icon: '⭐',
        color: 'from-yellow-400 to-orange-600',
        progress: Math.min(stats.trustScore, 4.5),
        maxProgress: 4.5,
        isUnlocked: stats.trustScore >= 4.5,
        rarity: 'epic',
        category: 'trust'
      },
      {
        id: 'active_citizen',
        title: 'Active Citizen',
        tamilTitle: 'செயலில் உள்ள குடிமகன்',
        description: 'Participated in 5 community actions',
        icon: '📢',
        color: 'from-purple-400 to-purple-600',
        progress: stats.eventsJoined,
        maxProgress: 5,
        isUnlocked: stats.eventsJoined >= 5,
        rarity: 'rare',
        category: 'community'
      }
    ] as any[]; // Using any to bypass strict type check for now if interface mismatch
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-yellow-25">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-orange-50 to-yellow-25 min-h-screen relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <ProfileScreenBackground />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Fan Club Card Style */}
        <div className="px-4 pt-6 pb-8">
          <div className="bg-gradient-to-br from-auto-yellow to-orange-500 rounded-3xl p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black transform rotate-1 hover:rotate-0 transition-transform duration-500">
            <div className="bg-black rounded-[1.3rem] p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
              {/* Holographic effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full animate-spin-slow opacity-75 blur-sm"></div>
                    <Avatar className="w-24 h-24 border-4 border-black relative z-10">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-3xl font-display">{getInitials(profile?.full_name)}</span>
                        </div>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-black uppercase tracking-wider whitespace-nowrap shadow-sm">
                      SUPER STAR
                    </div>
                  </div>

                  <div>
                    <h1 className="text-white text-3xl font-display font-bold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
                      {profile?.full_name || 'User'}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-mono mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile?.area?.toUpperCase() || 'CHENNAI'}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge className="bg-white/10 text-yellow-400 border-yellow-400/30 hover:bg-white/20">
                        <span className="mr-1">⭐</span>
                        VERIFIED FAN
                      </Badge>
                    </div>
                  </div>
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  {/* ... Dialog Content ... */}
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="area">Area</Label>
                        <Input
                          id="area"
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                          placeholder="e.g., Mylapore, Chennai"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio / About Me</Label>
                        <Textarea
                          id="bio"
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          value={editAvatarUrl}
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500">Enter a URL to your profile picture</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditProfile}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Gethu Meter Stats */}
              <div className="grid grid-cols-4 gap-2 mt-6 border-t border-white/10 pt-4">
                {userStats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center group">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform group-hover:bg-white/10 group-hover:border-yellow-500/50">
                      <span className="text-2xl filter drop-shadow-lg">{stat.iconEmoji}</span>
                    </div>
                    <div className="text-white font-display font-bold text-lg leading-none">
                      {stat.value}
                    </div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4">
          <div className="flex bg-orange-100 rounded-xl p-1">
            <Button
              onClick={() => setActiveTab('overview')}
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className={`flex-1 text-xs ${activeTab === 'overview'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-orange-600 hover:bg-orange-200'
                }`}
            >
              Overview
            </Button>
            <Button
              onClick={() => setActiveTab('achievements')}
              variant={activeTab === 'achievements' ? 'default' : 'ghost'}
              className={`flex-1 text-xs ${activeTab === 'achievements'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-orange-600 hover:bg-orange-200'
                }`}
            >
              <span className="mr-1">🏆</span>
              Achievements
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Community bio */}
            <div className="px-6 pb-4">
              <Card className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                <div className="relative z-10 flex justify-between items-start mb-2">
                  <h3 className="font-medium">About</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-orange-400"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile?.bio || (
                    <span className="text-gray-400 italic">
                      No bio yet. Click edit to tell the community about yourself!
                    </span>
                  )}
                </p>
              </Card>
            </div>

            {/* Recent Achievements Preview */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3>Recent Achievements</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('achievements')}
                  className="text-orange-600 hover:bg-orange-50"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {achievements.filter(a => a.earned).slice(0, 3).length > 0 ? (
                  achievements.filter(a => a.earned).slice(0, 3).map((achievement, index) => (
                    <Card key={index} className="p-2 bg-white border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="text-lg mb-1">{achievement.icon}</div>
                      <h4 className="text-xs font-medium text-gray-900 mb-1">{achievement.title}</h4>
                      <Badge className={`text-xs ${achievement.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-700' :
                        achievement.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' :
                          achievement.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {achievement.rarity}
                      </Badge>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4 text-gray-500 text-sm bg-white/50 rounded-lg border border-dashed border-gray-300">
                    Start engaging to earn badges!
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="px-6 pb-4">
            <AchievementBadges userAchievements={getDynamicAchievements()} />
          </div>
        )}

        {/* Menu items */}
        <div className="px-6 pb-20">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-all cursor-pointer hover:scale-[1.02] relative overflow-hidden group"
                onClick={item.action}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply z-0" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.isDestructive
                    ? 'bg-red-100'
                    : 'bg-orange-100'
                    }`}>
                    <span className={`text-lg ${item.isDestructive
                      ? 'text-red-600'
                      : 'text-orange-600'
                      }`}>
                      {item.iconEmoji}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.label}
                    </h4>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⚙️ Settings & Preferences
            </DialogTitle>
            <DialogDescription>
              Customize your Chennai Community experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Language Setting */}
            <Card className="p-4 border-orange-100 bg-orange-50/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-600" />
                    Language / மொழி
                  </div>
                  <div className="text-sm text-gray-600">
                    Current: <span className="font-medium text-orange-700">
                      {profile?.language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Toggle to switch between English and Tamil
                  </div>
                </div>
                <Switch
                  checked={profile?.language === 'ta'}
                  onCheckedChange={handleLanguageToggle}
                />
              </div>
            </Card>

            {/* Location Privacy Setting */}
            <Card className="p-4 border-blue-100 bg-blue-50/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Location Sharing
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: <span className="font-medium text-blue-700">
                      {profile?.share_location !== false ? 'Enabled ✓' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    When enabled, neighbors can see your approximate area (e.g., "{profile?.area || 'Mylapore'}")
                  </div>
                </div>
                <Switch
                  checked={profile?.share_location !== false}
                  onCheckedChange={handleLocationPrivacyToggle}
                />
              </div>
            </Card>

            {/* Account Info */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3 text-gray-700">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="font-medium">{profile?.full_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Area:</span>
                  <span className="font-medium">{profile?.area || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Trust Score:</span>
                  <span className="font-medium text-yellow-600">⭐ {stats?.trustScore.toFixed(1) || '3.0'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSettingsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety & Trust Dialog */}
      <Dialog open={safetyOpen} onOpenChange={setSafetyOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Safety & Trust Center
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <h4 className="font-medium text-orange-800 mb-2">Community Guidelines</h4>
              <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                <li>Be respectful to your neighbors (மரியாதையுடன் பழகுங்கள்)</li>
                <li>Verify information before sharing</li>
                <li>No spam or commercial promotions without approval</li>
                <li>Report suspicious activity immediately</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 border-red-100 bg-red-50">
                <div className="text-red-600 font-bold text-lg mb-1">100</div>
                <div className="text-xs text-red-500">Police Control Room</div>
              </Card>
              <Card className="p-3 border-red-100 bg-red-50">
                <div className="text-red-600 font-bold text-lg mb-1">108</div>
                <div className="text-xs text-red-500">Ambulance / Fire</div>
              </Card>
              <Card className="p-3 border-blue-100 bg-blue-50">
                <div className="text-blue-600 font-bold text-lg mb-1">1098</div>
                <div className="text-xs text-blue-500">Child Helpline</div>
              </Card>
              <Card className="p-3 border-purple-100 bg-purple-50">
                <div className="text-purple-600 font-bold text-lg mb-1">1091</div>
                <div className="text-xs text-purple-500">Women's Helpline</div>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Your Impact Dialog */}
      <Dialog open={impactOpen} onOpenChange={setImpactOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Your Community Impact
            </DialogTitle>
            <DialogDescription>
              Thank you for making Chennai better!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {((stats?.ridesShared || 0) * 2.5).toFixed(1)}kg
                </div>
                <div className="text-xs text-gray-500">CO₂ Saved</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {((stats?.postsCount || 0) * 10 + (stats?.eventsJoined || 0) * 5)}
                </div>
                <div className="text-xs text-gray-500">People Reached</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">Top 10%</div>
                <div className="text-xs text-gray-500">Community Rank</div>
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
              <h4 className="font-medium text-green-800 mb-2">Did you know?</h4>
              <p className="text-sm text-green-700">
                By sharing {stats?.ridesShared || 0} rides, you've helped reduce traffic congestion in {profile?.area || 'Chennai'} equivalent to removing {(stats?.ridesShared || 0)} cars from the road for an hour!
              </p>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Help & Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I get verified?</AccordionTrigger>
                <AccordionContent>
                  To get the "Verified Neighbor" badge, you need to verify your location using GPS while in your registered area. Go to "Manage Locations" and click "Verify".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How is Trust Score calculated?</AccordionTrigger>
                <AccordionContent>
                  Your Trust Score increases when you help neighbors, receive positive reviews, and participate in community events. It decreases if your posts are reported.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is my data safe?</AccordionTrigger>
                <AccordionContent>
                  Yes! We only share your approximate location (area level) with neighbors. Your exact address is never revealed publicly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Contact Support</h4>
              <Button variant="outline" className="w-full gap-2">
                <Mail className="w-4 h-4" />
                support@chenn-ai.com
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
