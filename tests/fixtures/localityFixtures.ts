import { computeLocalityScore } from '../../src/data/localities';
import type { Locality, LocalityMetrics, LocalitySuggestion } from '../../src/types/locality';

let localitySequence = 0;
let suggestionSequence = 0;

const defaultMetrics: LocalityMetrics = {
  liveability: 4.2,
  connectivity: 4.0,
  foodCulture: 4.1,
  affordability: 3.8,
  buzz: 4.0,
};

export const resetLocalitySequences = () => {
  localitySequence = 0;
  suggestionSequence = 0;
};

export const buildLocality = (overrides: Partial<Locality> = {}): Locality => {
  const metrics = overrides.metrics ?? { ...defaultMetrics };
  const id = overrides.id ?? `locality-${++localitySequence}`;

  const base: Locality = {
    id,
    nameEn: overrides.nameEn ?? `Locality ${localitySequence}`,
    nameTa: overrides.nameTa ?? `பகுதி ${localitySequence}`,
    metrics,
    sources: overrides.sources ?? ['Community'],
    highlights: overrides.highlights ?? ['Transit friendly', 'Family focus'],
    description: overrides.description ?? `Enga area snapshot for ${id}.`,
    descriptionTa: overrides.descriptionTa ?? 'எங்கள் பகுதி விவரம்',
    score:
      overrides.score ?? Number(computeLocalityScore(metrics).toFixed(1)),
    popularSpots: overrides.popularSpots ?? ['Local market'],
    sampleTweets: overrides.sampleTweets ?? [],
    pincode: overrides.pincode ?? '600001',
    ...overrides,
  };

  if (overrides.metrics && overrides.score === undefined) {
    base.score = Number(computeLocalityScore(overrides.metrics).toFixed(1));
  }

  return base;
};

export const buildLocalitySuggestion = (
  overrides: Partial<LocalitySuggestion> = {}
): LocalitySuggestion => {
  const id = overrides.id ?? `suggestion-${++suggestionSequence}`;
  return {
    id,
    nameEn: overrides.nameEn ?? `Idea ${suggestionSequence}`,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    status: overrides.status ?? 'pending',
    notes: overrides.notes,
    submittedBy: overrides.submittedBy ?? 'Local resident',
    pincode: overrides.pincode ?? '600001',
    sources: overrides.sources ?? ['community'],
    highlights: overrides.highlights ?? ['Cultural hub'],
    ...overrides,
  };
};
