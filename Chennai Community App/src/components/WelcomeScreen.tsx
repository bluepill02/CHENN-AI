import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Users, Shield } from "lucide-react";
import { ChennaiAnimations, FloatingTamilLetters } from "./ChennaiAnimations";
import { AutoRickshawIcon, TempleIcon, NeighborHouseIcon } from "./LocalIcons";
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen relative">
      {/* Traditional Tamil temple-inspired layout */}
      
      {/* Gopuram (Temple Tower) Inspired Header */}
      <motion.div
        className="relative h-80 bg-gradient-to-b from-red-600 via-orange-500 to-amber-500 overflow-hidden"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Traditional temple architecture pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" className="text-white">
            {/* Temple tower outline */}
            <defs>
              <pattern id="templePattern" x="0" y="0" width="80" height="60" patternUnits="userSpaceOnUse">
                <rect x="20" y="10" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                <rect x="30" y="0" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                <circle cx="40" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#templePattern)"/>
          </svg>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute inset-0">
          {['🕉️', '🏛️', '🪷', '🎭'].map((symbol, index) => (
            <motion.div
              key={index}
              className="absolute text-2xl text-white/30"
              style={{
                left: `${20 + index * 20}%`,
                top: `${30 + Math.sin(index) * 20}%`
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4 + index,
                repeat: Infinity,
                delay: index * 0.5
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>

        {/* Main title in traditional style */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Traditional Tamil greeting */}
          <motion.div
            className="mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-4xl font-bold mb-2">வணக்கம்!</h1>
            <div className="w-20 h-1 bg-white/60 rounded-full mx-auto mb-2"></div>
            <h2 className="text-2xl">சென்னை சமூகம்</h2>
          </motion.div>
          
          <motion.p 
            className="text-lg opacity-90 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            உங்கள் அண்டை வீட்டுக்காரர்களுடன் இணையுங்கள்
          </motion.p>
          <motion.p 
            className="text-sm opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Connect with your neighbors in Chennai
          </motion.p>
        </motion.div>

        {/* Traditional bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-yellow-600 via-red-600 via-green-600 to-blue-600"></div>
      </motion.div>

      {/* Mandapa (Hall) - Main Content Area */}
      <div className="relative -mt-8 px-6 pb-8">
        {/* Rounded transition like temple architecture */}
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 relative">
          {/* Traditional dot pattern border */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6]
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

          {/* Introduction text */}
          <div className="text-center mb-8 mt-8">
            <motion.h3 
              className="text-2xl font-semibold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              உங்கள் ஊர் சமூகத்தில் வரவேற்கிறோம்
            </motion.h3>
            <motion.p 
              className="text-gray-600 leading-relaxed mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              நம்பிக்கையான அண்டை வீட்டுக்காரர்கள், உள்ளூர் சேவைகள், 
              மற்றும் உண்மையான உறவுகளை உருவாக்குங்கள்
            </motion.p>
            <motion.p 
              className="text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Build trusted relationships and discover local services
            </motion.p>
          </div>

          {/* Feature cards arranged in traditional pattern */}
          <div className="space-y-4 mb-8">
            {[
              {
                icon: AutoRickshawIcon,
                color: "from-red-500 to-orange-500",
                bgColor: "from-red-50 to-orange-50",
                title: "உள்ளூர் சேவைகள்",
                subtitle: "Local Services",
                desc: "உங்கள் தெருவில் உள்ள நம்பிக்கையான சேவையாளர்கள்",
                descEn: "Trusted service providers in your street",
                emoji: "🛺",
                delay: 0.2
              },
              {
                icon: NeighborHouseIcon,
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                title: "அண்டை வீட்டார்",
                subtitle: "Neighbors",
                desc: "உங்கள் பகுதியில் உள்ளவர்களுடன் இணையுங்கள்",
                descEn: "Connect with people in your area",
                emoji: "🏘️",
                delay: 0.4
              },
              {
                icon: TempleIcon,
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                title: "நம்பிக்கையான நெட்வர்க்",
                subtitle: "Trusted Network",
                desc: "சரிபார்க்கப்பட்ட உறுப்பினர்கள் மட்டுமே",
                descEn: "Only verified community members",
                emoji: "🤝",
                delay: 0.6
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                  className={index % 2 === 0 ? 'mr-4' : 'ml-4'}
                >
                  <Card className={`bg-gradient-to-r ${feature.bgColor} border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
                    <CardContent className="p-5 flex items-center space-x-4">
                      {/* Traditional corner decoration */}
                      <div className="absolute top-2 right-2 text-lg opacity-30">
                        {feature.emoji}
                      </div>
                      
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-1">{feature.subtitle}</p>
                        <p className="text-sm text-gray-600 mb-1 leading-relaxed">
                          {feature.desc}
                        </p>
                        <p className="text-xs text-gray-500">{feature.descEn}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Call to action in traditional button style */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onGetStarted}
                className="w-full py-6 text-lg bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white hover:from-red-700 hover:via-orange-600 hover:to-amber-600 rounded-2xl shadow-xl relative overflow-hidden group"
              >
                {/* Traditional shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatDelay: 2
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>இணையத் தொடங்குங்கள்</span>
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🙏
                  </motion.span>
                </span>
              </Button>
            </motion.div>
            
            {/* Statistics in traditional style */}
            <motion.div
              className="mt-6 flex justify-center items-center gap-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-green-600" />
                <span>1000+ சென்னை மக்கள்</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>50+ பகுதிகள்</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}