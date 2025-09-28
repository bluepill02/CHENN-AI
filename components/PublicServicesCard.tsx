import { AlertTriangle, Phone, RefreshCw, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchPublicServices } from '../services/ExternalDataApiClient';
import { useLanguage } from '../services/LanguageService';
import { usePincodeContext } from '../services/PincodeContext';
import { Card } from './ui/card';

interface PublicService {
  name: string;
  nameTamil: string;
  type: 'emergency' | 'utility' | 'government' | 'health';
  contact: string;
  status: 'active' | 'maintenance' | 'unavailable';
  description?: string;
  descriptionTamil?: string;
  lastUpdated: Date;
  dataSource?: 'live-api' | 'fallback';
}

interface PublicServicesCardProps {
  className?: string;
  pincode?: string;
}

// Chennai public services data
const publicServicesData: Record<string, PublicService[]> = {
  // Default services available city-wide
  'default': [
    {
      name: 'Emergency Services',
      nameTamil: 'அவசர சேவைகள்',
      type: 'emergency',
      contact: '108',
      status: 'active',
      description: '24/7 Emergency Medical Services',
      descriptionTamil: '24/7 அவசர மருத்துவ சேவைகள்',
      lastUpdated: new Date()
    },
    {
      name: 'Fire Department',
      nameTamil: 'தீயணைப்புத் துறை',
      type: 'emergency',
      contact: '101',
      status: 'active',
      description: 'Fire & Rescue Services',
      descriptionTamil: 'தீயணைப்பு மற்றும் மீட்பு சேவைகள்',
      lastUpdated: new Date()
    },
    {
      name: 'Police Control Room',
      nameTamil: 'பொலிஸ் கட்டுப்பாட்டு அறை',
      type: 'emergency',
      contact: '100',
      status: 'active',
      description: '24/7 Police Emergency',
      descriptionTamil: '24/7 பொலிஸ் அவசரம்',
      lastUpdated: new Date()
    },
    {
      name: 'Chennai Corporation',
      nameTamil: 'சென்னை மாநகராட்சி',
      type: 'government',
      contact: '1913',
      status: 'active',
      description: 'Municipal Services Helpline',
      descriptionTamil: 'நகராட்சி சேவைகள் உதவி எண்',
      lastUpdated: new Date()
    }
  ],
  // Area-specific services
  '600001': [
    {
      name: 'Fort Police Station',
      nameTamil: 'கோட்டை பொலிஸ் நிலையம்',
      type: 'government',
      contact: '044-25345678',
      status: 'active',
      description: 'Local Police Station',
      descriptionTamil: 'உள்ளூர் பொலிஸ் நிலையம்',
      lastUpdated: new Date()
    }
  ],
  '600004': [
    {
      name: 'Mylapore Police Station',
      nameTamil: 'மயிலாப்பூர் பொலிஸ் நிலையம்',
      type: 'government',
      contact: '044-24981234',
      status: 'active',
      description: 'Local Police Station',
      descriptionTamil: 'உள்ளூர் பொலிஸ் நிலையம்',
      lastUpdated: new Date()
    },
    {
      name: 'Mylapore PHC',
      nameTamil: 'மயிலாப்பூர் சுகாதார நிலையம்',
      type: 'health',
      contact: '044-24985678',
      status: 'active',
      description: 'Primary Health Centre',
      descriptionTamil: 'முதன்மை சுகாதார மையம்',
      lastUpdated: new Date()
    }
  ],
  '600040': [
    {
      name: 'Anna Nagar Police Station',
      nameTamil: 'அண்ணா நகர் பொலிஸ் நிலையம்',
      type: 'government',
      contact: '044-26165432',
      status: 'active',
      description: 'Local Police Station',
      descriptionTamil: 'உள்ளூர் பொலிஸ் நிலையம்',
      lastUpdated: new Date()
    }
  ],
  '600020': [
    {
      name: 'Adyar Police Station',
      nameTamil: 'அடையார் பொலிஸ் நிலையம்',
      type: 'government',
      contact: '044-24420987',
      status: 'active',
      description: 'Local Police Station',
      descriptionTamil: 'உள்ளூர் பொலிஸ் நிலையம்',
      lastUpdated: new Date()
    }
  ]
};

// Utility services data
const utilityServices: PublicService[] = [
  {
    name: 'TANGEDCO Power',
    nameTamil: 'மின்சாரம் - தங்கெட்கோ',
    type: 'utility',
    contact: '94987 94987',
    status: 'active',
    description: 'Power Supply Issues',
    descriptionTamil: 'மின்சார வழங்கல் சிக்கல்கள்',
    lastUpdated: new Date()
  },
  {
    name: 'Chennai Water Board',
    nameTamil: 'சென்னை தண்ணீர் வாரியம்',
    type: 'utility',
    contact: '044-28415300',
    status: 'active',
    description: 'Water Supply & Drainage',
    descriptionTamil: 'தண்ணீர் வழங்கல் மற்றும் வடிகால்',
    lastUpdated: new Date()
  },
  {
    name: 'Gas Emergency',
    nameTamil: 'எரிவாயு அவசரம்',
    type: 'utility',
    contact: '1906',
    status: 'active',
    description: 'LPG & PNG Emergency',
    descriptionTamil: 'எல்.பி.ஜி மற்றும் பி.என்.ஜி அவசரம்',
    lastUpdated: new Date()
  }
];

export function PublicServicesCard({ className = '', pincode: propPincode }: PublicServicesCardProps) {
  const { language } = useLanguage();
  const { currentPincode } = usePincodeContext();
  const pincode = propPincode || currentPincode;
  
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'loading' | 'live-api' | 'fallback'>('loading');

  const isTamil = language === 'ta' || language === 'ta-rom';

  const refreshServices = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setDataSource('loading');
      
      // PRIORITY 1: Try real government services API
      try {
        console.log('🛡️ Fetching live government services data...');
        const publicServicesResult = await fetchPublicServices();
        
        if (publicServicesResult && publicServicesResult.data && publicServicesResult.data.length > 0) {
          // Convert external API data to our format
          const liveServices: PublicService[] = publicServicesResult.data
            .slice(0, 4) // Limit to 4 services
            .map(service => ({
              name: service.service || 'Government Service',
              nameTamil: service.serviceTamil || 'அரசு சேவை',
              type: service.service.toLowerCase().includes('emergency') || service.service.toLowerCase().includes('police') ? 'emergency' : 
                    service.service.toLowerCase().includes('water') || service.service.toLowerCase().includes('power') ? 'utility' : 
                    service.service.toLowerCase().includes('hospital') || service.service.toLowerCase().includes('health') ? 'health' : 'government',
              contact: service.contact || '1913',
              status: service.status === 'operational' ? 'active' : 
                     service.status === 'maintenance' ? 'maintenance' : 'unavailable',
              description: service.description || 'Government Service',
              descriptionTamil: service.descriptionTamil || 'அரசு சேவை',
              lastUpdated: service.lastUpdated || new Date(),
              dataSource: 'live-api'
            }));
            
          // Add essential emergency services if not present
          const emergencyServices = publicServicesData['default']
            .filter(service => service.type === 'emergency')
            .map(service => ({ ...service, dataSource: 'fallback' as const }));
            
          const combinedServices = [
            ...liveServices,
            ...emergencyServices.slice(0, Math.max(0, 6 - liveServices.length))
          ].slice(0, 6);
          
          setServices(combinedServices);
          setDataSource('live-api');
          setLastUpdate(new Date());
          return;
        }
      } catch (apiError) {
        console.warn('Government services API failed, using fallback:', apiError);
      }
      
      // PRIORITY 2: Use fallback data (clearly marked)
      const defaultServices = publicServicesData['default'] || [];
      const areaServices = pincode ? (publicServicesData[pincode] || []) : [];
      const combinedServices = [
        ...defaultServices.slice(0, 2), // Emergency services first
        ...areaServices.slice(0, 1),    // Local services
        ...utilityServices.slice(0, 2), // Utilities
        ...defaultServices.slice(2)     // Other government services
      ].slice(0, 6).map(service => ({ 
        ...service, 
        dataSource: 'fallback' as const,
        lastUpdated: new Date()
      }));
      
      setServices(combinedServices);
      setDataSource('fallback');
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error refreshing services:', error);
      setDataSource('fallback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshServices();
  }, [pincode]);

  const handleRefresh = () => {
    refreshServices(true);
  };

  const getServiceIcon = (type: PublicService['type']) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'government':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'utility':
        return <Zap className="w-4 h-4 text-orange-600" />;
      case 'health':
        return <Phone className="w-4 h-4 text-green-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: PublicService['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: PublicService['status']) => {
    switch (status) {
      case 'active':
        return isTamil ? 'செயல்பாட்டில்' : 'Active';
      case 'maintenance':
        return isTamil ? 'பராமரிப்பில்' : 'Maintenance';
      case 'unavailable':
        return isTamil ? 'கிடைக்கவில்லை' : 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4" />
          <h3 className="text-sm font-medium">
            {isTamil ? 'பொது சேவைகள்' : 'Public Services'}
          </h3>
        </div>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
          <div className="animate-pulse bg-gray-200 h-4 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {isTamil ? 'பொது சேவைகள்' : 'Public Services'}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              {pincode && (
                <span className="text-gray-500">{pincode}</span>
              )}
              {/* Data source indicator */}
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                dataSource === 'live-api' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : dataSource === 'fallback'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}>
                {dataSource === 'live-api' ? '🟢 LIVE API' : 
                 dataSource === 'fallback' ? '🟡 DIRECTORY' : 
                 '⚪ LOADING'}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors"
          aria-label="Refresh services"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 flex-1">
              {getServiceIcon(service.type)}
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {isTamil ? service.nameTamil : service.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {isTamil ? service.descriptionTamil : service.description}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(service.status)}`}>
                {getStatusLabel(service.status)}
              </div>
              <div className="text-xs text-blue-600 font-mono mt-1">
                {service.contact}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-emerald-100">
        <p className="text-xs text-gray-500">
          {isTamil ? 'கடைசியாக புதுப்பிக்கப்பட்டது' : 'Last updated'}: {lastUpdate?.toLocaleTimeString() || '--:--'} • 
          {isTamil ? ' சென்னை பொது சேவைகள்' : ' Chennai public services'}
        </p>
      </div>
    </Card>
  );
}

export default PublicServicesCard;