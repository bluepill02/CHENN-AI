import { ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { WeatherPanel } from './LiveData/WeatherPanel';
import { TrafficStatusPanel } from './LiveData/TrafficStatusPanel';
import { LiveAlertsPanel } from './LiveData/LiveAlertsPanel';

interface LiveUpdatesScreenProps {
    userLocation?: any;
}

import SEO from './SEO';

export function LiveUpdatesScreen({ userLocation }: LiveUpdatesScreenProps) {
    const navigate = useNavigate();
    const locationName = userLocation?.area || userLocation?.pincode || 'Chennai';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-25 pb-20">
            <SEO
                title="Live Chennai Updates - Weather, Traffic & Alerts"
                description={`Real-time updates for ${locationName}. Weather, traffic status, and emergency alerts powered by Chenn-AI.`}
                canonical="https://chenn-ai.vercel.app/live"
            />
            {/* Header - Breaking News Style */}
            <div className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg border-b-4 border-yellow-400">
                <div className="p-4 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-white/20"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
                            <h1 className="text-2xl font-display font-bold uppercase tracking-wider italic">
                                LIVE NEWS
                            </h1>
                        </div>
                        <div className="flex items-center gap-1 text-red-100 text-xs font-mono uppercase tracking-widest mt-1">
                            <span>CHENNAI • {locationName.toUpperCase()} • LIVE</span>
                        </div>
                    </div>
                    <div className="bg-white text-red-600 px-3 py-1 rounded font-bold text-xs uppercase animate-pulse">
                        ON AIR
                    </div>
                </div>

                {/* Ticker Tape */}
                <div className="bg-black py-1 overflow-hidden border-t border-red-900">
                    <div className="whitespace-nowrap text-yellow-400 font-mono text-xs uppercase tracking-widest animate-marquee">
                        BREAKING: HEAVY RAIN ALERT IN MYLAPORE • TRAFFIC CLEARED AT T.NAGAR • METRO RAIL DELAYED BY 5 MINS • NEW RESTAURANT OPENED IN ADYAR •
                        BREAKING: HEAVY RAIN ALERT IN MYLAPORE • TRAFFIC CLEARED AT T.NAGAR • METRO RAIL DELAYED BY 5 MINS • NEW RESTAURANT OPENED IN ADYAR •
                    </div>
                </div>
            </div>

            {/* Content - Dashboard Grid */}
            <div className="p-4 space-y-4 max-w-4xl mx-auto">
                {/* Info Banner */}
                <div className="bg-blue-900/90 border-l-4 border-blue-400 rounded-r-lg p-4 text-white shadow-lg backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-yellow-400 mt-0.5 animate-pulse" />
                        <div>
                            <h3 className="font-bold uppercase tracking-wide text-blue-200 mb-1 text-xs">System Status</h3>
                            <p className="text-sm font-medium">
                                AI Satellite Link Active. Data refreshing every 15 mins.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weather Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-blue-500 px-4 py-2 text-white font-bold text-sm uppercase flex items-center gap-2">
                            <span>Weather Report</span>
                        </div>
                        <div className="p-4">
                            <WeatherPanel userLocation={userLocation} />
                        </div>
                    </div>

                    {/* Traffic Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-orange-500 px-4 py-2 text-white font-bold text-sm uppercase flex items-center gap-2">
                            <span>Traffic Cam</span>
                        </div>
                        <div className="p-4">
                            <TrafficStatusPanel userLocation={userLocation} />
                        </div>
                    </div>
                </div>

                {/* Alerts Section - Full Width */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-red-100">
                    <div className="bg-red-600 px-4 py-2 text-white font-bold text-sm uppercase flex items-center gap-2 animate-pulse">
                        <span>⚠️ Emergency Alerts</span>
                    </div>
                    <div className="p-4">
                        <LiveAlertsPanel userLocation={userLocation} />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center text-xs text-gray-400 py-4 font-mono">
                    <p>POWERED BY CHENN-AI SATELLITE NETWORK</p>
                    <p className="mt-1">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
}
