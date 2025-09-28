
export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  location: string;
  rating: number;
  distance: string;
  price?: string;
  isOpen: boolean;
  image?: string;
  speciality?: string;
  trusted?: boolean;
  language?: string;
  communityScore?: string;
}

const STORAGE_KEY = 'chennai_services_v1';
let inMemoryStore: ServiceItem[] | null = null;

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: 'Raman Anna Auto Works',
    category: 'Vehicle Repair',
    location: 'Mylapore Main Road',
    rating: 4.8,
    distance: '300 m',
    price: '₹200-500',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Reliable service, 15 years experience',
    trusted: true,
    language: 'Tamil + English',
    communityScore: '4.8/5'
  },
  {
    id: 2,
    name: 'Saraswathi Amma Mess',
    category: 'Food',
    location: 'Luz Corner',
    rating: 4.9,
    distance: '500 m',
    price: '₹80-150',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1652595802737-56d08ad31f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Hot idli, authentic home taste',
    trusted: true,
    language: 'Tamil',
    communityScore: '4.9/5'
  },
  {
    id: 3,
    name: 'Dr. Lakshmi Clinic',
    category: 'Healthcare',
    location: 'Kapaleeshwarar Temple St',
    rating: 4.7,
    distance: '0.7 km',
    price: '₹300-600',
    isOpen: false,
    image:
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Children specialist',
    trusted: true,
    language: 'Tamil + English',
    communityScore: '4.7/5'
  },
  {
    id: 4,
    name: 'Chennai Home Tuitions',
    category: 'Education',
    location: 'Alwarpet 2nd Street',
    rating: 4.6,
    distance: '1.1 km',
    price: '₹400 per session',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Maths & Science — Std 6-10',
    trusted: true,
    language: 'Tamil + English',
    communityScore: '4.6/5'
  },
  {
    id: 5,
    name: 'Green Thumb Plant Studio',
    category: 'Home Services',
    location: 'Adyar LB Road',
    rating: 4.5,
    distance: '2.4 km',
    price: '₹150 onwards',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1459363870930-0e8b0c0c7044?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Balcony gardening setup & maintenance',
    trusted: false,
    language: 'Tamil + English',
    communityScore: '4.5/5'
  },
  {
    id: 6,
    name: 'Velachery Smart Laundry',
    category: 'Daily Needs',
    location: 'Velachery Main Road',
    rating: 4.3,
    distance: '3.2 km',
    price: '₹80 per kg',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1497534446932-c925b458314e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Same-day delivery, eco detergents',
    trusted: false,
    language: 'Tamil + English',
    communityScore: '4.3/5'
  },
  {
    id: 7,
    name: 'OMR Tech Repairs',
    category: 'Repairs',
    location: 'Thiruvanmiyur OMR Service Lane',
    rating: 4.4,
    distance: '2.9 km',
    price: '₹350 service fee',
    isOpen: false,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Laptop & mobile repairs at doorstep',
    trusted: true,
    language: 'Tamil + English',
    communityScore: '4.4/5'
  },
  {
    id: 8,
    name: 'Marina Yoga Collective',
    category: 'Wellness',
    location: 'Marina Beach Front Road',
    rating: 4.8,
    distance: '4.5 km',
    price: '₹500 per class',
    isOpen: true,
    image:
      'https://images.unsplash.com/photo-1540206276207-3af25c08fd38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    speciality: 'Sunrise yoga + pranayama',
    trusted: true,
    language: 'Tamil + English',
    communityScore: '4.8/5'
  }
];

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch (e) {
    return false;
  }
}

async function readStore(): Promise<ServiceItem[]> {
  if (!hasLocalStorage()) {
    if (!inMemoryStore) inMemoryStore = DEFAULT_SERVICES;
    return inMemoryStore;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(raw) as ServiceItem[];
  } catch (e) {
    console.error('ServiceDirectoryService: failed to read store', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
    return DEFAULT_SERVICES;
  }
}

async function writeStore(items: ServiceItem[]) {
  if (!hasLocalStorage()) {
    inMemoryStore = items;
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getAllServices(): Promise<ServiceItem[]> {
  const list = await readStore();
  return list.slice();
}

export async function replaceServices(items: ServiceItem[]) {
  await writeStore(items);
}

export async function getFeaturedServices(): Promise<ServiceItem[]> {
  const list = await readStore();
  return list
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

export async function getServiceById(id: number): Promise<ServiceItem | null> {
  const list = await readStore();
  const s = list.find(x => x.id === id) || null;
  return s;
}

export async function bookService(id: number, details: { name: string; phone?: string; time?: string }) {
  // Persist booking record in localStorage (separate key)
  try {
    const bookingsRaw = hasLocalStorage() ? localStorage.getItem('chennai_service_bookings_v1') : null;
    const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];
    const booking = { id: Date.now(), serviceId: id, ...details, createdAt: new Date().toISOString() };
    const next = [booking, ...bookings];
    if (hasLocalStorage()) localStorage.setItem('chennai_service_bookings_v1', JSON.stringify(next));
    else {
      // store in memory under inMemoryStoreBookings
      (globalThis as any).__CHENNAI_INMEMORY_BOOKINGS = next;
    }
    return booking;
  } catch (e) {
    console.error('Failed to book service', e);
    throw e;
  }
}

export async function contactService(id: number): Promise<{ ok: boolean; message: string }> {
  // Simulate contacting: return success if service exists
  const s = await getServiceById(id);
  if (!s) return { ok: false, message: 'Service not found' };
  return { ok: true, message: `Dialing ${s.name}...` };
}

export default {
  getAllServices,
  getFeaturedServices,
  getServiceById,
  bookService,
  contactService,
  replaceServices
};
