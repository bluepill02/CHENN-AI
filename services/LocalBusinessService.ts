import { ChennaiIcons } from '../components/IllustratedIcon';

export interface ServiceCategory {
    id: string;
    name: string;
    iconSrc: string;
    iconEmoji: string;
    color: string;
    count: string;
    description: string;
}

export interface LocalBusiness {
    id: number;
    name: string;
    category: string;
    categoryId: string;
    location: string;
    rating: number;
    distance: string;
    price: string;
    isOpen: boolean;
    image: string;
    speciality: string;
    trusted: boolean;
    language: string;
    communityScore: string;
    phoneNumber: string;
    mapQuery: string;
}

const CATEGORIES: ServiceCategory[] = [
    {
        id: 'food',
        iconSrc: ChennaiIcons.food,
        iconEmoji: '🍽️',
        name: 'சாப்பாடு • Mess/Hotels',
        color: 'from-orange-400 to-red-500',
        count: '127 அருகில்',
        description: 'Authentic தமிழ் food'
    },
    {
        id: 'transport',
        iconSrc: ChennaiIcons.auto,
        iconEmoji: '🛺',
        name: 'Auto/Share • போக்குவரத்து',
        color: 'from-green-400 to-teal-500',
        count: '45 drivers',
        description: 'Trusted local drivers'
    },
    {
        id: 'shops',
        iconSrc: ChennaiIcons.shop,
        iconEmoji: '🏪',
        name: 'கடைகள் • Local Shops',
        color: 'from-blue-400 to-purple-500',
        count: '89 கடைகள்',
        description: 'From groceries to silk'
    },
    {
        id: 'repairs',
        iconSrc: ChennaiIcons.repair,
        iconEmoji: '🔧',
        name: 'பழுது • Repairs',
        color: 'from-yellow-400 to-orange-500',
        count: '67 வேலை',
        description: 'Bike, cycle, electronics'
    },
    {
        id: 'medical',
        iconSrc: ChennaiIcons.medical,
        iconEmoji: '🏥',
        name: 'மருத்துவம் • Healthcare',
        color: 'from-red-400 to-pink-500',
        count: '56 clinics',
        description: 'Tamil-speaking doctors'
    },
    {
        id: 'education',
        iconSrc: ChennaiIcons.education,
        iconEmoji: '📚',
        name: 'படிப்பு • Tuition',
        color: 'from-purple-400 to-pink-500',
        count: '34 centers',
        description: 'Tamil + English medium'
    }
];

const BUSINESSES: LocalBusiness[] = [
    {
        id: 1,
        name: 'Raman Anna Auto Works',
        category: 'வாகன் பழுது • Vehicle Repair',
        categoryId: 'repairs',
        location: 'Mylapore Main Road • மயிலாப்பூர்',
        rating: 4.8,
        distance: '300m',
        price: '₹200-500',
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'நம்பகமான service, 15 வருஷ அனுபவம்',
        trusted: true,
        language: 'தமிழ் + English',
        communityScore: '4.8/5',
        phoneNumber: '9876543210',
        mapQuery: 'Raman Auto Works Mylapore'
    },
    {
        id: 2,
        name: 'சரஸ்வதி அம்மா Mess',
        category: 'Traditional Tamil Food',
        categoryId: 'food',
        location: 'Luz Corner • லூஸ் கார்னர்',
        rating: 4.9,
        distance: '500m',
        price: '₹80-150',
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1652595802737-56d08ad31f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'சூடான இட்லி, authentic கூட்டு, home taste',
        trusted: true,
        language: 'தமிழ் பேசுவார்கள்',
        communityScore: '4.9/5',
        phoneNumber: '9876543211',
        mapQuery: 'Saraswathi Mess Luz Corner'
    },
    {
        id: 3,
        name: 'Dr. Lakshmi Clinic',
        category: 'Family Doctor • குடும்ப மருத்துவர்',
        categoryId: 'medical',
        location: 'Kapaleeshwarar Temple St',
        rating: 4.7,
        distance: '700m',
        price: '₹300-600',
        isOpen: false,
        image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'தமிழ்-ல பேசுவார், children specialist',
        trusted: true,
        language: 'தமிழ் + English',
        communityScore: '4.7/5',
        phoneNumber: '9876543212',
        mapQuery: 'Dr Lakshmi Clinic Mylapore'
    },
    {
        id: 4,
        name: 'Kumar Auto Share',
        category: 'Daily Commute • தினசரி பயணம்',
        categoryId: 'transport',
        location: 'T.Nagar to OMR Route',
        rating: 4.6,
        distance: '200m pickup',
        price: '₹80-120/day',
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'Safe rides, women-friendly, AC auto',
        trusted: true,
        language: 'தமிழ் + हिंदी',
        communityScore: '4.6/5',
        phoneNumber: '9876543213',
        mapQuery: 'T Nagar Bus Stand'
    },
    {
        id: 5,
        name: 'Devi Stores',
        category: 'Grocery & General',
        categoryId: 'shops',
        location: 'West Mambalam',
        rating: 4.5,
        distance: '1.2km',
        price: 'MRP',
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1604719312566-b7cb0463d344?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'Fresh vegetables, daily needs',
        trusted: true,
        language: 'தமிழ்',
        communityScore: '4.5/5',
        phoneNumber: '9876543214',
        mapQuery: 'Devi Stores West Mambalam'
    },
    {
        id: 6,
        name: 'Masterji Tuition Center',
        category: 'Maths & Science',
        categoryId: 'education',
        location: 'Adyar',
        rating: 4.9,
        distance: '2.5km',
        price: '₹1000/mo',
        isOpen: true,
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
        speciality: 'State board & CBSE, personal attention',
        trusted: true,
        language: 'English + தமிழ்',
        communityScore: '4.9/5',
        phoneNumber: '9876543215',
        mapQuery: 'Masterji Tuition Adyar'
    }
];

export const LocalBusinessService = {
    getCategories: () => CATEGORIES,

    getBusinesses: (categoryId?: string | null, query?: string) => {
        let results = BUSINESSES;

        if (categoryId) {
            results = results.filter(b => b.categoryId === categoryId);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(b =>
                b.name.toLowerCase().includes(lowerQuery) ||
                b.category.toLowerCase().includes(lowerQuery) ||
                b.location.toLowerCase().includes(lowerQuery) ||
                b.speciality.toLowerCase().includes(lowerQuery)
            );
        }

        return results;
    }
};
