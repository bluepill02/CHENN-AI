import { useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from "./ui/badge";
import { AutoRickshawIcon, NeighborHouseIcon, TempleIcon, TempleBellIcon } from "./LocalIcons";
import { 
  Home, 
  Bell,
  User,
  Menu,
  X
} from "lucide-react";

interface TamilHouseNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentScreen: string;
}

export function TamilHouseNavigation({ activeTab, onTabChange, currentScreen }: TamilHouseNavigationProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  // Traditional Tamil house rooms concept
  const houseRooms = [
    { 
      id: "home", 
      name: "தளம்", 
      englishName: "Thalam (Main Hall)", 
      icon: Home, 
      position: { top: "45%", left: "45%" },
      color: "from-red-500 to-orange-500",
      description: "முக்கிய அறை",
      emoji: "🏠"
    },
    { 
      id: "services", 
      name: "வேலைக்கூடம்", 
      englishName: "Velaikoodam (Work Room)", 
      icon: AutoRickshawIcon, 
      position: { top: "25%", left: "25%" },
      color: "from-blue-500 to-cyan-500",
      description: "சேவைகள் அறை",
      emoji: "🛺"
    },
    { 
      id: "community", 
      name: "திண்ணை", 
      englishName: "Thinnai (Front Porch)", 
      icon: NeighborHouseIcon, 
      position: { top: "25%", left: "65%" },
      color: "from-green-500 to-emerald-500",
      description: "சமூக இடம்",
      emoji: "🏘️",
      hasNotification: true
    },
    { 
      id: "notifications", 
      name: "செய்தி மண்டபம்", 
      englishName: "Seithi Mandapam (News Hall)", 
      icon: Bell, 
      position: { top: "65%", left: "25%" },
      color: "from-purple-500 to-pink-500",
      description: "அறிவிப்பு இடம்",
      emoji: "🔔",
      hasNotification: true
    },
    { 
      id: "profile", 
      name: "தனி அறை", 
      englishName: "Thani Arai (Private Room)", 
      icon: User, 
      position: { top: "65%", left: "65%" },
      color: "from-amber-500 to-yellow-500",
      description: "தனிப்பட்ட இடம்",
      emoji: "👤"
    }
  ];

  const toggleNavigation = () => {
    setIsNavigationOpen(!isNavigationOpen);
  };

  return (
    <>
      {/* Traditional Floating Navigation Button - Designed like a traditional Tamil bell */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.button
          onClick={toggleNavigation}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white relative overflow-hidden"
          animate={{
            boxShadow: isNavigationOpen 
              ? ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 20px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"]
              : ["0 10px 20px rgba(0,0,0,0.2)", "0 15px 30px rgba(0,0,0,0.1)", "0 10px 20px rgba(0,0,0,0.2)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Traditional bell texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full"></div>
          
          <AnimatePresence mode="wait">
            {isNavigationOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-7 h-7" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <TempleBellIcon className="w-7 h-7" />
                {/* Traditional bell animation */}
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Traditional Tamil House Layout Navigation */}
      <AnimatePresence>
        {isNavigationOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop with traditional pattern */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleNavigation}
            />

            {/* Traditional House Layout */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring", damping: 20 }}
            >
              {/* House Foundation */}
              <div className="relative w-80 h-80 max-w-full max-h-full">
                {/* Traditional House Outline */}
                <div className="absolute inset-0 border-4 border-orange-300/60 rounded-3xl bg-gradient-to-br from-orange-50/80 to-red-50/80 backdrop-blur-sm">
                  {/* Traditional roof design */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-t-full"></div>
                  
                  {/* House center decoration */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-30"></div>
                  
                  {/* Traditional kolam pattern in center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg width="60" height="60" className="text-red-400/30">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="30" cy="30" r="5" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* Room Navigation Buttons */}
                {houseRooms.map((room, index) => {
                  const Icon = room.icon;
                  const isActive = activeTab === room.id;
                  
                  return (
                    <motion.div
                      key={room.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={room.position}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.1 + index * 0.1, 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                      onHoverStart={() => setHoveredRoom(room.id)}
                      onHoverEnd={() => setHoveredRoom(null)}
                    >
                      <motion.button
                        onClick={() => {
                          onTabChange(room.id);
                          setIsNavigationOpen(false);
                        }}
                        className={`relative w-16 h-16 rounded-2xl shadow-lg transition-all duration-300 ${
                          isActive 
                            ? 'scale-110 shadow-2xl' 
                            : 'hover:scale-105'
                        }`}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Room background with gradient */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${room.color} ${
                          isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                        } transition-opacity duration-300`} />
                        
                        {/* Room icon */}
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Icon className="w-7 h-7" />
                        </div>
                        
                        {/* Notification indicator */}
                        {room.hasNotification && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 8px rgba(239, 68, 68, 0)", "0 0 0 0 rgba(239, 68, 68, 0)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span className="text-xs text-white font-bold">!</span>
                          </motion.div>
                        )}

                        {/* Traditional corner decoration */}
                        <div className="absolute top-1 right-1 text-xs opacity-60">
                          {room.emoji}
                        </div>
                      </motion.button>

                      {/* Room Label Tooltip */}
                      <AnimatePresence>
                        {(hoveredRoom === room.id || isActive) && (
                          <motion.div
                            className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-xl border border-orange-200"
                            initial={{ opacity: 0, y: -10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-center">
                              <p className="font-semibold text-gray-800 text-sm">{room.name}</p>
                              <p className="text-xs text-gray-600 mb-1">{room.englishName}</p>
                              <p className="text-xs text-gray-500">{room.description}</p>
                            </div>
                            {/* Traditional arrow */}
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45 border-l border-t border-orange-200"></div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                {/* House Name/Title */}
                <motion.div
                  className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-orange-200">
                    <h3 className="font-semibold text-gray-800">உங்கள் சமூக வீடு</h3>
                    <p className="text-sm text-gray-600">Your Community Home</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Traditional Status Indicator */}
      {!isNavigationOpen && (
        <motion.div
          className="fixed bottom-6 left-6 z-30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-orange-200 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">
              {houseRooms.find(room => room.id === activeTab)?.name || "வீடு"}
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
}