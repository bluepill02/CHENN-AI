import {
    getUser as getUserLocal,
    updateUser as updateUserLocal,
    type UserProfile,
} from '../src/services/UserService';
import {
    FALLBACK_PROFILE,
    buildDefaultState,
    readStoredState,
    writeStoredState,
    type AchievementSummary,
    type ActivityItem,
    type ProfileDashboardStoredState,
    type ProfileInsights,
    type ProfileMetrics,
    type RecommendationItem,
} from './ProfileDashboardService';

export interface ProfileDashboardResponse {
  success: boolean;
  profile: UserProfile;
  metrics: ProfileMetrics;
  timeline: ActivityItem[];
  recommendations: RecommendationItem[];
  achievements: AchievementSummary[];
  insights: ProfileInsights;
  timestamp: string;
  source: 'simulation' | 'backend';
}

export interface ProfileUpdateResponse {
  success: boolean;
  profile: UserProfile;
  timestamp: string;
}

export interface ProfileActivityResponse {
  success: boolean;
  timeline: ActivityItem[];
  metrics: ProfileMetrics;
  timestamp: string;
}

export interface RecommendationDismissResponse {
  success: boolean;
  recommendations: RecommendationItem[];
  timestamp: string;
}

async function loadStateForUser(user: UserProfile | null): Promise<ProfileDashboardStoredState> {
  const stored = await readStoredState();
  if (stored) {
    return stored;
  }
  const baseUser = user ?? FALLBACK_PROFILE;
  const fallback = buildDefaultState(baseUser);
  await writeStoredState(fallback);
  return fallback;
}

export async function handleProfileDashboardRequest(): Promise<ProfileDashboardResponse> {
  const user = await getUserLocal().catch(() => FALLBACK_PROFILE);
  const state = await loadStateForUser(user);

  return {
    success: true,
    profile: user ?? FALLBACK_PROFILE,
    metrics: state.metrics,
    timeline: state.timeline,
    recommendations: state.recommendations,
    achievements: state.achievements,
    insights: state.insights,
    timestamp: new Date().toISOString(),
    source: 'simulation',
  };
}

export async function handleProfileUpdateRequest(patch: Partial<UserProfile>): Promise<ProfileUpdateResponse> {
  const updated = await updateUserLocal(patch);
  const state = await loadStateForUser(updated);
  await writeStoredState({ ...state, updatedAt: new Date().toISOString() });

  return {
    success: true,
    profile: updated,
    timestamp: new Date().toISOString(),
  };
}

function updateStateWithActivity(
  state: ProfileDashboardStoredState,
  entry: ActivityItem,
): ProfileDashboardStoredState {
  const updatedTimeline = [entry, ...state.timeline].slice(0, 50);
  const existingWeekly = state.metrics.weeklyActivity.length
    ? state.metrics.weeklyActivity
    : [0, 0, 0, 0, 0, 0, 0];
  const shiftedWeekly = existingWeekly.slice(1);
  const nextWeekly = [...shiftedWeekly, (existingWeekly[existingWeekly.length - 1] ?? 0) + 1];

  const existingAreaIndex = state.metrics.areasActive.findIndex((item) => item.area === entry.area);
  let areasActive = state.metrics.areasActive;
  if (existingAreaIndex >= 0) {
    const clone = [...areasActive];
    clone[existingAreaIndex] = {
      ...clone[existingAreaIndex],
      contributions: clone[existingAreaIndex].contributions + 1,
      lastActive: entry.timestamp,
    };
    areasActive = clone;
  } else {
    areasActive = [
      { area: entry.area, contributions: 1, lastActive: entry.timestamp },
      ...areasActive,
    ].slice(0, 5);
  }

  const metrics: ProfileMetrics = {
    ...state.metrics,
    neighborsHelped: entry.type === 'help' ? state.metrics.neighborsHelped + 1 : state.metrics.neighborsHelped,
    communityPoints: state.metrics.communityPoints + (entry.points ?? 25),
    weeklyActivity: nextWeekly,
    areasActive,
  };

  return {
    ...state,
    metrics,
    timeline: updatedTimeline,
    updatedAt: entry.timestamp,
  };
}

export async function handleProfileActivityRequest(entry: ActivityItem): Promise<ProfileActivityResponse> {
  const state = await loadStateForUser(null);
  const enrichedEntry: ActivityItem = {
    ...entry,
    id: entry.id || `activity-${Date.now()}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
    points: entry.points ?? 25,
  };
  const updatedState = updateStateWithActivity(state, enrichedEntry);
  await writeStoredState(updatedState);

  return {
    success: true,
    timeline: updatedState.timeline,
    metrics: updatedState.metrics,
    timestamp: updatedState.updatedAt,
  };
}

export async function handleRecommendationDismissRequest(id: string): Promise<RecommendationDismissResponse> {
  const state = await loadStateForUser(null);
  const updatedState: ProfileDashboardStoredState = {
    ...state,
    recommendations: state.recommendations.filter((recommendation) => recommendation.id !== id),
    updatedAt: new Date().toISOString(),
  };
  await writeStoredState(updatedState);

  return {
    success: true,
    recommendations: updatedState.recommendations,
    timestamp: updatedState.updatedAt,
  };
}
