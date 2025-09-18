import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Search,
  MapPin,
  Star,
  Phone,
  Clock,
  Filter,
  Wrench,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Stethoscope,
  GraduationCap,
  ArrowLeft
} from "lucide-react";

interface ServicesScreenProps {
  onBack: () => void;
}

export function ServicesScreen({ onBack }: ServicesScreenProps) {
  const categories = [
    { icon: Wrench, name: "Repairs", count: 24, color: "orange" },
    { icon: Utensils, name: "Food", count: 67, color: "red" },
    { icon: ShoppingBag, name: "Shopping", count: 45, color: "blue" },
    { icon: Car, name: "Transport", count: 18, color: "green" },
    { icon: Home, name: "Home Services", count: 32, color: "purple" },
    { icon: Stethoscope, name: "Healthcare", count: 15, color: "pink" },
    { icon: GraduationCap, name: "Education", count: 12, color: "indigo" },
  ];

  const nearbyServices = [
    {
      id: 1,
      name: "Kumar Electronics Repair",
      category: "Electronics",
      rating: 4.7,
      reviews: 89,
      distance: "50m",
      address: "Shop 12, Gandhi Street",
      phone: "+91 98765 43210",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1623510847797-416119a9ff00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHJlZXQlMjBmb29kJTIwdmVuZG9yfGVufDF8fHx8MTc1ODIwNDc4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialties: ["AC Repair", "TV Service", "Mobile Repair"],
      verified: true
    },
    {
      id: 2,
      name: "Amma's Kitchen",
      category: "Food",
      rating: 4.9,
      reviews: 156,
      distance: "120m",
      address: "15, Ranganathan Street",
      phone: "+91 98765 43211",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1623510847797-416119a9ff00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHJlZXQlMjBmb29kJTIwdmVuZG9yfGVufDF8fHx8MTc1ODIwNDc4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialties: ["South Indian", "Home Style", "Lunch Packets"],
      verified: true
    },
    {
      id: 3,
      name: "Raman Plumbing Services",
      category: "Home Services",
      rating: 4.5,
      reviews: 73,
      distance: "200m",
      address: "Near Bus Stop, Usman Road",
      phone: "+91 98765 43212",
      isOpen: false,
      image: "https://images.unsplash.com/photo-1623510847797-416119a9ff00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHJlZXQlMjBmb29kJTIwdmVuZG9yfGVufDF8fHx8MTc1ODIwNDc4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      specialties: ["Pipe Repair", "Bathroom Fix", "24/7 Service"],
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl text-gray-800">Local Services</h1>
            <p className="text-gray-600">T. Nagar area</p>
          </div>
          <Button variant="ghost" size="sm">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search for services nearby..."
            className="pl-10 bg-white border-gray-200"
          />
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-lg text-gray-800 mb-4">Browse Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              const colorClasses = {
                orange: "bg-orange-100 text-orange-600 border-orange-200",
                red: "bg-red-100 text-red-600 border-red-200",
                blue: "bg-blue-100 text-blue-600 border-blue-200",
                green: "bg-green-100 text-green-600 border-green-200",
                purple: "bg-purple-100 text-purple-600 border-purple-200",
                pink: "bg-pink-100 text-pink-600 border-pink-200",
                indigo: "bg-indigo-100 text-indigo-600 border-indigo-200",
              };
              
              return (
                <Card key={idx} className={`border ${colorClasses[category.color as keyof typeof colorClasses]} cursor-pointer hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="text-gray-800 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} nearby</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Nearby Services */}
        <div>
          <h2 className="text-lg text-gray-800 mb-4">Nearest to You</h2>
          <div className="space-y-4">
            {nearbyServices.map((service) => (
              <Card key={service.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-gray-800">{service.name}</h3>
                            {service.verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{service.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-gray-700">{service.rating}</span>
                            <span className="text-gray-500">({service.reviews})</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{service.distance}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-2">{service.address}</p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 ${service.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{service.isOpen ? 'Open now' : 'Closed'}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="p-2">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}