import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChennaiIcons } from './IllustratedIcon';
import { PremiumIcon } from './PremiumIcons';
import { MapPin, Star, Phone, Navigation, Search, X, Plus, ShieldCheck, Briefcase, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLocation } from '../services/LocationService';
import { BusinessService, type BusinessProfile } from '../services/BusinessService';
import { useAuth } from './auth/SupabaseAuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ServicesScreenBackground } from './BackgroundAnimations';
import SEO from './SEO';

interface LocalServicesProps {
  userLocation?: any;
}

interface DynamicCategory {
  id: string;
  name: string;
  count: string;
  iconSrc: string;
  iconEmoji: string;
}

export function LocalServices({ userLocation }: LocalServicesProps) {
  const { user } = useAuth();
  const { currentLocation, setLocationModalOpen } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [categories, setCategories] = useState<DynamicCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBusinessForReview, setSelectedBusinessForReview] = useState<BusinessProfile | null>(null);

  // Partner Form State
  const [partnerForm, setPartnerForm] = useState({
    business_name: '',
    category: '',
    location: '',
    contact_number: '',
    description: '',
    price_range: ''
  });

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    rating: '5',
    review_text: ''
  });

  // Use location from context if available, otherwise use prop
  const activeLocation = currentLocation || userLocation;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": businesses.map((biz, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": biz.business_name,
        "description": biz.description,
        "telephone": biz.contact_number,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": biz.location,
          "addressLocality": "Chennai",
          "addressRegion": "TN",
          "addressCountry": "IN"
        },
        "priceRange": biz.price_range || "$$",
        "image": biz.image_url
      }
    }))
  };

  // SEO Data
  const seoData = {
    title: "Local Services - Find Trusted Pros in Chennai",
    description: "Connect with trusted local service providers in Chennai. From plumbers to electricians, find the best professionals near you.",
    canonical: "https://chennai-community.app/services",
    ogType: "website" as const,
    jsonLd
  };

  const [filterMode, setFilterMode] = useState<'all' | 'local'>('all');

  useEffect(() => {
    fetchData();
  }, [selectedCategory, activeLocation?.area, filterMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Filter by location if 'local' mode is selected
      const area = filterMode === 'local' ? activeLocation?.area : undefined;
      const [fetchedBusinesses, fetchedCategories] = await Promise.all([
        BusinessService.getBusinesses(selectedCategory || undefined, area),
        BusinessService.getCategories()
      ]);

      setBusinesses(fetchedBusinesses);

      // ... (rest of the function)
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load services.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch = searchQuery
      ? b.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  const handleCall = (phoneNumber: string) => {
    toast.info(`Calling ${phoneNumber}...`);
    window.location.href = `tel:${phoneNumber}`;
  };

  // Suggest Form State
  const [suggestForm, setSuggestForm] = useState({
    business_name: '',
    category: '',
    location: '',
    description: ''
  });

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to suggest a business!");
      return;
    }

    try {
      await BusinessService.createBusiness({
        user_id: user.id,
        business_name: suggestForm.business_name,
        category: suggestForm.category,
        location: suggestForm.location,
        description: suggestForm.description,
        contact_number: '0000000000', // Default for suggestions
        price_range: 'moderate' // Default
      });
      setIsSuggestOpen(false);
      toast.success("Thanks! We'll verify and list this business soon.");
      setSuggestForm({
        business_name: '',
        category: '',
        location: '',
        description: ''
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit suggestion.");
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to register your business!");
      return;
    }

    try {
      await BusinessService.createBusiness({
        user_id: user.id,
        business_name: partnerForm.business_name,
        category: partnerForm.category,
        location: partnerForm.location,
        contact_number: partnerForm.contact_number,
        description: partnerForm.description,
        price_range: partnerForm.price_range
      });
      setIsPartnerOpen(false);
      toast.success("Business registered successfully! We will verify it shortly.");
      setPartnerForm({
        business_name: '',
        category: '',
        location: '',
        contact_number: '',
        description: '',
        price_range: ''
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to register business. Please try again.");
    }
  };

  const openReviewModal = (business: BusinessProfile) => {
    setSelectedBusinessForReview(business);
    setReviewModalOpen(true);
  };

  const getCategoryIconName = (categoryName: string): any => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('food') || lower.includes('mess') || lower.includes('hotel')) return 'Food';
    if (lower.includes('auto') || lower.includes('transport') || lower.includes('travel')) return 'Auto';
    if (lower.includes('repair') || lower.includes('mechanic') || lower.includes('service')) return 'Repair';
    if (lower.includes('medical') || lower.includes('doctor') || lower.includes('clinic')) return 'Medical';
    if (lower.includes('education') || lower.includes('tuition') || lower.includes('school')) return 'Education';
    if (lower.includes('shop') || lower.includes('grocery') || lower.includes('store')) return 'Shop';
    if (lower.includes('cinema') || lower.includes('movie') || lower.includes('theater')) return 'Cinema';
    return 'Services';
  };

  const handleReviewSubmit = async () => {
    if (!user || !selectedBusinessForReview) {
      toast.error("Please sign in to review!");
      return;
    }

    try {
      await BusinessService.addReview({
        business_id: selectedBusinessForReview.id,
        user_id: user.id,
        rating: parseInt(reviewForm.rating),
        review_text: reviewForm.review_text,
        is_verified_visit: false // Could be true if we had booking integration
      });
      toast.success("Review submitted! Thanks for helping the community.");
      setReviewModalOpen(false);
      setReviewForm({ rating: '5', review_text: '' });
      fetchData(); // Refresh to show new rating
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review.");
    }
  };

  // Helper to determine trust badge
  const getTrustBadge = (business: BusinessProfile) => {
    if (business.is_verified) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Verified Partner
        </Badge>
      );
    }
    if (business.rating >= 4.5 && business.review_count > 5) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] px-1.5 flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> Community Choice
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      {/* ... (SEO and Background) */}

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Marketplace Style */}
        <div className="bg-gradient-to-r from-auto-yellow to-orange-500 px-6 py-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden border-b-4 border-black">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("/assets/marketplace_bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <div className="inline-block bg-black text-auto-yellow text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-widest transform -rotate-2">
                CHENNAI MARKETPLACE
              </div>
              <h1 className="text-black text-3xl font-display font-bold flex items-center gap-2 drop-shadow-sm">
                நம்ம Area கடை <span className="text-2xl animate-bounce">🏪</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 flex items-center gap-2 border border-black/10">
                  <MapPin className="w-4 h-4 text-black" />
                  <p className="text-black font-medium text-sm">
                    {activeLocation ? activeLocation.area : 'Chennai'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-black text-auto-yellow hover:bg-black/80"
                  onClick={() => setLocationModalOpen(true)}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <div className="flex mt-3 gap-2">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border border-black ${filterMode === 'all'
                    ? 'bg-black text-auto-yellow shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]'
                    : 'bg-white/30 text-black hover:bg-white/50'
                    }`}
                >
                  All Chennai
                </button>
                <button
                  onClick={() => setFilterMode('local')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border border-black ${filterMode === 'local'
                    ? 'bg-black text-auto-yellow shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]'
                    : 'bg-white/30 text-black hover:bg-white/50'
                    }`}
                >
                  My Area
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {/* ... (Partner and Suggest Buttons) */}
              <Dialog open={isPartnerOpen} onOpenChange={setIsPartnerOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-white text-orange-600 hover:bg-orange-50 font-bold border-none shadow-sm">
                    <Briefcase className="w-4 h-4 mr-1" /> Partner
                  </Button>
                </DialogTrigger>
                {/* ... (Dialog Content) */}
              </Dialog>

              <Dialog open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    <Plus className="w-4 h-4 mr-1" /> Suggest
                  </Button>
                </DialogTrigger>
                {/* ... (Dialog Content) */}
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {activeLocation && (
              <>
                <span className="text-green-200 text-xs bg-green-900/20 px-2 py-0.5 rounded-full">🔒 Verified area</span>
              </>
            )}
            <span className="text-yellow-200 text-xs bg-yellow-900/20 px-2 py-0.5 rounded-full">⭐ Community verified</span>
            <span className="text-orange-100 text-xs bg-orange-900/20 px-2 py-0.5 rounded-full">Tamil-friendly</span>
          </div>

          {/* Search bar */}
          <div className="mt-6">
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <Search className="text-gray-400 w-5 h-5" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="இங்கே என்ன வேணும்? Search பண்ணுங்க..."
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Service Categories */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Browse Categories</h2>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-orange-600 hover:text-orange-700 h-auto p-0 text-xs"
              >
                Clear Filter
              </Button>
            )}
          </div>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Card
                    onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                    className={`p-4 backdrop-blur-sm transition-all cursor-pointer hover:scale-105 border-2 ${selectedCategory === category.name
                      ? 'bg-orange-100 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white/80 border-orange-100 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    <motion.div className="flex items-center justify-center mb-3" whileHover={{ scale: 1.1 }}>
                      <PremiumIcon
                        icon={getCategoryIconName(category.name)}
                        className="w-12 h-12"
                        color="#FF6B35"
                        animated={true}
                      />
                    </motion.div>
                    <h3 className="text-sm font-bold text-center mb-1 text-gray-800 capitalize">{category.name}</h3>
                    <p className="text-xs text-gray-500 text-center mb-1">{category.count}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 bg-white/50 rounded-lg border border-dashed border-gray-300">
              <p>No categories yet. Be the first to register!</p>
            </div>
          )}
        </div>

        {/* Featured services */}
        <div className="px-6 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">
              {selectedCategory ? 'Filtered Results' : 'Trusted Nearby'}
            </h2>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              ✅ Community Verified
            </Badge>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10">Loading services...</div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No services found matching your criteria.</p>
                <Button
                  variant="link"
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                  className="text-orange-500"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              filteredBusinesses.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-0 bg-[#fffdf5] border-2 border-black shadow-[4px_4px_0px_0px_rgba(234,88,12,1)] hover:shadow-[6px_6px_0px_0px_rgba(234,88,12,1)] transition-all overflow-hidden rounded-xl relative group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply z-10" style={{ backgroundImage: 'url("/assets/noise.png")', backgroundRepeat: 'repeat' }}></div>
                    <div className="flex h-full relative z-20">
                      {/* Service image */}
                      <div className="w-24 relative">
                        <ImageWithFallback
                          src={service.image_url || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400'}
                          alt={service.business_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                      </div>

                      {/* Service details */}
                      <div className="flex-1 p-3 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <div className="truncate pr-2">
                              <h3 className="font-display font-bold text-gray-900 truncate text-lg">{service.business_name}</h3>
                              <p className="text-xs font-medium text-orange-600 truncate uppercase tracking-wide">{service.category}</p>
                            </div>
                            {getTrustBadge(service)}
                          </div>

                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                            <span className="truncate">{service.location}</span>
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-200">
                              <Star className="w-3 h-3 text-yellow-600 fill-current" />
                              <span className="text-xs font-bold text-yellow-700">{service.rating?.toFixed(1) || 'New'}</span>
                              <span className="text-[10px] text-yellow-600">({service.review_count || 0})</span>
                            </div>
                            {service.price_range && <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">{service.price_range}</span>}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-auto-black hover:bg-black text-white h-8 text-xs font-bold uppercase tracking-wide"
                            onClick={() => handleCall(service.contact_number)}
                          >
                            <Phone className="w-3 h-3 mr-1.5" />
                            Call
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white h-8 text-xs font-bold uppercase tracking-wide transition-colors"
                            onClick={() => openReviewModal(service)}
                          >
                            <Star className="w-3 h-3 mr-1.5" />
                            Rate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div >

      {/* Review Modal */}
      < Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen} >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
            <DialogDescription>
              Share your experience with <span className="font-bold text-gray-900">{selectedBusinessForReview?.business_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <Select
                value={reviewForm.rating}
                onValueChange={v => setReviewForm({ ...reviewForm, rating: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 ⭐ - Excellent</SelectItem>
                  <SelectItem value="4">4 ⭐ - Good</SelectItem>
                  <SelectItem value="3">3 ⭐ - Average</SelectItem>
                  <SelectItem value="2">2 ⭐ - Poor</SelectItem>
                  <SelectItem value="1">1 ⭐ - Terrible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your Review</Label>
              <Textarea
                placeholder="How was the service? Was it worth the price?"
                value={reviewForm.review_text}
                onChange={e => setReviewForm({ ...reviewForm, review_text: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleReviewSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
}
