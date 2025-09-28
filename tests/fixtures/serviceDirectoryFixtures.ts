import type { ServiceItem } from '../../src/services/ServiceDirectoryService';

export const buildServiceItem = (overrides: Partial<ServiceItem> = {}): ServiceItem => ({
  id: 501,
  name: 'Test Chennai Service',
  category: 'Essentials',
  location: 'Alwarpet High Road',
  rating: 4.8,
  distance: '0.4 km',
  price: '₹150 - ₹250',
  isOpen: true,
  image: 'https://images.example.com/service.png',
  speciality: 'Mock speciality',
  trusted: true,
  language: 'Tamil + English',
  communityScore: '4.8/5',
  ...overrides,
});

export const buildServiceApiPayload = (
  overrides: Partial<ServiceItem> = {},
): ServiceItem => ({
  ...buildServiceItem(),
  ...overrides,
});
