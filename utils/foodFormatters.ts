export const formatRupees = (amount: number) => {
  if (amount >= 1000) return `₹${Math.round(amount)}`;
  return `₹${amount}`;
};

export const formatDistance = (km: number) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const spicyToEmoji = (level: number) => {
  if (!level) return '—';
  return '🌶️'.repeat(Math.min(3, Math.max(0, level)));
};

export const priceLevelToSymbols = (level: number) => {
  return '₹'.repeat(level);
};

export const clamp = (v:number, a=0, b=5) => Math.min(b, Math.max(a, v));
