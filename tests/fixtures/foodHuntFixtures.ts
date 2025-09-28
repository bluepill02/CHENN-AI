import type { Dish, Vendor } from '../../types/foodhunt';

let vendorSequence = 1;
let dishSequence = 1;

export const buildDish = (overrides: Partial<Dish> = {}): Dish => ({
  id: overrides.id ?? `dish-${dishSequence++}`,
  nameEn: 'Mock Dish',
  nameTa: 'மாக் டிஷ்',
  price: 120,
  rating: 4.5,
  spicyLevel: 1,
  isSignature: true,
  tags: ['signature'],
  description: 'Test dish description',
  category: 'snack',
  availability: 'all-day',
  ...overrides,
});

export const buildVendor = (overrides: Partial<Vendor> = {}): Vendor => {
  const dishes = overrides.dishes ?? [buildDish()];
  const base: Vendor = {
    id: `vendor-${vendorSequence++}`,
    nameEn: 'Sample Vendor',
    nameTa: 'மாதிரி உணவகம்',
    areaEn: 'Adyar',
    areaTa: 'அடையார்',
    cuisines: ['South Indian'],
    vegType: 'veg',
    priceLevel: 2,
    rating: 4.2,
    openNow: true,
    distanceKm: 2.5,
    features: ['test-feature'],
    tags: ['test'],
    lastUpdated: new Date().toISOString(),
    dishes,
  };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id,
    dishes,
  };
};

export const resetFoodHuntSequences = () => {
  vendorSequence = 1;
  dishSequence = 1;
};
