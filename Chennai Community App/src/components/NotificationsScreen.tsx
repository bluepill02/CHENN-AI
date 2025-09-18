import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChennaiAnimations, FloatingTamilLetters } from "./ChennaiAnimations";
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  ArrowLeft,
  Bell,
  Settings
} from "lucide-react";

interface NotificationsScreenProps {
  onBack: () => void;
}

interface NotificationData {
  id: string;
  type: 'weather' | 'community' | 'temple' | 'alert' | 'local';
  title: string;
  tamilTitle: string;
  message: string;
  tamilMessage: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([
    {
      id: "1",
      type: "weather",
      title: "Water Supply Update",
      tamilTitle: "தண்ணீர் வழங்கல் அப்டேட் 💧",
      message: "Water supply restored in Ranganathan Street area. Thank you for your patience.",
      tamilMessage: "ரங்கநாதன் தெரு பகுதியில் தண்ணீர் வழங்கல் மீண்டும் தொடங்கிவிட்டது. பொறுமைக்கு நன்றி.",
      time: "10 நிமிட முன்",
      isRead: false,
      priority: "high"
    },
    {
      id: "2",
      type: "community",
      title: "New reply to your post",
      tamilTitle: "உங்கள் போஸ்ட்டுக்கு புதிய பதில் 💬",
      message: "Lakshmi Menon replied to your post about street art near metro station.",
      tamilMessage: "லக்ஷ்மி மேனன் மெட்ரோ ஸ்டேஷன் அருகிலுள்ள சுவர் ஓவியம் பற்றிய உங்கள் போஸ்ட்டுக்கு பதில் அளித்துள்ளார்.",
      time: "1 மணி முன்",
      isRead: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "community",
      title: "Your post was liked",
      tamilTitle: "உங்கள் போஸ்ட் லைக் ஆனது ❤️",
      message: "5 people liked your post about the reading group for kids.",
      tamilMessage: "குழந்தைகளுக்கான வாசிப்பு குழு பற்றிய உங்கள் போஸ்ட்டை 5 பேர் லைக் செய்துள்ளனர்.",
      time: "2 மணி முன்",
      isRead: false,
      priority: "low"
    },
    {
      id: "4",
      type: "temple",
      title: "Temple Festival Notification",
      tamilTitle: "கோயில் திருவிழா அறிவிப்பு 🛕",
      message: "Kapaleeshwarar Temple festival procession will pass through T.Nagar at 7 PM today.",
      tamilMessage: "கபாலீஸ்வரர் கோயில் திருவிழா ஊர்வலம் இன்று மாலை 7 மணிக்கு டி.நகர் வழியே செல்லும்.",
      time: "4 மணி முன்",
      isRead: true,
      priority: "medium"
    },
    {
      id: "5",
      type: "local",
      title: "New Local Business",
      tamilTitle: "புதிய உள்ளூர் கடை 🏪",
      message: "Ravi's Tiffin Center just joined your neighborhood. Check them out!",
      tamilMessage: "ரவியின் டிபன் சென்டர் உங்கள் பகுதியில் புதிதாக சேர்ந்துள்ளது. ஒரு முறை பாருங்கள்!",
      time: "1 நாள் முன்",
      isRead: true,
      priority: "low"
    },
    {
      id: "6",
      type: "alert",
      title: "Traffic Update",
      tamilTitle: "ட்ராபிக் அப்டேட் 🚗",
      message: "Heavy traffic reported on Usman Road due to ongoing construction work.",
      tamilMessage: "உஸ்மான் ரோட்டில் கட்டுமான வேலைகள் காரணமாக அதிக ட்ராபிக் உள்ளது.",
      time: "1 நாள் முன்",
      isRead: true,
      priority: "medium"
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-amber-50 to-white relative">
      <FloatingTamilLetters />
      
      {/* Header */}
      <ChennaiAnimations type="wave">
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white px-6 py-4 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="p-2 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </motion.div>
              <div>
                <h1 className="text-xl flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell className="w-5 h-5" />
                  </motion.div>
                  <span>அறிவிப்புகள்</span>
                  {unreadCount > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Badge className="bg-yellow-500 text-red-800">
                        {unreadCount}
                      </Badge>
                    </motion.div>
                  )}
                </h1>
                <p className="text-white/90 text-sm">உங்கள் சமுதாயத்தின் புதிய செய்திகள்</p>
                <p className="text-white/75 text-xs">Stay updated with your community</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </ChennaiAnimations>

      <div className="px-6 py-6">
        {/* Quick Actions */}
        {unreadCount > 0 && (
          <ChennaiAnimations type="bounce" delay={0.3}>
            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200">
              <p className="text-gray-700">{unreadCount} படிக்காத அறிவிப்புகள் 📬</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={handleMarkAllAsRead}
                >
                  அனைத்தையும் படித்ததாக குறிக்கவும்
                </Button>
              </motion.div>
            </div>
          </ChennaiAnimations>
        )}

        {/* Notifications List using Chennai component */}
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <ChennaiAnimations key={notification.id} type="autorickshaw" delay={index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`${getNotificationColors(notification.type, notification.priority)} ${
                    !notification.isRead ? 'shadow-lg border-l-4' : 'opacity-80 border-l-4'
                  } hover:shadow-xl transition-all duration-300 cursor-pointer`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <motion.div
                        className="mt-1"
                        animate={{ 
                          scale: notification.priority === 'high' ? [1, 1.1, 1] : 1,
                          rotate: notification.type === 'temple' ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {getNotificationIcon(notification.type)}
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-gray-800 mb-1">{notification.tamilTitle}</h3>
                            <p className="text-gray-600 text-xs">{notification.title}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {notification.priority === 'high' && (
                              <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="text-red-500 text-xl"
                              >
                                🚨
                              </motion.span>
                            )}
                            {!notification.isRead && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Badge className="bg-red-500 text-white text-xs">புதியது</Badge>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-1 leading-relaxed">{notification.tamilMessage}</p>
                        <p className="text-gray-500 text-xs mb-2 italic">{notification.message}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs">{notification.time}</span>
                          <motion.span
                            className="text-xs"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            {getTypeEmoji(notification.type)}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ChennaiAnimations>
          ))}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <ChennaiAnimations type="bounce">
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg text-gray-600 mb-2">எல்லாம் முடிந்தது! 🎉</h3>
              <p className="text-gray-500 mb-1">இப்போது புதிய அறிவிப்புகள் இல்லை.</p>
              <p className="text-gray-400 text-sm">All caught up! No new notifications right now.</p>
            </div>
          </ChennaiAnimations>
        )}

        {/* Bottom spacing for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}

function getNotificationIcon(type: string) {
  const iconMap: Record<string, string> = {
    weather: "🌧️",
    temple: "🛕",
    community: "🥥",
    alert: "⚠️",
    local: "🏪"
  };
  
  return <span className="text-2xl">{iconMap[type] || "📢"}</span>;
}

function getNotificationColors(type: string, priority: string) {
  if (priority === 'high') {
    return 'border-red-300 bg-gradient-to-r from-red-50 to-red-100';
  }
  
  const colorMap: Record<string, string> = {
    weather: 'border-blue-300 bg-gradient-to-r from-blue-50 to-sky-100',
    temple: 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100',
    community: 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-100',
    local: 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-100',
    alert: 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-100'
  };
  
  return colorMap[type] || 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100';
}

function getTypeEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    weather: '🌧️',
    temple: '🛕',
    community: '🥥',
    alert: '⚠️',
    local: '🏘️'
  };
  
  return emojiMap[type] || '📢';
}