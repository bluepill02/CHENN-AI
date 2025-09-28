export interface UserProfile {
  id: string;
  name: string;
  about?: string;
  location?: string;
  trustScore?: string;
  connections?: number;
  postsShared?: number;
  eventsJoined?: number;
  badges?: Array<{ title: string; description: string; earned: boolean; rarity?: string }>;
}

const STORAGE_KEY = 'chennai_user_profile_v1';
let inMemoryUser: UserProfile | null = null;

const defaultUser: UserProfile = {
  id: 'user-1',
  name: 'Priya Raman',
  about: 'Born and raised in Chennai. Love exploring local food spots and helping neighbors.',
  location: 'Mylapore, Chennai',
  trustScore: '4.8',
  connections: 127,
  postsShared: 23,
  eventsJoined: 8,
  badges: [
    { title: 'நல்ல பக்கத்து வீட்டுக்காரர்', description: '10+ neighbors-க்கு உதவி செய்தது', earned: true, rarity: 'Common' },
    { title: 'சென்னை Food Expert', description: '5+ authentic food spots share', earned: true, rarity: 'Rare' },
    { title: 'Trust-ed Chennai-ite', description: '4.5+ நம்பிக்கை score', earned: true, rarity: 'Legendary' }
  ]
};

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

async function readUser(): Promise<UserProfile> {
  if (!hasLocalStorage()) {
    if (!inMemoryUser) inMemoryUser = { ...defaultUser };
    return inMemoryUser;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
      return { ...defaultUser };
    }
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.error('UserService: failed to read store', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUser));
    return { ...defaultUser };
  }
}

async function writeUser(user: UserProfile) {
  if (!hasLocalStorage()) {
    inMemoryUser = { ...user };
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<UserProfile> {
  return readUser();
}

export async function updateUser(patch: Partial<UserProfile>): Promise<UserProfile> {
  const current = await readUser();
  const updated = { ...current, ...patch };
  await writeUser(updated);
  return updated;
}

export default { getUser, updateUser };
