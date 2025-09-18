import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChennaiAnimations } from "./ChennaiAnimations";
import { AutoRickshawIcon, NeighborHouseIcon, TempleIcon } from "./LocalIcons";
import { motion } from 'motion/react';
import { 
  Home, 
  MapPin, 
  MessageCircle, 
  User,
  Bell
} from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", name: "வீடு", tamilName: "வீடு", icon: Home, color: "from-red-500 to-orange-500" },
    { id: "services", name: "சேவைகள்", tamilName: "சேவை", icon: AutoRickshawIcon, color: "from-blue-500 to-cyan-500" },
    { id: "community", name: "சமுதாயம்", tamilName: "சமூகம்", icon: NeighborHouseIcon, hasNotification: true, color: "from-green-500 to-emerald-500" },
    { id: "notifications", name: "அறிவிப்பு", tamilName: "செய்தி", icon: Bell, hasNotification: true, color: "from-purple-500 to-pink-500" },
    { id: "profile", name: "நான்", tamilName: "சுயம்", icon: User, color: "from-amber-500 to-yellow-500" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Traditional Tamil border pattern */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500"></div>
      
      {/* Main navigation inspired by temple architecture */}
      <div className="bg-gradient-to-t from-white via-orange-50/50 to-red-50/30 backdrop-blur-md border-t border-red-200/50 px-2 py-3">
        
        {/* Traditional kolam dots pattern at top */}
        <div className="flex justify-center mb-2">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-red-400 rounded-full"
                animate={{ 
                  scale: activeTab === tabs[i]?.id ? [1, 1.5, 1] : [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </div>

        {/* Navigation tabs in traditional arrangement */}
        <div className="flex items-end justify-around">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.div
                key={tab.id}
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Active indicator - temple-inspired arch */}
                {isActive && (
                  <motion.div
                    className="absolute -top-2 w-12 h-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-t-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
                
                <motion.button
                  onClick={() => onTabChange(tab.id)}
                  className={`relative p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Background with gradient inspired by temple colors */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                    isActive 
                      ? tab.color 
                      : 'from-white to-gray-100'
                  } ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-50'} transition-opacity duration-300`} />
                  
                  {/* Icon container */}
                  <div className="relative z-10 flex items-center justify-center">
                    <motion.div
                      animate={isActive ? { 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-gray-600'
                      } transition-colors duration-300`} />
                    </motion.div>
                    
                    {/* Notification indicator */}
                    {tab.hasNotification && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-full border-2 border-white shadow-md"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 8px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                </motion.button>
                
                {/* Tamil label with traditional styling */}
                <motion.div
                  className="mt-1 text-center"
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className={`text-xs font-medium block ${
                    isActive ? 'text-red-700' : 'text-gray-600'
                  } transition-colors duration-300`}>
                    {tab.tamilName}
                  </span>
                  
                  {/* Additional decorative element for active tab */}
                  {isActive && (
                    <motion.div
                      className="mt-1 mx-auto w-4 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: 16 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Traditional footer pattern */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-60" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}