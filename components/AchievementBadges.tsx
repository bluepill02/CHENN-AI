import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Star, Trophy, Heart, Users, MapPin, MessageCircle, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  tamilTitle: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'community' | 'cultural' | 'local' | 'trust';
}

interface AchievementBadgesProps {
  userAchievements?: Achievement[];
  showProgress?: boolean;
}

export function AchievementBadges({ userAchievements, showProgress = true }: AchievementBadgesProps) {
  const defaultAchievements: Achievement[] = [
    {
      id: 'first_post',
      title: 'First Post',
      tamilTitle: 'முதல் பதிவு',
      description: 'Posted your first message in the community',
      icon: '✍️',
      color: 'from-blue-400 to-blue-600',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
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
      progress: 7,
      maxProgress: 10,
      isUnlocked: false,
      rarity: 'rare',
      category: 'community'
    },
    {
      id: 'tamil_pride',
      title: 'Tamil Pride',
      tamilTitle: 'தமிழ் பெருமை',
      description: 'Used Tamil in 50 posts or messages',
      icon: '🏛️',
      color: 'from-orange-400 to-red-600',
      progress: 34,
      maxProgress: 50,
      isUnlocked: false,
      rarity: 'epic',
      category: 'cultural'
    },
    {
      id: 'local_explorer',
      title: 'Local Explorer',
      tamilTitle: 'ஊர் ஆராய்ச்சியாளர்',
      description: 'Visited and reviewed 15 local businesses',
      icon: '🗺️',
      color: 'from-purple-400 to-purple-600',
      progress: 12,
      maxProgress: 15,
      isUnlocked: false,
      rarity: 'rare',
      category: 'local'
    },
    {
      id: 'trust_builder',
      title: 'Trust Builder',
      tamilTitle: 'நம்பிக்கை கட்டுபவர்',
      description: 'Maintained 4.8+ trust score for 30 days',
      icon: '⭐',
      color: 'from-yellow-400 to-orange-600',
      progress: 22,
      maxProgress: 30,
      isUnlocked: false,
      rarity: 'epic',
      category: 'trust'
    },
    {
      id: 'festival_organizer',
      title: 'Festival Organizer',
      tamilTitle: 'பண்டிகை ஏற்பாட்டாளர்',
      description: 'Organized 3 cultural events in your area',
      icon: '🎉',
      color: 'from-pink-400 to-rose-600',
      progress: 1,
      maxProgress: 3,
      isUnlocked: false,
      rarity: 'epic',
      category: 'cultural'
    },
    {
      id: 'chennai_legend',
      title: 'Chennai Legend',
      tamilTitle: 'சென்னை ஜாம்பவான்',
      description: 'Earned 100k community points and helped 100+ neighbors',
      icon: '👑',
      color: 'from-amber-400 to-yellow-600',
      progress: 45672,
      maxProgress: 100000,
      isUnlocked: false,
      rarity: 'legendary',
      category: 'community'
    },
    {
      id: 'marina_champion',
      title: 'Marina Champion',
      tamilTitle: 'மெரினா சாம்பியன்',
      description: 'Participated in 5 beach cleanup drives',
      icon: '🌊',
      color: 'from-cyan-400 to-blue-600',
      progress: 3,
      maxProgress: 5,
      isUnlocked: false,
      rarity: 'rare',
      category: 'local'
    }
  ];

  const achievements = userAchievements || defaultAchievements;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'community': return <Users className="w-3 h-3" />;
      case 'cultural': return <Star className="w-3 h-3" />;
      case 'local': return <MapPin className="w-3 h-3" />;
      case 'trust': return <Heart className="w-3 h-3" />;
      default: return <Trophy className="w-3 h-3" />;
    }
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const inProgressAchievements = achievements.filter(a => !a.isUnlocked && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked && a.progress === 0);

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <Card className="p-4 bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-600" />
            Achievement Progress • சாதனை முன்னேற்றம்
          </h3>
          <Badge className="bg-orange-200 text-orange-800">
            {unlockedAchievements.length}/{achievements.length}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-700">{unlockedAchievements.length}</div>
            <div className="text-xs text-orange-600">Unlocked</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-700">{inProgressAchievements.length}</div>
            <div className="text-xs text-blue-600">In Progress</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-700">
              {achievements.filter(a => a.rarity === 'epic' || a.rarity === 'legendary').filter(a => a.isUnlocked).length}
            </div>
            <div className="text-xs text-purple-600">Rare Badges</div>
          </div>
        </div>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            Earned Badges • பெற்ற பதக்கங்கள்
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {unlockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="p-3 bg-white border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-20 transform translate-x-6 -translate-y-6"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 bg-gradient-to-br ${achievement.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-sm">{achievement.icon}</span>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)} style={{ fontSize: '10px' }}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-orange-600 mb-1">{achievement.tamilTitle}</p>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {getCategoryIcon(achievement.category)}
                    <span className="text-xs text-gray-500 capitalize">{achievement.category}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {showProgress && inProgressAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            Almost There! • கிட்டத்தட்ட முடித்துவிட்டீர்கள்!
          </h3>
          <div className="space-y-3">
            {inProgressAchievements.map((achievement) => (
              <Card key={achievement.id} className="p-4 bg-white border-blue-100">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${achievement.color} rounded-lg flex items-center justify-center opacity-70`}>
                    <span className="text-white">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.tamilTitle}</p>
                      </div>
                      <Badge className={getRarityColor(achievement.rarity)} style={{ fontSize: '10px' }}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{achievement.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                        <span className="text-blue-600 font-medium">
                          {Math.round((achievement.progress / achievement.maxProgress) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gray-400" />
            Coming Soon • விரைவில் வரும்
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {lockedAchievements.slice(0, 4).map((achievement) => (
              <Card key={achievement.id} className="p-3 bg-gray-50 border-gray-200 opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">🔒</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200" style={{ fontSize: '10px' }}>
                    {achievement.rarity}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm text-gray-600 mb-1">{achievement.title}</h4>
                <p className="text-xs text-gray-500">{achievement.tamilTitle}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}