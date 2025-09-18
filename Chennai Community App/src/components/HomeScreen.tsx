import { useState, useEffect } from "react";
import { motion } from 'motion/react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Bell, MapPin, Users, Wrench, MessageCircle, Heart, Star, Clock, Thermometer, Cloud, Sun } from "lucide-react";
import { ChennaiNotifications } from "./ChennaiNotifications";
import { AutoRickshawIcon, TempleBellIcon, ChennaiLandmarkIcon, IdliIcon, CoconutIcon, NeighborHouseIcon } from "./LocalIcons";

interface HomeScreenProps {
  onNavigateToServices: () => void;
  onNavigateToCommunity: () => void;
}

export function HomeScreen({ onNavigateToServices, onNavigateToCommunity }: HomeScreenProps) {
  const [weatherData, setWeatherData] = useState({
    temp: 32,
    condition: "வெயில்",
    humidity: 78,
    icon: Sun
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "community" as const,
      title: "புதிய அண்டை வீட்டுக்காரர்",
      message: "ராம் உங்கள் பகுதியில் சேர்ந்துள்ளார்",
      time: "5 mins ago",
      read: false
    },
    {
      id: 2,
      type: "service" as const,
      title: "பிளம்பர் கிடைத்தது",
      message: "முருகன் உங்கள் கோரிக்கைக்கு பதிலளித்துள்ளார்",
      time: "15 mins ago",
      read: false
    }
  ]);

  // Traditional kolam-inspired floating elements
  const kolamElements = ["◊", "◈", "○", "◇", "⬢", "⬡", "❋", "✦"];

  const quickServices = [
    { id: 1, name: "பிளம்பர்", icon: Wrench, color: "bg-blue-500", count: 12 },
    { id: 2, name: "எலெக்ட்ரீஷியன்", icon: Users, color: "bg-yellow-500", count: 8 },
    { id: 3, name: "சமையல்காரர்", icon: Heart, color: "bg-green-500", count: 15 },
    { id: 4, name: "டிரைவர்", icon: AutoRickshawIcon, color: "bg-red-500", count: 6 }
  ];

  const communityHighlights = [
    {
      id: 1,
      user: "பிரியா",
      content: "யாருக்காவது நல்ல குழந்தைகள் டாக்டர் தெரியுமா?",
      likes: 12,
      comments: 5,
      time: "2 hours ago",
      urgent: true
    },
    {
      id: 2,
      user: "ராஜேஷ்",
      content: "நமது பகுதியில் காய்கறி கடை எங்கே இருக்கு?",
      likes: 8,
      comments: 3,
      time: "4 hours ago",
      urgent: false
    }
  ];

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-orange-50/30 via-red-50/20 to-amber-50/30">
      {/* Traditional Tamil architectural layout inspired by inner courtyard design */}
      
      {/* Kolam-inspired background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Central kolam pattern */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full text-red-600">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1"/>
            {/* Kolam dots pattern */}
            {Array.from({length: 8}).map((_, i) => (
              <g key={i} transform={`rotate(${i * 45} 100 100)`}>
                <circle cx="100" cy="40" r="2" fill="currentColor"/>
                <circle cx="100" cy="60" r="1.5" fill="currentColor"/>
                <circle cx="100" cy="80" r="1" fill="currentColor"/>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Floating kolam elements */}
        {kolamElements.map((element, index) => (
          <motion.div
            key={index}
            className="absolute text-red-200/20 select-none text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            {element}
          </motion.div>
        ))}
      </div>

      {/* Thinnai (Front Porch) - Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 p-6 bg-gradient-to-r from-red-600/90 to-orange-600/90 text-white rounded-b-3xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">வணக்கம்! 🙏</h1>
            <p className="text-red-100">உங்கள் ஊர் சமூகத்தில் வரவேற்கிறோம்</p>
          </div>
          <div className="text-right bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white">
              <weatherData.icon className="size-5" />
              <span className="font-semibold">{weatherData.temp}°C</span>
            </div>
            <p className="text-sm text-red-100">{weatherData.condition}</p>
          </div>
        </div>

        {/* Location with traditional design */}
        <div className="flex items-center gap-2 text-red-100 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
          <MapPin className="size-4" />
          <span>T. Nagar, Chennai - 600017</span>
          <Badge className="ml-auto bg-green-500/80 text-white border-0">
            12 அண்டைக்காரர்கள் ஆன்லைன்
          </Badge>
        </div>
      </motion.div>

      {/* Inner Courtyard Layout - Main Content */}
      <div className="relative z-10 p-4 pb-32">
        
        {/* Notifications as traditional message board */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <ChennaiNotifications notifications={notifications} />
        </motion.div>

        {/* Central Mandala-inspired Services Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">சேவைகள் மண்டலம்</h2>
            <p className="text-gray-600 text-sm">உங்கள் தேவைகளுக்கு வட்ட வடிவில் அமைக்கப்பட்ட சேவைகள்</p>
          </div>

          {/* Circular arrangement inspired by temple pradakshina */}
          <div className="relative mx-auto w-80 h-80">
            {/* Central hub */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNavigateToServices}
            >
              <TempleBellIcon className="size-8 text-white" />
            </motion.div>
            
            {/* Services arranged in circle */}
            {quickServices.map((service, index) => {
              const angle = (index * 90) - 45; // Spread evenly in circle
              const radius = 100;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <motion.div
                  key={service.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-100 hover:border-red-300 transition-all duration-300 min-w-24 text-center">
                    <div className={`mx-auto w-10 h-10 rounded-full ${service.color} flex items-center justify-center mb-2`}>
                      <service.icon className="size-5 text-white" />
                    </div>
                    <p className="text-xs font-medium text-gray-800 leading-tight">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.count}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={onNavigateToServices}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 rounded-full px-6"
            >
              அனைத்து சேவைகளும் →
            </Button>
          </div>
        </motion.div>

        {/* Community Stories - Palm leaf manuscript style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">சமூக கதைகள்</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNavigateToCommunity}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              மேலும் கதைகள் →
            </Button>
          </div>

          {/* Vertical scroll like palm leaves */}
          <div className="space-y-3">
            {communityHighlights.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className={`${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}
              >
                <Card className={`p-4 relative ${
                  post.urgent 
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400' 
                    : 'bg-gradient-to-r from-white to-gray-50'
                } hover:shadow-md transition-all duration-300 rounded-2xl`}>
                  
                  {/* Palm leaf style decoration */}
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {post.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-800">{post.user}</p>
                        <span className="text-xs text-gray-500">{post.time}</span>
                        {post.urgent && (
                          <Badge variant="destructive" className="text-xs rounded-full">
                            அவசரம்
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                          <Heart className="size-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors">
                          <MessageCircle className="size-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Outer Courtyard - Neighborhood Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-200 rounded-3xl relative overflow-hidden">
            {/* Traditional border pattern */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <ChennaiLandmarkIcon className="size-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">உங்கள் பகுதி நிலவரம்</h3>
                <p className="text-gray-600">இன்று 15 பேர் புதிதாக நமது சமூகத்தில் இணைந்துள்ளனர்</p>
              </div>
              <div className="text-center bg-white/60 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-600">127</div>
                <p className="text-sm text-gray-600">மொத்த உறுப்பினர்கள்</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}