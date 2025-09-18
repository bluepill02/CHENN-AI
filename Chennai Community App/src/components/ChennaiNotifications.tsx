import { motion } from 'motion/react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ChennaiAnimations } from "./ChennaiAnimations";
import { ChennaiRainIcon, CoconutIcon, TempleIcon } from "./LocalIcons";

interface NotificationProps {
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

interface ChennaiNotificationsProps {
  notifications: NotificationProps[];
  onMarkAsRead: (id: string) => void;
}

export function ChennaiNotifications({ notifications, onMarkAsRead }: ChennaiNotificationsProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <ChennaiRainIcon className="w-6 h-6" />;
      case 'temple':
        return <TempleIcon className="w-6 h-6" />;
      case 'community':
        return <CoconutIcon className="w-6 h-6" />;
      default:
        return <span className="text-2xl">📢</span>;
    }
  };

  const getNotificationColors = (type: string, priority: string) => {
    if (priority === 'high') {
      return 'border-red-300 bg-gradient-to-r from-red-50 to-red-100';
    }
    
    switch (type) {
      case 'weather':
        return 'border-blue-300 bg-gradient-to-r from-blue-50 to-sky-100';
      case 'temple':
        return 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100';
      case 'community':
        return 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-100';
      default:
        return 'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };

  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => (
        <ChennaiAnimations key={notification.id} type="autorickshaw" delay={index * 0.1}>
          <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`${getNotificationColors(notification.type, notification.priority)} ${
                !notification.isRead ? 'shadow-lg' : 'opacity-80'
              } hover:shadow-xl transition-all duration-300 cursor-pointer`}
              onClick={() => onMarkAsRead(notification.id)}
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
  );
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'weather':
      return '🌧️';
    case 'temple':
      return '🛕';
    case 'community':
      return '🥥';
    case 'alert':
      return '⚠️';
    case 'local':
      return '🏘️';
    default:
      return '📢';
  }
}