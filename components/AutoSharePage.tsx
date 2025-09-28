import {
    ArrowRightIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    PlusIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAutoShare } from "../services/AutoShareService";
import { ChennaiLocation, Ride } from "../utils/autoShareInterfaces";

const AutoSharePage: React.FC = () => {
  const navigate = useNavigate();
  const { rides, loading, error, isUsingBackend, refresh, lastSync } = useAutoShare();

  const upcomingRides = useMemo(
    () =>
      rides
        .filter(ride => ride.status === "upcoming")
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [rides]
  );

  // Helper function to display location
  const getLocationDisplay = (location: string | ChennaiLocation, language: 'english' | 'tamil' = 'english') => {
    if (typeof location === 'string') {
      const parts = location.split(' / ');
      return language === 'english' ? parts[0] : (parts[1] || parts[0]);
    }
    return language === 'english' ? location.english : location.tamil;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-emerald-50 chennai-bg">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Chennai-themed Header with Temple motif */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="text-4xl mr-3">🏛️</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-rose-600 bg-clip-text text-transparent mb-1 chennai-title">
                Auto Share
              </h1>
              <h2 className="text-2xl font-bold text-amber-800">
                ஆட்டோ பகிர்வு
              </h2>
            </div>
            <div className="text-4xl ml-3">🛺</div>
          </div>
          <p className="text-amber-700 font-medium">
            Share rides, save money, travel together
          </p>
          <p className="text-amber-600 text-sm">
            சவாரி பகிர்ந்து, பணம் மிச்சப்படுத்துங்கள், ஒன்றாக பயணிக்கவும்
          </p>
        </header>

        {/* Chennai-themed Navigation with warm colors */}
        <nav className="flex justify-center space-x-6 mb-8">
          <Link 
            to="/auto-share/my" 
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-amber-700 hover:to-rose-700 font-medium transform hover:scale-105"
          >
            <span className="block">My Rides</span>
            <span className="text-xs opacity-90">என் பயணங்கள்</span>
          </Link>
          <Link 
            to="/auto-share/history" 
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:from-teal-600 hover:to-emerald-700 font-medium transform hover:scale-105"
          >
            <span className="block">History</span>
            <span className="text-xs opacity-90">வரலாறு</span>
          </Link>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white/70 border border-amber-100 rounded-xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {isUsingBackend ? 'Connected to live Chennai Auto Share network' : 'Simulation mode active'}
            </p>
            <p className="text-xs text-amber-600">
              {error
                ? error
                : lastSync
                  ? `Last updated ${lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Preparing your Chennai rides...'}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="self-start sm:self-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow hover:from-emerald-600 hover:to-emerald-700 transition-all"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh rides'}
          </button>
        </div>

        {/* Chennai-themed Rides List */}
        <div className="space-y-4 mb-20">
          {loading && upcomingRides.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-4 bg-amber-100 rounded w-2/3 mb-4" />
              <div className="h-3 bg-amber-50 rounded w-1/2 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-amber-50 rounded" />
                <div className="h-3 bg-amber-50 rounded" />
              </div>
            </div>
          ) : upcomingRides.length > 0 ? (
            upcomingRides.map((ride: Ride) => (
              <div 
                key={ride.id} 
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer hover:scale-[1.02] border-l-4 border-amber-400 relative overflow-hidden"
                onClick={() => navigate(`/auto-share/${ride.id}`)}
              >
                {/* Chennai motif background decoration */}
                <div className="absolute top-0 right-0 text-6xl text-amber-100 opacity-20 transform rotate-12">
                  🛺
                </div>

                {/* Route with bilingual display */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-lg font-bold text-amber-800">
                      {getLocationDisplay(ride.pickup, 'english')}
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="text-lg font-bold text-amber-800">
                      {getLocationDisplay(ride.drop, 'english')}
                    </div>
                  </div>
                  <div className="flex items-center bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 px-4 py-2 rounded-full shadow-sm ml-4">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                    <span className="font-bold">₹{ride.fare}</span>
                  </div>
                </div>

                {/* Tamil Route */}
                <div className="text-sm text-amber-600 mb-3 font-medium">
                  {getLocationDisplay(ride.pickup, 'tamil')} → {getLocationDisplay(ride.drop, 'tamil')}
                </div>

                {/* Vehicle and Route info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ride.vehicleType === 'car' ? 'bg-teal-100 text-teal-800' :
                      ride.vehicleType === 'auto' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {ride.vehicleType === 'car' ? '🚗 Car' : 
                       ride.vehicleType === 'auto' ? '🛺 Auto' : '🚌 Share Auto'}
                    </span>
                    {ride.route && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {ride.route}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIconSolid className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {ride.creator.rating}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-emerald-50 px-2 py-1 rounded">
                      <ClockIcon className="w-4 h-4 mr-1 text-emerald-600" />
                      <span className="font-medium">{new Date(ride.time).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-1 text-amber-600" />
                      <span className="font-medium">
                        <span className="text-green-600">{ride.seatsAvailable}</span>
                        /{ride.seatsTotal} seats
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs font-medium text-gray-500">
                      by {ride.creator.name.split(' / ')[0]}
                    </div>
                    {ride.creator.isVerified && (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes if available */}
                {ride.notes && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">{ride.notes}</p>
                  </div>
                )}
              </div>
            ))
            ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <div className="text-amber-400 text-8xl mb-4">�</div>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">No rides available</h3>
              <p className="text-amber-700 text-lg mb-2">
                சவாரி இல்லை
              </p>
              <p className="text-amber-600 mb-6">
                Be the first to offer a ride in Chennai!
              </p>
              <div className="text-amber-200 text-4xl">🏛️ Chennai Pride 🏛️</div>
            </div>
          )}
        </div>

        {/* Chennai-themed Floating Action Button */}
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 transform hover:scale-110"
          onClick={() => navigate("/auto-share/create")}
          aria-label="Create new ride"
        >
          <PlusIcon className="w-6 h-6" />
        </button>

        {/* Chennai cultural footer */}
        <div className="text-center mt-8 text-amber-600 text-sm">
          <p>🏛️ Chennai Auto Share - Connecting Chennai, One Ride at a Time 🛺</p>
          <p className="text-xs text-amber-500 mt-1">சென்னை ஆட்டோ பகிர்வு - ஒரு சவாரியில் சென்னையை இணைத்தல்</p>
        </div>
      </div>
    </div>
  );
};

export default AutoSharePage;
