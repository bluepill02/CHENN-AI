import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { IllustratedIcon, ChennaiIcons } from './IllustratedIcon';
import { MapPin, Star, Phone, Clock, Navigation } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLocation, getLocationSpecificContent } from '../services/LocationService';
import servicesMarketplace from 'figma:asset/4108c802b3e078fed252c2b3f591ce76fb2675b2.png';

interface LocalServicesProps {
  userLocation?: any;
}

export function LocalServices({ userLocation }: LocalServicesProps) {
  const { currentLocation, setLocationModalOpen } = useLocation();
  
  // Use location from context if available, otherwise use prop
  const activeLocation = currentLocation || userLocation;
  const locationContent = getLocationSpecificContent(activeLocation);
  const serviceCategories = [
    {
      iconSrc: ChennaiIcons.food,
      iconEmoji: '🍽️',
      name: 'சாப்பாடு • Mess/Hotels',
      color: 'from-orange-400 to-red-500',
      count: '127 அருகில்',
      description: 'Authentic தமிழ் food'
    },
    {
      iconSrc: ChennaiIcons.auto,
      iconEmoji: '🛺',
      name: 'Auto/Share • போக்குவரத்து',
      color: 'from-green-400 to-teal-500',
      count: '45 drivers',
      description: 'Trusted local drivers'
    },
    {
      iconSrc: ChennaiIcons.shop,
      iconEmoji: '🏪',
      name: 'கடைகள் • Local Shops',
      color: 'from-blue-400 to-purple-500',
      count: '89 கடைகள்',
      description: 'From groceries to silk'
    },
    {
      iconSrc: ChennaiIcons.repair,
      iconEmoji: '🔧',
      name: 'பழுது • Repairs',
      color: 'from-yellow-400 to-orange-500',
      count: '67 வேலை',
      description: 'Bike, cycle, electronics'
    },
    {
      iconSrc: ChennaiIcons.medical,
      iconEmoji: '🏥',
      name: 'மருத்துவம் • Healthcare',
      color: 'from-red-400 to-pink-500',
      count: '56 clinics',
      description: 'Tamil-speaking doctors'
    },
    {
      iconSrc: ChennaiIcons.education,
      iconEmoji: '📚',
      name: 'படிப்பு • Tuition',
      color: 'from-purple-400 to-pink-500',
      count: '34 centers',
      description: 'Tamil + English medium'
    }
  ];

  const featuredServices = [
    {
      id: 1,
      name: 'Raman Anna Auto Works',
      category: 'வாகன் பழுது • Vehicle Repair',
      location: 'Mylapore Main Road • மயிலாப்பூர்',
      rating: 4.8,
      distance: '300m',
      price: '₹200-500',
      isOpen: true,
      image: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      speciality: 'நம்பகமான service, 15 வருஷ அனுபவம்',
      trusted: true,
      language: 'தமிழ் + English',
      communityScore: '4.8/5'
    },
    {
      id: 2,
      name: 'சரஸ்வதி அம்மா Mess',
      category: 'Traditional Tamil Food',
      location: 'Luz Corner • லூஸ் கார்னர்',
      rating: 4.9,
      distance: '500m',
      price: '₹80-150',
      isOpen: true,
      image: 'https://images.unsplash.com/photo-1652595802737-56d08ad31f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      speciality: 'சூடான இட்லி, authentic கூட்டு, home taste',
      trusted: true,
      language: 'தமிழ் பேசுவார்கள்',
      communityScore: '4.9/5'
    },
    {
      id: 3,
      name: 'Dr. Lakshmi Clinic',
      category: 'Family Doctor • குடும்ப மருத்துவர்',
      location: 'Kapaleeshwarar Temple St',
      rating: 4.7,
      distance: '700m',
      price: '₹300-600',
      isOpen: false,
      image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      speciality: 'தமிழ்-ல பேசுவார், children specialist',
      trusted: true,
      language: 'தமிழ் + English',
      communityScore: '4.7/5'
    },
    {
      id: 4,
      name: 'Kumar Auto Share',
      category: 'Daily Commute • தினசரி பயணம்',
      location: 'T.Nagar to OMR Route',
      rating: 4.6,
      distance: '200m pickup',
      price: '₹80-120/day',
      isOpen: true,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
      speciality: 'Safe rides, women-friendly, AC auto',
      trusted: true,
      language: 'தமிழ் + हिंदी',
      communityScore: '4.6/5'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-orange-50 to-yellow-25 min-h-screen relative">
      {/* Services marketplace background */}
      <div className="fixed inset-0 opacity-15 md:opacity-10 pointer-events-none">
        <ImageWithFallback
          src={servicesMarketplace}
          alt="Chennai Services Marketplace"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-white text-2xl font-bold">நம்ம area சேவைகள் 🏪</h1>
            <div className="flex items-center gap-2">
              <p className="text-orange-100">
                {activeLocation ? `Services in ${activeLocation.area}` : 'Local services தமிழ் style-ல'}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-orange-200 hover:text-white hover:bg-white/10"
                onClick={() => setLocationModalOpen(true)}
              >
                <Navigation className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {activeLocation && (
            <>
              <span className="text-green-200 text-xs">🔒 Verified area only</span>
              <span className="text-orange-200 text-xs">•</span>
            </>
          )}
          <span className="text-yellow-200 text-xs">⭐ Community verified</span>
          <span className="text-orange-200 text-xs">•</span>
          <span className="text-orange-200 text-xs">Tamil-friendly</span>
        </div>
        
        {/* Search bar */}
        <div className="mt-4">
          <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <input 
              placeholder="இங்கே என்ன வேணும்? Search பண்ணுங்க..." 
              className="flex-1 outline-none text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Service categories */}
      <div className="px-6 py-6">
        <h2 className="mb-4">Categories</h2>
        <div className="grid grid-cols-2 gap-4">
          {serviceCategories.map((category, index) => (
            <Card key={index} className="p-4 bg-card backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105 shadow-orange-100/50">
              <div className="flex items-center justify-center mb-3">
                <IllustratedIcon 
                  src={category.iconSrc}
                  alt={category.name}
                  size="md"
                  fallbackEmoji={category.iconEmoji}
                  style="rounded"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{category.count}</p>
              <p className="text-xs text-gray-400">{category.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured services */}
      <div className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2>Trusted Nearby</h2>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            ✅ Community Verified
          </Badge>
        </div>
        
        <div className="space-y-4">
          {featuredServices.map((service) => (
            <Card key={service.id} className="p-4 bg-card border-orange-200 shadow-lg shadow-orange-100/50">
              <div className="flex gap-3">
                {/* Service image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Service details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.category}</p>
                    </div>
                    {service.trusted && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                        🌟 Trusted
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{service.location}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">{service.distance}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{service.rating}</span>
                    </div>
                    <span className="text-xs text-gray-600">{service.price}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${service.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                        {service.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">{service.speciality}</p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-orange-200 text-orange-600">
                      Direction
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}