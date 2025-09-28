import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    getUser as getUserLocal,
    updateUser as updateUserLocal,
    type UserProfile,
} from '../src/services/UserService';

export type ActivityType = 'post' | 'help' | 'event' | 'achievement' | 'safety';
export type RecommendationSentiment = 'positive' | 'neutral' | 'urgent';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  area: string;
  timestamp: string;
  impact: string;
  points: number;
  sentiment: RecommendationSentiment;
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  sentiment: RecommendationSentiment;
  actionLabel?: string;
  area?: string;
  relatedBadgeId?: string;
}

export interface AchievementSummary {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  rarity: AchievementRarity;
  progress: number;
  target: number;
  earned: boolean;
  category: 'community' | 'trust' | 'culture' | 'sustainability';
  lastUpdated: string;
}

export interface ProfileMetrics {
  trustScore: number;
  connections: number;
  postsShared: number;
  eventsJoined: number;
  neighborsHelped: number;
  volunteerHours: number;
  communityPoints: number;
  responseRate: number;
  trustTrend: number[];
  weeklyActivity: number[];
  impactBreakdown: Array<{ label: string; value: number }>;
  languageUsage: Array<{ language: string; percent: number }>;
  areasActive: Array<{ area: string; contributions: number; lastActive: string }>;
}

export interface ProfileInsights {
  highlight: string;
  nextMilestones: Array<{ id: string; title: string; progress: number; target: number; dueBy?: string }>;
  badgesEarned: number;
  badgesTotal: number;
  topBadge?: AchievementSummary;
  recommendedGroups: string[];
}

interface ProfileDashboardState {
  metrics: ProfileMetrics;
  timeline: ActivityItem[];
  recommendations: RecommendationItem[];
  achievements: AchievementSummary[];
  insights: ProfileInsights;
}

export interface ProfileDashboardStoredState extends ProfileDashboardState {
  updatedAt: string;
}

export interface RecordActivityPayload {
  type: ActivityType;
  title: string;
  description: string;
  area: string;
  impact: string;
  points?: number;
  sentiment?: RecommendationSentiment;
}

export interface ProfileDashboardContextValue {
  profile: UserProfile | null;
  metrics: ProfileMetrics;
  insights: ProfileInsights;
  achievements: AchievementSummary[];
  timeline: ActivityItem[];
  fullTimeline: ActivityItem[];
  recommendations: RecommendationItem[];
  areaFilter: string | null;
  setAreaFilter: (area: string | null) => void;
  loading: boolean;
  error: string | null;
  isUsingBackend: boolean;
  lastSync: Date | null;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  recordActivity: (payload: RecordActivityPayload) => Promise<void>;
  dismissRecommendation: (id: string) => Promise<void>;
}

interface ProfileDashboardProviderProps {
  children: ReactNode;
  initialArea?: string | null;
}

const STORAGE_STATE_KEY = 'chennai_profile_dashboard_state_v1';
export const FALLBACK_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Priya Raman',
  about: 'Born and raised in Chennai. Love exploring local food spots and helping neighbors.',
  location: 'Mylapore, Chennai',
  trustScore: '4.8',
  connections: 127,
  postsShared: 23,
  eventsJoined: 8,
  badges: [
    {
      title: 'நல்ல பக்கத்து வீட்டுக்காரர்',
      description: '10+ neighbors-க்கு உதவி செய்தது',
      earned: true,
      rarity: 'Common',
    },
    {
      title: 'சென்னை Food Expert',
      description: '5+ authentic food spots share',
      earned: true,
      rarity: 'Rare',
    },
    {
      title: 'Trust-ed Chennai-ite',
      description: '4.5+ நம்பிக்கை score',
      earned: true,
      rarity: 'Legendary',
    },
  ],
};

let inMemoryState: ProfileDashboardStoredState | null = null;

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (error) {
    return false;
  }
}

export async function readStoredState(): Promise<ProfileDashboardStoredState | null> {
  if (!hasLocalStorage()) {
    return inMemoryState;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_STATE_KEY);
    if (!raw) {
      return null;
    }
  return JSON.parse(raw) as ProfileDashboardStoredState;
  } catch (error) {
    console.warn('[ProfileDashboard] Failed to read dashboard state', error);
    return null;
  }
}

export async function writeStoredState(state: ProfileDashboardStoredState) {
  if (!hasLocalStorage()) {
    inMemoryState = state;
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('[ProfileDashboard] Failed to persist dashboard state', error);
  }
}

export function buildDefaultState(user: UserProfile = FALLBACK_PROFILE): ProfileDashboardStoredState {
  const achievements: AchievementSummary[] = [
    {
      id: 'trust-builder',
      title: 'Trust Builder',
      subtitle: 'Maintained 4.8+ trust score for 30 days',
      icon: '🛡️',
      rarity: 'epic',
      progress: 28,
      target: 30,
      earned: true,
      category: 'trust',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'local-explorer',
      title: 'Local Explorer',
      subtitle: 'Visited and reviewed 15 local businesses',
      icon: '🗺️',
      rarity: 'rare',
      progress: 12,
      target: 15,
      earned: false,
      category: 'community',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'tamil-pride',
      title: 'தமிழ் பெருமை',
      subtitle: 'Used Tamil in 50 posts or messages',
      icon: '🏛️',
      rarity: 'epic',
      progress: 34,
      target: 50,
      earned: false,
      category: 'culture',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'marina-guardian',
      title: 'Marina Guardian',
      subtitle: 'Participated in 5 beach cleanup drives',
      icon: '🌊',
      rarity: 'rare',
      progress: 4,
      target: 5,
      earned: false,
      category: 'sustainability',
      lastUpdated: new Date().toISOString(),
    },
  ];

  const timeline: ActivityItem[] = [
    {
      id: 'activity-1',
      type: 'help',
      title: 'Coordinated electrician help for Mylapore street',
      description: 'Resolved wiring issues for 3 households within 2 hours.',
      area: 'Mylapore',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      impact: 'Neighbors appreciated quick response',
      points: 45,
      sentiment: 'positive',
    },
    {
      id: 'activity-2',
      type: 'event',
      title: 'Hosted Kapaleeshwarar temple heritage walk',
      description: 'Guided 25 residents through cultural history.',
      area: 'Mylapore',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      impact: 'Community culture score boosted',
      points: 60,
      sentiment: 'positive',
    },
    {
      id: 'activity-3',
      type: 'post',
      title: 'Shared rain preparedness checklist',
      description: 'Over 80 views and 12 shares in 24 hours.',
      area: 'Chennai Central',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      impact: 'Helped residents plan during monsoon showers',
      points: 35,
      sentiment: 'neutral',
    },
    {
      id: 'activity-4',
      type: 'help',
      title: 'Coordinated medical support for senior citizen',
      description: 'Arranged transportation to hospital within 30 minutes.',
      area: 'Adyar',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      impact: 'Medical assistance delivered on time',
      points: 50,
      sentiment: 'urgent',
    },
  ];

  const recommendations: RecommendationItem[] = [
    {
      id: 'reco-1',
      title: 'Share flood preparedness tips for OMR',
      description: 'Residents near Sholinganallur requested info after yesterday’s alert.',
      sentiment: 'urgent',
      actionLabel: 'Create post',
      area: 'OMR Corridor',
      relatedBadgeId: 'trust-builder',
    },
    {
      id: 'reco-2',
      title: 'Congratulate Anna Nagar Foodies',
      description: 'They crossed 5k members—your shoutout can boost engagement.',
      sentiment: 'positive',
      actionLabel: 'Send message',
      area: 'Anna Nagar',
    },
    {
      id: 'reco-3',
      title: 'Plan community cleanup at Marina',
      description: 'Only one more drive needed to unlock Marina Guardian badge.',
      sentiment: 'neutral',
      actionLabel: 'Schedule event',
      area: 'Marina Beach',
      relatedBadgeId: 'marina-guardian',
    },
  ];

  const metrics: ProfileMetrics = {
    trustScore: Number(user.trustScore ?? 4.8),
    connections: user.connections ?? 127,
    postsShared: user.postsShared ?? 23,
    eventsJoined: user.eventsJoined ?? 8,
    neighborsHelped: 19,
    volunteerHours: 42,
    communityPoints: 1840,
    responseRate: 0.93,
    trustTrend: [4.2, 4.4, 4.5, 4.6, 4.7, 4.75, Number(user.trustScore ?? 4.8)],
    weeklyActivity: [12, 18, 9, 15, 22, 28, 24],
    impactBreakdown: [
      { label: 'Community Help', value: 45 },
      { label: 'Events & Culture', value: 30 },
      { label: 'Safety Alerts', value: 15 },
      { label: 'Local Reviews', value: 10 },
    ],
    languageUsage: [
      { language: 'தமிழ்', percent: 58 },
      { language: 'English', percent: 22 },
      { language: 'Bilingual', percent: 20 },
    ],
    areasActive: [
      {
        area: 'Mylapore',
        contributions: 18,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
      {
        area: 'Anna Nagar',
        contributions: 9,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      },
      {
        area: 'Marina Beach',
        contributions: 7,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
  };

  const insights: ProfileInsights = {
    highlight: 'Neighbors rate you 4.8/5 and often mention your quick response time.',
    nextMilestones: [
      {
        id: 'trust-500',
        title: 'Reach 5.0 trust score',
        progress: Number(user.trustScore ?? 4.8),
        target: 5,
      },
      {
        id: 'events-10',
        title: 'Host 10 cultural events this year',
        progress: user.eventsJoined ?? 8,
        target: 10,
        dueBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
      },
      {
        id: 'cleanup-5',
        title: 'Complete Marina Guardian badge',
        progress: 4,
        target: 5,
        dueBy: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      },
    ],
    badgesEarned: achievements.filter((achievement) => achievement.earned).length,
    badgesTotal: achievements.length,
    topBadge: achievements.find((achievement) => achievement.rarity === 'legendary' && achievement.earned) ??
      achievements[0],
    recommendedGroups: [
      'Mylapore Street Guardians',
      'Namma Chennai Foodies',
      'Neighborhood Safety Circle',
    ],
  };

  return {
    metrics,
    timeline,
    recommendations,
    achievements,
    insights,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeProfile(payload: any): UserProfile {
  if (!payload || typeof payload !== 'object') {
    return { ...FALLBACK_PROFILE };
  }
  const profile: UserProfile = {
    id: String(payload.id ?? FALLBACK_PROFILE.id ?? 'user-1'),
    name: String(payload.name ?? FALLBACK_PROFILE.name ?? 'Chennai Citizen'),
    about: payload.about ?? FALLBACK_PROFILE.about,
    location: payload.location ?? FALLBACK_PROFILE.location,
    trustScore: payload.trustScore ?? FALLBACK_PROFILE.trustScore,
    connections: normalizeNumber(payload.connections, FALLBACK_PROFILE.connections ?? 0),
    postsShared: normalizeNumber(payload.postsShared, FALLBACK_PROFILE.postsShared ?? 0),
    eventsJoined: normalizeNumber(payload.eventsJoined, FALLBACK_PROFILE.eventsJoined ?? 0),
    badges: Array.isArray(payload.badges) ? payload.badges : FALLBACK_PROFILE.badges,
  };
  return profile;
}

function normalizeDashboardPayload(
  payload: any,
  fallbackState: ProfileDashboardStoredState,
  fallbackProfile: UserProfile,
) {
  if (!payload || typeof payload !== 'object') {
    return { state: fallbackState, profile: fallbackProfile };
  }

  const profile = normalizeProfile(payload.profile ?? payload.user ?? fallbackProfile);

  const metricsPayload = payload.metrics ?? {};
  const metrics: ProfileMetrics = {
    trustScore: normalizeNumber(metricsPayload.trustScore, fallbackState.metrics.trustScore),
    connections: normalizeNumber(metricsPayload.connections, fallbackState.metrics.connections),
    postsShared: normalizeNumber(metricsPayload.postsShared, fallbackState.metrics.postsShared),
    eventsJoined: normalizeNumber(metricsPayload.eventsJoined, fallbackState.metrics.eventsJoined),
    neighborsHelped: normalizeNumber(metricsPayload.neighborsHelped, fallbackState.metrics.neighborsHelped),
    volunteerHours: normalizeNumber(metricsPayload.volunteerHours, fallbackState.metrics.volunteerHours),
    communityPoints: normalizeNumber(metricsPayload.communityPoints, fallbackState.metrics.communityPoints),
    responseRate: normalizeNumber(metricsPayload.responseRate, fallbackState.metrics.responseRate),
    trustTrend: normalizeArray(metricsPayload.trustTrend, fallbackState.metrics.trustTrend),
    weeklyActivity: normalizeArray(metricsPayload.weeklyActivity, fallbackState.metrics.weeklyActivity),
    impactBreakdown: normalizeArray(metricsPayload.impactBreakdown, fallbackState.metrics.impactBreakdown),
    languageUsage: normalizeArray(metricsPayload.languageUsage, fallbackState.metrics.languageUsage),
    areasActive: normalizeArray(metricsPayload.areasActive, fallbackState.metrics.areasActive),
  };

  const timeline = normalizeArray<ActivityItem>(payload.timeline, fallbackState.timeline);
  const recommendations = normalizeArray<RecommendationItem>(payload.recommendations, fallbackState.recommendations);
  const achievements = normalizeArray<AchievementSummary>(payload.achievements, fallbackState.achievements);
  const insightsPayload = payload.insights ?? {};

  const insights: ProfileInsights = {
    highlight: typeof insightsPayload.highlight === 'string'
      ? insightsPayload.highlight
      : fallbackState.insights.highlight,
    nextMilestones: normalizeArray(insightsPayload.nextMilestones, fallbackState.insights.nextMilestones),
    badgesEarned: normalizeNumber(insightsPayload.badgesEarned, fallbackState.insights.badgesEarned),
    badgesTotal: normalizeNumber(insightsPayload.badgesTotal, fallbackState.insights.badgesTotal),
    topBadge: (insightsPayload.topBadge as AchievementSummary | undefined) ?? fallbackState.insights.topBadge,
    recommendedGroups: normalizeArray(
      insightsPayload.recommendedGroups,
      fallbackState.insights.recommendedGroups,
    ),
  };

  const state: ProfileDashboardStoredState = {
    metrics,
    timeline,
    recommendations,
    achievements,
    insights,
    updatedAt: new Date().toISOString(),
  };

  return { state, profile };
}

const ProfileDashboardContext = createContext<ProfileDashboardContextValue | undefined>(undefined);

export function ProfileDashboardProvider({ children, initialArea = null }: ProfileDashboardProviderProps) {
  const [profile, setProfile] = useState<UserProfile | null>(FALLBACK_PROFILE);
  const [state, setState] = useState<ProfileDashboardStoredState>(() => buildDefaultState(FALLBACK_PROFILE));
  const [areaFilter, setAreaFilter] = useState<string | null>(initialArea);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const hasMountedRef = useRef(false);

  const filteredTimeline = useMemo(() => {
    if (!areaFilter) {
      return state.timeline;
    }
    const lowered = areaFilter.toLowerCase();
  return state.timeline.filter((entry: ActivityItem) => entry.area.toLowerCase().includes(lowered));
  }, [state.timeline, areaFilter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/dashboard');
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
      const payload = await response.json();

  const fallbackState = buildDefaultState(profile ?? FALLBACK_PROFILE);
  const normalized = normalizeDashboardPayload(payload, fallbackState, profile ?? FALLBACK_PROFILE);

      setProfile(normalized.profile);
      setState(normalized.state);
      setIsUsingBackend(true);
      setLastSync(new Date());

      await updateUserLocal(normalized.profile);
      await writeStoredState({ ...normalized.state, updatedAt: new Date().toISOString() });
    } catch (backendError) {
      console.warn('[ProfileDashboard] Falling back to Chennai community snapshot', backendError);

      try {
        const { handleProfileDashboardRequest } = await import('./ProfileApiHandler');
        const simulated = await handleProfileDashboardRequest();
        const fallbackState = buildDefaultState(simulated.profile ?? FALLBACK_PROFILE);
        const normalized = normalizeDashboardPayload(simulated, fallbackState, simulated.profile ?? FALLBACK_PROFILE);
        setProfile(normalized.profile);
        setState(normalized.state);
        setIsUsingBackend(false);
        setLastSync(new Date());
        await writeStoredState({ ...normalized.state, updatedAt: new Date().toISOString() });
        setError('Profile services using Chennai simulation snapshot.');
        return;
      } catch (simulationError) {
        console.warn('[ProfileDashboard] Simulation API unavailable, using stored snapshot', simulationError);
      }

      const localProfile = await getUserLocal().catch(() => FALLBACK_PROFILE);
      const stored = (await readStoredState()) ?? buildDefaultState(localProfile ?? FALLBACK_PROFILE);

      setProfile(localProfile ?? FALLBACK_PROFILE);
      setState(stored);
      setIsUsingBackend(false);
      setLastSync(new Date());
      setError('Profile services offline. Showing the latest saved Chennai snapshot.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    setProfile((current) => (current ? { ...current, ...patch } : current));

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
      const payload = await response.json();
      const normalized = normalizeProfile(payload?.profile ?? payload);
      setProfile(normalized);
      await updateUserLocal(normalized);
      setIsUsingBackend(true);
      setLastSync(new Date());
    } catch (backendError) {
      console.warn('[ProfileDashboard] Profile update stored locally', backendError);
      const updated = await updateUserLocal(patch);
      setProfile(updated);
      setIsUsingBackend(false);
      setLastSync(new Date());
      setError('Profile changes will sync when Chennai services reconnect.');
    }
  }, []);

  const recordActivity = useCallback(async (payload: RecordActivityPayload) => {
    const nextEntry: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: payload.type,
      title: payload.title,
      description: payload.description,
      area: payload.area,
      timestamp: new Date().toISOString(),
      impact: payload.impact,
      points: payload.points ?? 25,
      sentiment: payload.sentiment ?? 'positive',
    };

  setState((current: ProfileDashboardStoredState) => {
      const updatedTimeline = [nextEntry, ...current.timeline].slice(0, 50);
      const existingWeekly = current.metrics.weeklyActivity.length
        ? current.metrics.weeklyActivity
        : [0, 0, 0, 0, 0, 0, 0];
      const shiftedWeekly = existingWeekly.slice(1);
      const nextWeekly = [...shiftedWeekly, (existingWeekly[existingWeekly.length - 1] ?? 0) + 1];

      const updatedMetrics: ProfileMetrics = {
        ...current.metrics,
        neighborsHelped:
          payload.type === 'help'
            ? current.metrics.neighborsHelped + 1
            : current.metrics.neighborsHelped,
        communityPoints: current.metrics.communityPoints + (payload.points ?? 25),
        weeklyActivity: nextWeekly,
        areasActive: (() => {
          const existingIndex = current.metrics.areasActive.findIndex(
            (entry: { area: string }) => entry.area === payload.area,
          );
          if (existingIndex >= 0) {
            const clone = [...current.metrics.areasActive];
            clone[existingIndex] = {
              ...clone[existingIndex],
              contributions: clone[existingIndex].contributions + 1,
              lastActive: nextEntry.timestamp,
            };
            return clone;
          }
          return [
            {
              area: payload.area,
              contributions: 1,
              lastActive: nextEntry.timestamp,
            },
            ...current.metrics.areasActive,
          ].slice(0, 5);
        })(),
      };

  const updatedState: ProfileDashboardStoredState = {
        ...current,
        metrics: updatedMetrics,
        timeline: updatedTimeline,
        recommendations: current.recommendations,
        updatedAt: new Date().toISOString(),
      };

      void writeStoredState(updatedState);
      return updatedState;
    });

    try {
      const response = await fetch('/api/profile/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextEntry),
      });
      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }
      setIsUsingBackend(true);
      setLastSync(new Date());
    } catch (backendError) {
      console.warn('[ProfileDashboard] Activity queued for sync', backendError);
      setIsUsingBackend(false);
    }
  }, []);

  const dismissRecommendation = useCallback(async (id: string) => {
    setState((current: ProfileDashboardStoredState) => {
      const updatedRecommendations = current.recommendations.filter(
        (recommendation: RecommendationItem) => recommendation.id !== id,
      );
      const updatedState: ProfileDashboardStoredState = {
        ...current,
        recommendations: updatedRecommendations,
        updatedAt: new Date().toISOString(),
      };
      void writeStoredState(updatedState);
      return updatedState;
    });

    try {
      await fetch(`/api/profile/recommendations/${id}`, { method: 'DELETE' });
    } catch (backendError) {
      console.warn('[ProfileDashboard] Recommendation dismissal stored locally', backendError);
    }
  }, []);

  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }
    hasMountedRef.current = true;

    (async () => {
      const stored = await readStoredState();
      if (stored) {
        setState(stored);
      }
      const localProfile = await getUserLocal().catch(() => FALLBACK_PROFILE);
      setProfile(localProfile ?? FALLBACK_PROFILE);
      await refresh();
    })();
  }, [refresh]);

  const value: ProfileDashboardContextValue = {
    profile,
    metrics: state.metrics,
    insights: state.insights,
    achievements: state.achievements,
    timeline: filteredTimeline,
    fullTimeline: state.timeline,
    recommendations: state.recommendations,
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
  };

  return <ProfileDashboardContext.Provider value={value}>{children}</ProfileDashboardContext.Provider>;
}

export function useProfileDashboard() {
  const context = useContext(ProfileDashboardContext);
  if (!context) {
    throw new Error('useProfileDashboard must be used within a ProfileDashboardProvider');
  }
  return context;
}

export default ProfileDashboardProvider;
