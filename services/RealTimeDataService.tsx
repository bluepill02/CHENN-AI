import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LivePost {
  id: string;
  content: string;
  category: string;
  categoryEn: string;
  timestamp: Date;
  user: {
    name: string;
    isVerified: boolean;
    trustScore: number;
  };
  location: {
    area: string;
    areaEn: string;
    pincode: string;
  };
  likes: number;
  comments: number;
  isUrgent?: boolean;
  isRead?: boolean;
}

export interface LiveAlert {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
  affectedAreas?: string[];
  isActive: boolean;
}

interface RealTimeDataContextType {
  posts: LivePost[];
  alerts: LiveAlert[];
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date | null;
  postsCount: number;
  simulateNewPost: (postData: Partial<LivePost>) => void;
  markPostAsRead: (postId: string) => void;
  addAlert: (alert: Partial<LiveAlert>) => void;
  dismissAlert: (alertId: string) => void;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | undefined>(undefined);

interface RealTimeDataProviderProps {
  children: ReactNode;
}

// Simulated Chennai locations
const chennaiLocations = [
  { area: 'T. Nagar', areaEn: 'T. Nagar', pincode: '600017' },
  { area: 'மயிலாப்பூர்', areaEn: 'Mylapore', pincode: '600004' },
  { area: 'அடையார்', areaEn: 'Adyar', pincode: '600020' },
  { area: 'அண்ணா நகர்', areaEn: 'Anna Nagar', pincode: '600040' },
  { area: 'வேளச்சேரி', areaEn: 'Velachery', pincode: '600042' }
];

// Sample community content for simulation
const sampleContents = {
  ta: [
    'நம்ம area-ல கிட்ட traffic jam ஆச்சு, alternate route use பண்ணுங்க',
    'புதிய coffee shop திறந்திருக்கிறது, filter coffee semma taste!',
    'நாளை temple-ல special பூஜை, எல்லோரும் வாங்க',
    'Auto-ல share போக வேண்டியவர்கள் இருக்கீங்களா?',
    'Street light-கள் கெட்டு போச்சு, corporation-க்கு complaint பண்ணலாம்',
    'Metro station-ல lift வேலை செய்யலை, stairs use பண்ணுங்க'
  ],
  en: [
    'Heavy traffic near our area, please use alternate routes',
    'New coffee shop opened, their filter coffee is amazing!',
    'Special prayers at temple tomorrow, everyone welcome',
    'Anyone need auto share? Going towards OMR',
    'Street lights not working, should we file corporation complaint?',
    'Metro station lift is down, please use stairs'
  ]
};

const sampleAlerts: Partial<LiveAlert>[] = [
  {
    title: 'போக்குவரத்து நெரிசல்',
    titleEn: 'Heavy Traffic Alert',
    message: 'GST Road-ல heavy traffic. Mount Road வழியா போங்க.',
    messageEn: 'Heavy traffic on GST Road. Please use Mount Road route.',
    severity: 'medium',
    source: 'Traffic Control',
    affectedAreas: ['GST Road', 'Guindy', 'St. Thomas Mount']
  },
  {
    title: 'நீர் விநியோக இடையூறு',
    titleEn: 'Water Supply Disruption',
    message: 'T.Nagar பகுதியில் நாளை காலை 6-10 AM நீர் விநியோகம் இல்லை.',
    messageEn: 'Water supply will be disrupted in T.Nagar area tomorrow 6-10 AM.',
    severity: 'high',
    source: 'Chennai Water Board',
    affectedAreas: ['T. Nagar', 'West Mambalam']
  }
];

export function RealTimeDataProvider({ children }: RealTimeDataProviderProps) {
  const [posts, setPosts] = useState<LivePost[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());

  // Simulate real-time connection
  useEffect(() => {
    const connectionInterval = setInterval(() => {
      // Simulate occasional connection issues
      const shouldDisconnect = Math.random() < 0.05; // 5% chance
      
      if (shouldDisconnect && isConnected) {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Reconnect after 2-5 seconds
        setTimeout(() => {
          setIsConnected(true);
          setConnectionStatus('connected');
          setLastUpdate(new Date());
        }, 2000 + Math.random() * 3000);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(connectionInterval);
  }, [isConnected]);

  // Simulate receiving new posts
  useEffect(() => {
    const postInterval = setInterval(() => {
      if (isConnected && Math.random() < 0.3) { // 30% chance every interval
        simulateRandomPost();
      }
    }, 15000 + Math.random() * 15000); // Every 15-30 seconds

    return () => clearInterval(postInterval);
  }, [isConnected]);

  // Simulate alerts occasionally
  useEffect(() => {
    const alertInterval = setInterval(() => {
      if (isConnected && Math.random() < 0.1) { // 10% chance
        simulateRandomAlert();
      }
    }, 60000); // Every minute

    return () => clearInterval(alertInterval);
  }, [isConnected]);

  const simulateRandomPost = () => {
    const location = chennaiLocations[Math.floor(Math.random() * chennaiLocations.length)];
    const isTamil = Math.random() < 0.7; // 70% chance of Tamil content
    const content = isTamil 
      ? sampleContents.ta[Math.floor(Math.random() * sampleContents.ta.length)]
      : sampleContents.en[Math.floor(Math.random() * sampleContents.en.length)];

    const categories = [
      { ta: 'உதவி', en: 'help' },
      { ta: 'நிகழ்ச்சி', en: 'event' },
      { ta: 'சாப்பாடு', en: 'food' },
      { ta: 'எச்சரிக்கை', en: 'alert' }
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const names = ['Priya', 'Rajesh', 'Divya', 'Venkat', 'Lakshmi', 'Suresh', 'Meera', 'Kumar'];
    const name = names[Math.floor(Math.random() * names.length)];

    simulateNewPost({
      content,
      category: category.ta,
      categoryEn: category.en,
      user: {
        name,
        isVerified: Math.random() < 0.6,
        trustScore: Math.floor(Math.random() * 50) + 50
      },
      location
    });
  };

  const simulateRandomAlert = () => {
    const alertTemplate = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    addAlert(alertTemplate);
  };

  const simulateNewPost = (postData: Partial<LivePost>) => {
    const newPost: LivePost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: postData.content || 'New community update!',
      category: postData.category || 'நிகழ்ச்சி',
      categoryEn: postData.categoryEn || 'event',
      timestamp: new Date(),
      user: {
        name: postData.user?.name || 'Community Member',
        isVerified: postData.user?.isVerified || false,
        trustScore: postData.user?.trustScore || 75
      },
      location: postData.location || {
        area: 'மயிலாப்பூர்',
        areaEn: 'Mylapore',
        pincode: '600004'
      },
      likes: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 10),
      isUrgent: postData.isUrgent || false,
      isRead: false
    };

    setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 49)]); // Keep last 50 posts
    setLastUpdate(new Date());
  };

  const markPostAsRead = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, isRead: true } : post
      )
    );
  };

  const addAlert = (alertData: Partial<LiveAlert>) => {
    const newAlert: LiveAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: alertData.title || 'சமூக எச்சரிக்கை',
      titleEn: alertData.titleEn || 'Community Alert',
      message: alertData.message || 'Important community notification',
      messageEn: alertData.messageEn || 'Important community notification',
      severity: alertData.severity || 'medium',
      timestamp: new Date(),
      source: alertData.source || 'Community System',
      affectedAreas: alertData.affectedAreas || [],
      isActive: true
    };

    setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 9)]); // Keep last 10 alerts
    setLastUpdate(new Date());
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      ).filter(alert => alert.isActive)
    );
  };

  const value: RealTimeDataContextType = {
    posts,
    alerts: alerts.filter(alert => alert.isActive),
    isConnected,
    connectionStatus,
    lastUpdate,
    postsCount: posts.length,
    simulateNewPost,
    markPostAsRead,
    addAlert,
    dismissAlert
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>
  );
}

export function useRealTimeData() {
  const context = useContext(RealTimeDataContext);
  if (context === undefined) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
}

// Utility functions for time formatting
export function getRelativeTime(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function getRelativeTimeTamil(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'இப்போது';
  if (diffInMinutes < 60) return `${diffInMinutes} நிமிடங்கள் முன்`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} மணிநேரம் முன்`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} நாட்கள் முன்`;
}