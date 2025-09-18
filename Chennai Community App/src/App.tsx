import { useState, useEffect } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { HomeScreen } from "./components/HomeScreen";
import { ServicesScreen } from "./components/ServicesScreen";
import { CommunityScreen } from "./components/CommunityScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { TamilHouseNavigation } from "./components/TamilHouseNavigation";
import { ChennaiLoader } from "./components/ChennaiAnimations";
import { motion } from 'motion/react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("welcome");
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetStarted = () => {
    setCurrentScreen("home");
    setActiveTab("home");
  };

  const handleTabChange = (tab: string) => {
    // Add a little loading animation for Chennai feel
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      if (tab === "home") {
        setCurrentScreen("home");
      } else if (tab === "services") {
        setCurrentScreen("services");
      } else if (tab === "community") {
        setCurrentScreen("community");
      } else if (tab === "notifications") {
        setCurrentScreen("notifications");
      } else if (tab === "profile") {
        setCurrentScreen("profile");
      }
      setIsLoading(false);
    }, 300);
  };

  const handleNavigateToServices = () => {
    setCurrentScreen("services");
    setActiveTab("services");
  };

  const handleNavigateToCommunity = () => {
    setCurrentScreen("community");
    setActiveTab("community");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
    setActiveTab("home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
      case "home":
        return (
          <HomeScreen
            onNavigateToServices={handleNavigateToServices}
            onNavigateToCommunity={handleNavigateToCommunity}
          />
        );
      case "services":
        return <ServicesScreen onBack={handleBackToHome} />;
      case "community":
        return <CommunityScreen onBack={handleBackToHome} />;
      case "notifications":
        return <NotificationsScreen onBack={handleBackToHome} />;
      case "profile":
        return <ProfileScreen onBack={handleBackToHome} />;
      default:
        return <WelcomeScreen onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="size-full min-h-screen relative overflow-x-hidden">
      {/* Traditional Tamil manuscript-inspired background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50/40 via-red-50/30 via-amber-50/20 to-yellow-50/30">
        {/* Palm leaf texture pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" className="text-amber-800">
            <defs>
              <pattern id="palmLeaf" x="0" y="0" width="200" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q50,20 100,50 Q150,80 200,50" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
                <path d="M0,30 Q50,10 100,30 Q150,50 200,30" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
                <path d="M0,70 Q50,40 100,70 Q150,100 200,70" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#palmLeaf)"/>
          </svg>
        </div>
        
        {/* Traditional border decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-600 opacity-20"></div>
      </div>

      {/* Loading overlay with traditional Chennai style */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-red-600/90 to-orange-600/90 backdrop-blur-md z-50 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
        >
          <div className="text-center text-white relative">
            {/* Traditional loading pattern */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <motion.div
                className="absolute inset-0 border-4 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-2 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
            </div>
            
            <ChennaiLoader />
            <motion.p 
              className="mt-4 text-xl font-medium"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              சற்று காத்திருங்கள்...
            </motion.p>
            <p className="text-sm opacity-80 mt-1">உங்கள் சமூகத்திற்கு வரவேற்கிறோம்</p>
          </div>
        </motion.div>
      )}

      {/* Main content with palm leaf manuscript-inspired transitions */}
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0, x: currentScreen === "welcome" ? 0 : 30, rotateY: 5 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -30, rotateY: -5 }}
        transition={{ 
          duration: 0.5, 
          ease: "easeInOut",
          type: "spring",
          damping: 20,
          stiffness: 100
        }}
        className="relative z-10"
      >
        {renderScreen()}
      </motion.div>

      {/* Traditional Tamil Home Navigation */}
      {currentScreen !== "welcome" && (
        <TamilHouseNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentScreen={currentScreen}
        />
      )}
    </div>
  );
}