import { chennaiLocalities, computeLocalityScore } from '../data/localities';
import type { Locality } from '../types/locality';

const STORAGE_KEY = 'chennai_localities_v1';
let inMemoryStore: Locality[] | null = null;

function seedLocalities() {
  return chennaiLocalities.map(l => ({ ...l, score: computeLocalityScore(l.metrics) }));
}

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

async function readStore(): Promise<Locality[]> {
  const initial = seedLocalities();
  if (!hasLocalStorage()) {
    if (!inMemoryStore) inMemoryStore = initial;
    return inMemoryStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Locality[];
  } catch (e) {
    console.error('LocalityService: failed to read store, seeding defaults', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

async function writeStore(localities: Locality[]) {
  if (!hasLocalStorage()) {
    inMemoryStore = localities;
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localities));
}

export async function getLocalities(): Promise<Locality[]> {
  // Future: if API URL configured, call remote endpoint here
  return readStore();
}

export async function replaceLocalities(localities: Locality[]): Promise<void> {
  await writeStore(localities);
  if (!hasLocalStorage()) {
    inMemoryStore = localities;
  }
}

export async function rateLocality(id: string, rating: number): Promise<Locality | null> {
  const list = await readStore();
  const idx = list.findIndex(l => l.id === id);
  if (idx === -1) return null;

  const target = list[idx];

  // Simple blending strategy: incorporate rating into liveability and recompute score
  const blendedLiveability = Math.max(1, Math.min(5, (target.metrics.liveability + rating) / 2));
  const updatedMetrics = { ...target.metrics, liveability: Number(blendedLiveability.toFixed(1)) };
  const updatedScore = computeLocalityScore(updatedMetrics);

  const updated: Locality = { ...target, metrics: updatedMetrics, score: Number(updatedScore.toFixed(1)) };
  const newList = [...list];
  newList[idx] = updated;
  await writeStore(newList);
  return updated;
}

export async function addLocality(payload: Partial<Locality> & { id: string; nameEn: string; nameTa?: string }) {
  const list = await readStore();
  const metrics = payload.metrics ?? { liveability: 3, connectivity: 3, foodCulture: 3, affordability: 3, buzz: 3 };
  const newLocality: Locality = {
    id: payload.id,
    nameEn: payload.nameEn,
    nameTa: payload.nameTa ?? payload.nameEn,
    metrics,
    sources: payload.sources ?? ['manual'],
    score: computeLocalityScore(metrics),
    description: payload.description ?? '',
    descriptionTa: payload.descriptionTa ?? '',
    highlights: payload.highlights ?? [],
    sampleTweets: payload.sampleTweets ?? [],
    pincode: payload.pincode ?? '',
    popularSpots: payload.popularSpots ?? [],
  } as Locality;

  const newList = [newLocality, ...list];
  await writeStore(newList);
  return newLocality;
}

export default {
  getLocalities,
  rateLocality,
  addLocality,
  replaceLocalities,
};
