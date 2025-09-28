import type { LocalityMetrics } from '../types/locality';

export const computeScore = (metrics: LocalityMetrics, weights?: Partial<Record<keyof LocalityMetrics, number>>) => {
  const defaultWeights: Record<keyof LocalityMetrics, number> = {
    liveability: 0.25,
    connectivity: 0.2,
    foodCulture: 0.25,
    affordability: 0.15,
    buzz: 0.15
  };
  const w = { ...defaultWeights, ...(weights || {}) } as Record<string, number>;
  const totalWeight = Object.values(w).reduce((s, v) => s + v, 0);
  const sum = (Object.keys(metrics) as (keyof LocalityMetrics)[]).reduce((acc, key) => acc + (metrics[key] * (w[key] || 0)), 0);
  return parseFloat((sum / totalWeight).toFixed(2));
};

// Returns rounded star count and the raw score
export const formatStars = (score: number) => {
  const rounded = Math.round(score);
  return { rounded, score };
};

export const bilingual = (en: string, ta: string) => ({ en, ta });

export default { computeScore, formatStars, bilingual };
