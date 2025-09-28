import {
    Check,
    ChevronRight,
    CircleOff,
    Clock,
    Heart,
    MapPin,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImpactChart from '../Figma Exports/01 Pie Chart.png';
import BadgeSpotlight from '../Figma Exports/Badge 01.png';
import ProfileBackdrop from '../Figma Exports/Frame 4.png';
import { useLanguage } from '../services/LanguageService';
import { useLocation } from '../services/LocationService';
import {
    useProfileDashboard,
    type AchievementSummary,
    type ActivityItem,
    type RecommendationItem,
} from '../services/ProfileDashboardService';
import { AchievementBadges } from './AchievementBadges';
import { AppHealthCheck } from './AppHealthCheck';
import DeploymentReadiness from './DeploymentReadiness';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChennaiIcons, IllustratedIcon } from './IllustratedIcon';
import { LanguageToggle } from './LanguageToggle';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const rarityColorMap: Record<AchievementSummary['rarity'], string> = {
  common: 'from-slate-200 to-slate-300',
  rare: 'from-blue-200 to-blue-300',
  epic: 'from-purple-200 to-purple-300',
  legendary: 'from-yellow-200 to-orange-300',
};

const achievementCategoryMap: Record<AchievementSummary['category'], 'community' | 'trust' | 'cultural' | 'local'> = {
  community: 'community',
  trust: 'trust',
  culture: 'cultural',
  sustainability: 'local',
};

function formatRelativeTime(date: Date | null): string {
  if (!date) {
    return 'Sync pending';
  }
  const diff = Date.now() - date.getTime();
  if (diff < 60 * 1000) {
    const seconds = Math.max(1, Math.round(diff / 1000));
    return `${seconds}s ago`;
  }
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.round(diff / (60 * 1000));
    return `${minutes} min ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `${hours} hr ago`;
  }
  return date.toLocaleString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimelineTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
  });
}

function getTimelineIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'help':
      return { icon: ChennaiIcons.helper, emoji: '🤝' };
    case 'event':
      return { icon: ChennaiIcons.celebration, emoji: '🎉' };
    case 'post':
      return { icon: ChennaiIcons.chat, emoji: '💬' };
    case 'achievement':
      return { icon: ChennaiIcons.trust, emoji: '🏅' };
    case 'safety':
      return { icon: ChennaiIcons.verified, emoji: '🛡️' };
    default:
      return { icon: ChennaiIcons.community, emoji: '✨' };
  }
}

function mapAchievementToBadge(achievement: AchievementSummary) {
  return {
    id: achievement.id,
    title: achievement.title,
    tamilTitle: achievement.subtitle,
    description: achievement.subtitle,
    icon: achievement.icon,
    color: rarityColorMap[achievement.rarity],
    progress: achievement.progress,
    maxProgress: achievement.target,
    isUnlocked: achievement.earned,
    rarity: achievement.rarity,
    category: achievementCategoryMap[achievement.category],
  };
}

export function ProfileScreen() {
  const {
    profile,
    metrics,
    insights,
    achievements,
    timeline,
    fullTimeline,
    recommendations,
    areaFilter,
    setAreaFilter,
    loading,
    error,
    isUsingBackend,
    lastSync,
    refresh,
    updateProfile,
    recordActivity,
    dismissRecommendation,
  } = useProfileDashboard();
  const { currentLocation, setLocationModalOpen, previousLocations } = useLocation();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity' | 'status'>('overview');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name ?? '');
  const [editAbout, setEditAbout] = useState(profile?.about ?? '');
  const [showSettings, setShowSettings] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setEditName(profile?.name ?? '');
    setEditAbout(profile?.about ?? '');
  }, [profile?.name, profile?.about]);

  const heroStats = useMemo(
    () => [
      { label: 'Trust Score', value: metrics.trustScore.toFixed(1), icon: '⭐' },
      { label: 'Neighbors Helped', value: metrics.neighborsHelped, icon: '🤝' },
      { label: 'Volunteer Hours', value: metrics.volunteerHours, icon: '⏱️' },
      { label: 'Community Points', value: metrics.communityPoints, icon: '🏅' },
    ],
    [metrics],
  );

  const sentimentBadgeClass = isUsingBackend
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200';

  const timelineToRender = useMemo(() => {
    if (activeTab === 'activity') {
      return fullTimeline;
    }
    return timeline.slice(0, 4);
  }, [activeTab, fullTimeline, timeline]);

  const achievementsForBadges = useMemo(
    () => achievements.map(mapAchievementToBadge),
    [achievements],
  );

  const handleSaveProfile = async () => {
    await updateProfile({ name: editName, about: editAbout });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditName(profile?.name ?? '');
    setEditAbout(profile?.about ?? '');
  };

  const handleCompleteRecommendation = async (item: RecommendationItem) => {
    await recordActivity({
      type: item.sentiment === 'urgent' ? 'safety' : 'help',
      title: item.title,
      description: item.description,
      area: item.area ?? profile?.location ?? 'Chennai',
      impact: `Completed: ${item.title}`,
      points: item.sentiment === 'urgent' ? 45 : 25,
      sentiment: item.sentiment,
    });
    await dismissRecommendation(item.id);
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'guest', name: 'Guest' }),
      });
    } catch (apiError) {
      try {
        const mod = await import('../src/services/UserService');
        await mod.updateUser({ id: 'guest', name: 'Guest' });
      } catch (fallbackError) {
        console.warn('Sign out fallback failed', fallbackError);
      }
    }
    navigate('/');
  };

  const menuItems = useMemo(
    () => [
      {
        iconEmoji: '📍',
        label: 'Manage Locations',
        subtitle: `${previousLocations.length + (currentLocation ? 1 : 0)} areas • Change or add locations`,
        action: () => setLocationModalOpen(true),
      },
      {
        iconEmoji: '⚙️',
        label: 'Settings',
        subtitle: 'Privacy, notifications, language',
        action: () => setShowSettings(true),
      },
      {
        iconEmoji: '🛡️',
        label: 'Safety & Trust',
        subtitle: 'Community guidelines, reporting',
        action: () => setShowSafety(true),
      },
      {
        iconEmoji: '💝',
        label: 'Your Impact',
        subtitle: 'See how you have helped the community',
        action: () => setShowImpact(true),
      },
      {
        iconEmoji: '❓',
        label: 'Help & Support',
        subtitle: 'FAQ, contact us',
        action: () => setShowHelp(true),
      },
      {
        iconEmoji: '🚪',
        label: 'Sign Out',
        subtitle: 'Log out of your account',
        action: handleSignOut,
        isDestructive: true,
      },
    ],
    [currentLocation, previousLocations.length],
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-orange-50 to-yellow-25">
      <div className="pointer-events-none fixed inset-0 opacity-15 md:opacity-10">
        <ImageWithFallback src={ProfileBackdrop} alt="Chennai profile gradient" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 pb-20">
        <header className="rounded-b-[2rem] bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 gap-4">
              <Avatar className="h-20 w-20 shadow-lg shadow-orange-300/40">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl font-bold text-white">
                  {(profile?.name ?? 'Chennai Citizen')
                    .split(' ')
                    .map((segment) => segment[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              </Avatar>
              <div className="flex-1">
                {!editing ? (
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                        {profile?.name ?? 'Priya Raman'}
                      </h1>
                      <Badge className="bg-white/20 text-white border-white/30">{t('profile.verified', 'Verified Neighbor')}</Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {t('profile.topHelper', 'Top Helper')}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-orange-100">
                      <MapPin className="h-4 w-4" />
                      <span>{profile?.location ?? 'Mylapore, Chennai'}</span>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm text-orange-50">
                      {profile?.about ??
                        'Born and raised in Chennai. Love exploring local food spots, championing Tamil pride, and helping neighbors.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="w-full rounded-lg border border-orange-200/60 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    />
                    <textarea
                      value={editAbout}
                      onChange={(event) => setEditAbout(event.target.value)}
                      className="h-24 w-full resize-none rounded-lg border border-orange-200/60 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProfile} className="bg-white/90 text-orange-600 hover:bg-white">
                        <Check className="mr-1 h-4 w-4" />
                        {t('profile.save', 'Save')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="text-white hover:bg-white/20">
                        <X className="mr-1 h-4 w-4" />
                        {t('profile.cancel', 'Cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Badge className={`${sentimentBadgeClass} border text-xs`}>{
                isUsingBackend ? 'Live sync' : 'Chennai simulation'
              }</Badge>
              <Button
                onClick={() => void refresh()}
                disabled={loading}
                variant="secondary"
                className="border border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {t('profile.refresh', 'Refresh')}
              </Button>
            </div>
          </div>

          {error && (
            <Card className="mt-4 border border-yellow-200 bg-white/90 p-3 text-sm text-yellow-800 shadow-sm shadow-yellow-200">
              {error}
            </Card>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <Card key={stat.label} className="border border-white/50 bg-white/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-orange-500/80">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-orange-200 to-orange-100 p-3 text-orange-600">
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="mt-3 text-xs text-orange-100">
            {t('profile.lastUpdated', 'Last updated')} {formatRelativeTime(lastSync)}
          </p>
        </header>

        <nav className="px-6 pt-5">
          <div className="flex flex-wrap gap-2 rounded-2xl bg-orange-100 p-1">
            {[{ key: 'overview', label: 'Overview', emoji: '🏡' }, { key: 'achievements', label: 'Achievements', emoji: '🏆' }, { key: 'activity', label: 'Activity', emoji: '📅' }, { key: 'status', label: 'App Status', emoji: '🚀' }].map(
              ({ key, label, emoji }) => (
                <Button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  variant={activeTab === key ? 'default' : 'ghost'}
                  className={`flex-1 text-xs transition ${
                    activeTab === key ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-600 hover:bg-orange-200'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  {label}
                </Button>
              ),
            )}
          </div>
        </nav>

        {activeTab === 'overview' && (
          <div className="space-y-6 px-6 pt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card className="relative overflow-hidden border border-orange-100 bg-white/90 p-5 shadow-sm">
                <div className="absolute -right-6 -top-6 h-36 w-36 opacity-30">
                  <ImageWithFallback src={BadgeSpotlight} alt="Profile spotlight" className="h-full w-full object-contain" />
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('profile.about', 'About')}</h3>
                      <p className="text-sm text-gray-500">{t('profile.neighborSince', 'Neighbor since 2019')}</p>
                    </div>
                    {!editing && (
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="border-orange-200 text-orange-600 hover:bg-orange-50">
                        {t('profile.edit', 'Edit Profile')}
                      </Button>
                    )}
                  </div>
                  {!editing && (
                    <p className="mt-4 text-sm leading-relaxed text-gray-600">
                      {profile?.about ??
                        'Born and raised in Chennai. Love exploring local food spots, coordinating community drives, and amplifying Tamil pride across neighborhoods.'}
                    </p>
                  )}
                </div>
              </Card>

              <Card className="border border-orange-100 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    {t('profile.impactScore', 'Impact score')}
                  </h3>
                  <Badge className="bg-orange-100 text-orange-700">{metrics.communityPoints}</Badge>
                </div>
                <div className="mt-4 rounded-2xl bg-orange-50/80 p-3">
                  <ImageWithFallback src={ImpactChart} alt="Community impact chart" className="mx-auto h-44 w-auto" />
                </div>
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-orange-500" />
                    <span>
                      {t('profile.connections', 'Connections')}: {metrics.connections}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>
                      {t('profile.trustScore', 'Trust Score')} trend:{' '}
                      {(metrics.trustTrend[metrics.trustTrend.length - 1] - metrics.trustTrend[0]).toFixed(2)}↑
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-rose-500" />
                    <span>
                      {t('profile.languageMix', 'தமிழ் content share')}: {metrics.languageUsage.find((lang) => lang.language === 'தமிழ்')?.percent ?? 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Card className="border border-orange-100 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    {t('profile.milestones', 'Next milestones')}
                  </h3>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {insights.badgesEarned}/{insights.badgesTotal} badges
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {insights.nextMilestones.map((milestone) => {
                    const progress = Math.min(100, Math.round((milestone.progress / milestone.target) * 100));
                    return (
                      <div key={milestone.id} className="rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{milestone.title}</p>
                            <p className="text-xs text-gray-500">
                              {progress}% • {milestone.progress}/{milestone.target}
                              {milestone.dueBy && ` • due ${new Date(milestone.dueBy).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}`}
                            </p>
                          </div>
                          <CircleOff className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-orange-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="border border-orange-100 bg-white/90 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  {t('profile.activeAreas', 'Active localities')}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={areaFilter ? 'outline' : 'default'}
                    className={areaFilter ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'bg-orange-500 text-white'}
                    onClick={() => setAreaFilter(null)}
                  >
                    {t('profile.allAreas', 'All Chennai')}
                  </Button>
                  {metrics.areasActive.map((item) => (
                    <Button
                      key={item.area}
                      size="sm"
                      variant={areaFilter === item.area ? 'default' : 'outline'}
                      className={
                        areaFilter === item.area
                          ? 'bg-orange-500 text-white'
                          : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                      }
                      onClick={() => setAreaFilter(areaFilter === item.area ? null : item.area)}
                    >
                      {item.area} • {item.contributions}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  {insights.recommendedGroups.map((group) => (
                    <div key={group} className="flex items-center gap-2 rounded-lg bg-orange-50/70 p-2">
                      <IllustratedIcon src={ChennaiIcons.community} alt={group} size="sm" fallbackEmoji="👥" />
                      <span>{group}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Card className="border border-orange-100 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    {t('profile.communitySignals', 'Community signals for you')}
                  </h3>
                  <Badge className="bg-orange-100 text-orange-700">
                    {recommendations.length}
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((item) => (
                      <Card key={item.id} className={`border ${item.sentiment === 'urgent' ? 'border-rose-200 bg-rose-50/80' : 'border-emerald-100 bg-emerald-50/70'} p-4 shadow-sm`}> 
                        <div className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-500">{item.area ?? t('profile.chennaiWide', 'Chennai wide')}</p>
                              <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                {item.sentiment === 'urgent' ? <ShieldCheck className="h-4 w-4 text-rose-500" /> : <Heart className="h-4 w-4 text-emerald-500" />}
                                {item.title}
                              </h4>
                            </div>
                            <Badge className={item.sentiment === 'urgent' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}>
                              {item.sentiment === 'urgent' ? t('profile.urgent', 'Urgent') : t('profile.impactful', 'Impactful')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {item.actionLabel && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1">
                                <Clock className="h-3 w-3" />
                                {item.actionLabel}
                              </span>
                            )}
                            {item.relatedBadgeId && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {item.relatedBadgeId}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => void handleCompleteRecommendation(item)} className="bg-orange-500 text-white hover:bg-orange-600">
                              <Check className="mr-1 h-4 w-4" />
                              {t('profile.markDone', 'Mark done')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => void dismissRecommendation(item.id)} className="border-orange-200 text-orange-600 hover:bg-orange-50">
                              <X className="mr-1 h-4 w-4" />
                              {t('profile.dismiss', 'Dismiss')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-center text-sm text-gray-500">
                      {t('profile.noSignals', 'No new recommendations right now. Check back soon!')}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border border-orange-100 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    {t('profile.recentActivity', 'Recent activity')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('activity')}
                    className="text-orange-600 hover:bg-orange-50"
                  >
                    {t('profile.viewAll', 'View all')}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 space-y-4">
                  {timelineToRender.length > 0 ? (
                    timelineToRender.map((item) => {
                      const { icon, emoji } = getTimelineIcon(item.type);
                      return (
                        <div key={`${item.timestamp}-${item.title}`} className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                          <IllustratedIcon src={icon} alt={item.title} size="sm" fallbackEmoji={emoji} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                              <span className="text-xs text-gray-500">{formatTimelineTimestamp(item.timestamp)}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-600">{item.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span className="rounded-full bg-white/70 px-3 py-1">{item.area}</span>
                              {item.points ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  +{item.points}
                                </span>
                              ) : null}
                              {item.sentiment && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                  {item.sentiment}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-center text-sm text-gray-500">
                      {t('profile.noActivity', 'No activity recorded yet. Complete recommendations to get started!')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="px-6 pt-6">
            <AchievementBadges userAchievements={achievementsForBadges} />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4 px-6 pt-6">
            {fullTimeline.map((item) => {
              const { icon, emoji } = getTimelineIcon(item.type);
              return (
                <Card key={`${item.timestamp}-${item.title}`} className="border border-orange-100 bg-white/90 p-4 shadow-sm">
                  <div className="flex gap-3">
                    <IllustratedIcon src={icon} alt={item.title} size="sm" fallbackEmoji={emoji} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                        <Badge className="bg-orange-50 text-orange-600 border-orange-200">
                          {formatTimelineTimestamp(item.timestamp)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-full bg-orange-50 px-3 py-1">{item.area}</span>
                        {item.points ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-yellow-700">
                            <Star className="h-3 w-3" />
                            +{item.points}
                          </span>
                        ) : null}
                        {item.sentiment && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                            <ShieldCheck className="h-3 w-3" />
                            {item.sentiment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4 px-6 pt-6">
            <AppHealthCheck />
            <DeploymentReadiness />
          </div>
        )}

        <div className="px-6 pt-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('profile.manageAccount', 'Manage account')}</h3>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Card
                key={item.label}
                onClick={item.action}
                className={`cursor-pointer border border-orange-100 bg-white/90 p-4 shadow-sm transition hover:scale-[1.01] hover:shadow-lg ${
                  item.isDestructive ? 'hover:border-rose-200 hover:bg-rose-50' : 'hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${item.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'} flex h-10 w-10 items-center justify-center rounded-xl text-lg`}>
                    {item.iconEmoji}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${item.isDestructive ? 'text-rose-600' : 'text-gray-900'}`}>{item.label}</h4>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.settings', 'Settings')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              {t('profile.settingsCopy', 'Manage privacy, notification, and language preferences. Full integration coming with the production backend.')}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                {t('profile.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showSafety} onOpenChange={setShowSafety}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.safety', 'Safety & Trust')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              {t('profile.safetyCopy', 'Review community guidelines and reporting tools. Chennai trust council oversees all reports.')}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSafety(false)}>
                {t('profile.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showImpact} onOpenChange={setShowImpact}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.impact', 'Your impact')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-600">
              <p>{t('profile.impactCopy', 'Track the tangible influence you have made across Chennai neighborhoods. Future updates will include downloadable reports.')}</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>• {t('profile.neighborsHelped', 'Neighbors helped')}: {metrics.neighborsHelped}</li>
                <li>• {t('profile.badgesEarned', 'Badges unlocked')}: {insights.badgesEarned}/{insights.badgesTotal}</li>
                <li>• {t('profile.communityHours', 'Community hours logged')}: {metrics.volunteerHours}</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImpact(false)}>
                {t('profile.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('profile.helpSupport', 'Help & support')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{t('profile.helpCopy', 'Need assistance? Reach us via email or explore the knowledge base.')}</p>
              <a className="text-orange-600" href="mailto:help@nammaooru.local">
                help@nammaooru.local
              </a>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHelp(false)}>
                {t('profile.close', 'Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
