import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    EyeIcon,
    PencilIcon,
    UserGroupIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoShare } from "../services/AutoShareService";
import { ChennaiLocation, Ride, VehicleType } from "../utils/autoShareInterfaces";

const MyRidesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    rides,
    currentUser,
    cancelRide,
    isUsingBackend,
    error,
    refresh,
    loading,
  } = useAutoShare();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');
  
  const currentUserId = currentUser.id;

  const userRides = useMemo<Ride[]>(
    () => rides.filter(ride => ride.creator.id === currentUserId),
    [rides, currentUserId]
  );

  const activeRides = useMemo<Ride[]>(
    () => userRides.filter(ride => ride.status === 'upcoming'),
    [userRides]
  );

  const completedRides = useMemo<Ride[]>(
    () => userRides.filter(ride => ride.status === 'completed'),
    [userRides]
  );

  const cancelledRides = useMemo<Ride[]>(
    () => userRides.filter(ride => ['cancelled', 'no-show'].includes(ride.status)),
    [userRides]
  );

  // Helper function to display location
  const getLocationDisplay = (location: string | ChennaiLocation, language: 'english' | 'tamil' = 'english') => {
    if (typeof location === 'string') {
      const parts = location.split(' / ');
      return language === 'english' ? parts[0] : (parts[1] || parts[0]);
    }
    return language === 'english' ? location.english : location.tamil;
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'active': return activeRides.length;
      case 'completed': return completedRides.length;
      case 'cancelled': return cancelledRides.length;
      default: return 0;
    }
  };

  const ridesForActiveTab = useMemo<Ride[]>(() => {
    switch (activeTab) {
      case 'active':
        return activeRides;
      case 'completed':
        return completedRides;
      case 'cancelled':
        return cancelledRides;
      default:
        return [];
    }
  }, [activeTab, activeRides, completedRides, cancelledRides]);

  const handleCancelRide = async (rideId: string) => {
    if (confirm('Are you sure you want to cancel this ride? / இந்த சவாரியை ரத்து செய்ய வேண்டுமா?')) {
      await cancelRide(rideId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVehicleEmoji = (vehicleType: VehicleType | undefined) => {
    switch (vehicleType) {
      case 'car': return '🚗';
      case 'auto': return '🛺';
      case 'share-auto': return '🚌';
      default: return '🚗';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Chennai-themed Navigation */}
        <button
          className="flex items-center text-amber-700 hover:text-amber-900 mb-6 font-medium bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/auto-share")}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Rides / மீண்டும் பார்க்க
        </button>

        {/* Chennai-themed Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="text-4xl mr-3">👤</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                My Rides
              </h1>
              <h2 className="text-2xl font-bold text-amber-800">
                என் பயணங்கள்
              </h2>
            </div>
            <div className="text-4xl ml-3">🛺</div>
          </div>
          <p className="text-amber-700 font-medium">Manage your Chennai auto share rides</p>
          <p className="text-amber-600 text-sm">உங்கள் சென்னை ஆட்டோ பகிர்வு சவாரிகளை நிர்வகிக்கவும்</p>
        </header>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/70 border border-amber-100 rounded-xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {isUsingBackend ? 'Live Chennai Auto Share dashboard' : 'Simulation mode for your rides'}
            </p>
            <p className="text-xs text-amber-600">
              {error
                ? error
                : isUsingBackend
                  ? 'Updates sync instantly across all commuters.'
                  : 'Changes are stored locally and sync once servers are ready.'}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh rides'}
          </button>
        </div>

        {/* Ride Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-amber-800">Active Rides</h3>
                <p className="text-amber-600 text-sm">செயலில் உள்ள சவாரிகள்</p>
              </div>
              <div className="text-3xl font-bold text-amber-600">{activeRides.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-800">Completed</h3>
                <p className="text-green-600 text-sm">முடிந்த சவாரிகள்</p>
              </div>
              <div className="text-3xl font-bold text-green-600">{completedRides.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-indigo-800">Total Revenue</h3>
                <p className="text-indigo-600 text-sm">மொத்த வருமானம்</p>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                ₹{completedRides.reduce((sum, ride) => sum + ride.fare * (ride.seatsTotal - ride.seatsAvailable), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-lg">
            {[
              { key: 'active', label: 'Active', tamil: 'செயலில்' },
              { key: 'completed', label: 'Completed', tamil: 'முடிந்தது' },
              { key: 'cancelled', label: 'Cancelled', tamil: 'ரத்து' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-sm opacity-75">({getTabCount(tab.key)})</span>
                {activeTab !== tab.key && <span className="text-xs text-amber-500 block">{tab.tamil}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Rides List */}
        <div className="space-y-4">
          {ridesForActiveTab.length > 0 ? (
            ridesForActiveTab.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-400 relative overflow-hidden"
              >
                {/* Chennai motif background decoration */}
                <div className="absolute top-0 right-0 text-6xl text-amber-100 opacity-20 transform rotate-12">
                  {getVehicleEmoji(ride.vehicleType)}
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>

                {/* Route */}
                <div className="mb-4 relative z-10">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-xl font-bold text-amber-800">
                      {getLocationDisplay(ride.pickup, 'english')}
                    </div>
                    <div className="text-amber-500">→</div>
                    <div className="text-xl font-bold text-amber-800">
                      {getLocationDisplay(ride.drop, 'english')}
                    </div>
                  </div>
                  <div className="text-amber-600 text-sm">
                    {getLocationDisplay(ride.pickup, 'tamil')} → {getLocationDisplay(ride.drop, 'tamil')}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-medium text-sm">
                        {new Date(ride.time).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(ride.time).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-bold text-green-800">₹{ride.fare}</div>
                      <div className="text-xs text-gray-500">per seat</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium">
                        {ride.seatsTotal - ride.seatsAvailable}/{ride.seatsTotal}
                      </div>
                      <div className="text-xs text-gray-500">occupied</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getVehicleEmoji(ride.vehicleType)}</span>
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {ride.vehicleType}
                      </div>
                      <div className="text-xs text-gray-500">vehicle</div>
                    </div>
                  </div>
                </div>

                {/* Route and Notes */}
                {ride.route && (
                  <div className="mb-4 bg-amber-50 p-3 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Route:</strong> {ride.route}
                    </p>
                  </div>
                )}

                {ride.notes && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-800 text-sm">{ride.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate(`/auto-share/${ride.id}`)}
                      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View Details
                    </button>

                    {activeTab === 'active' && (
                      <>
                        <button
                          onClick={() => alert('Edit ride functionality - would open edit form')}
                          className="flex items-center text-amber-600 hover:text-amber-800 font-medium text-sm"
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          Edit
                        </button>

                        <button
                          onClick={() => handleCancelRide(ride.id)}
                          className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}

                    {activeTab === 'completed' && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Trip completed successfully
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(ride.createdAt || ride.time).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">
                {activeTab === 'active' && '🛺'}
                {activeTab === 'completed' && '✅'}
                {activeTab === 'cancelled' && '❌'}
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                No {activeTab} rides
              </h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'active' && 'ஏதும் செயலில் உள்ள சவாரிகள் இல்லை'}
                {activeTab === 'completed' && 'ஏதும் முடிந்த சவாரிகள் இல்லை'}
                {activeTab === 'cancelled' && 'ஏதும் ரத்து செய்யப்பட்ட சவாரிகள் இல்லை'}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/auto-share/create')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Create Your First Ride / முதல் சவாரியை உருவாக்குங்கள்
                </button>
              )}
            </div>
          )}
        </div>

        {/* Chennai Cultural Footer */}
        <div className="text-center mt-8 text-amber-600 text-sm">
          <p>🏛️ Chennai Auto Share - Your Personal Ride Dashboard 🛺</p>
          <p className="text-xs text-amber-500 mt-1">சென்னை ஆட்டோ பகிர்வு - உங்கள் தனிப்பட்ட சவாரி டாஷ்போர்டு</p>
        </div>
      </div>
    </div>
  );
};

export default MyRidesPage;