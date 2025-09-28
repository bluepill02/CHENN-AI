import {
    CheckCircleIcon,
    ChevronLeftIcon,
    ClockIcon,
    CurrencyRupeeIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    PhoneIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAutoShare } from "../services/AutoShareService";
import { ChennaiLocation } from "../utils/autoShareInterfaces";

const AutoShareDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getRideById,
    loading,
    bookSeats,
    isUsingBackend,
    error,
    refresh,
  } = useAutoShare();
  const [selectedSeats, setSelectedSeats] = useState<number>(1);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const ride = useMemo(() => (id ? getRideById(id) : undefined), [getRideById, id]);

  useEffect(() => {
    if (!ride && !loading) {
      refresh().catch(console.error);
    }
  }, [ride, loading, refresh]);

  useEffect(() => {
    if (ride) {
      setSelectedSeats(prev => {
        if (ride.seatsAvailable <= 0) return 0;
        return Math.min(prev, ride.seatsAvailable);
      });
    }
  }, [ride]);

  // Helper function to display location
  const getLocationDisplay = (location: string | ChennaiLocation, language: 'english' | 'tamil' = 'english') => {
    if (typeof location === 'string') {
      const parts = location.split(' / ');
      return language === 'english' ? parts[0] : (parts[1] || parts[0]);
    }
    return language === 'english' ? location.english : location.tamil;
  };

  const handleSeatBooking = async () => {
    if (!ride || selectedSeats <= 0) return;
    setIsBooking(true);
    setBookingStatus(null);
    setBookingError(null);

    try {
      const updated = await bookSeats(ride.id, selectedSeats);
      if (!updated) {
        throw new Error('Unable to confirm seats right now. Please retry.');
      }
      setBookingStatus('Seats confirmed! / இருக்கைகள் வெற்றிகரமாக பதிவு செய்யப்பட்டது');
    } catch (bookingErr) {
      setBookingError(
        bookingErr instanceof Error ? bookingErr.message : 'Seat booking failed. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (!ride) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🛺</div>
          <h1 className="text-2xl font-bold text-amber-800 mb-2">
            {loading ? 'Fetching ride details…' : 'Ride not found'}
          </h1>
          <p className="text-amber-600 mb-4">
            {loading ? 'சென்னை சவாரி தகவல் ஏற்றப்படுகிறது' : 'சவாரி கிடைக்கவில்லை'}
          </p>
          {!loading && (
            <button
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
              onClick={() => navigate("/auto-share")}
            >
              Back to Rides / மீண்டும் பார்க்க
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Chennai-themed Navigation */}
        <button
          className="flex items-center text-amber-700 hover:text-amber-900 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          onClick={() => navigate("/auto-share")}
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          <span>Back to Rides / மீண்டும் பார்க்க</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ride Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-400">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-amber-800">
                  {getLocationDisplay(ride.pickup, 'english')} → {getLocationDisplay(ride.drop, 'english')}
                </h1>
                <div className="text-4xl">🛺</div>
              </div>
              
              {/* Tamil Route */}
              <p className="text-lg text-amber-600 font-medium mb-4">
                {getLocationDisplay(ride.pickup, 'tamil')} → {getLocationDisplay(ride.drop, 'tamil')}
              </p>

              {/* Route Information */}
              {ride.route && (
                <div className="bg-amber-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center text-amber-800">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">Route: {ride.route}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Trip Details / பயண விவரங்கள்</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center text-indigo-700 mb-2">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Time / நேரம்</span>
                  </div>
                  <div className="font-bold text-indigo-800">
                    {new Date(ride.time).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-indigo-600 font-medium">
                    {new Date(ride.time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center text-green-700 mb-2">
                    <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Fare / கட்டணம்</span>
                  </div>
                  <div className="font-bold text-green-800 text-2xl">₹{ride.fare}</div>
                  <div className="text-green-600 text-sm">per person / ஒரு நபர்</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center text-purple-700 mb-2">
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">Seats / இருக்கைகள்</span>
                  </div>
                  <div className="font-bold text-purple-800 text-xl">
                    <span className="text-green-600">{ride.seatsAvailable}</span> / {ride.seatsTotal}
                  </div>
                  <div className="text-purple-600 text-sm">available / கிடைக்கும்</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center text-yellow-700 mb-2">
                    <span className="mr-2">{ride.vehicleType === 'car' ? '🚗' : ride.vehicleType === 'auto' ? '🛺' : '🚌'}</span>
                    <span className="font-medium">Vehicle / வாகனம்</span>
                  </div>
                  <div className="font-bold text-yellow-800 capitalize">
                    {ride.vehicleType === 'car' ? 'Car' : 
                     ride.vehicleType === 'auto' ? 'Auto Rickshaw' : 
                     'Share Auto'}
                  </div>
                  <div className="text-yellow-600 text-sm">
                    {ride.vehicleType === 'car' ? 'கார்' : 
                     ride.vehicleType === 'auto' ? 'ஆட்டோ ரிக்ஷா' : 
                     'பகிர்வு ஆட்டோ'}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Notes */}
            {ride.notes && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Notes from Driver / ஓட்டுநரின் குறிப்புகள்</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">{ride.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Driver Details & Booking */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-500">Connection</p>
                  <p className="text-sm font-semibold text-amber-700">
                    {isUsingBackend ? 'Live Chennai network' : 'Simulation mode'}
                  </p>
                </div>
                {error && (
                  <p className="text-xs text-red-500 text-right max-w-[160px]">{error}</p>
                )}
              </div>
            </div>
            {/* Driver Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Driver Profile / ஓட்டுநர் விவரம்</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                {ride.creator.avatarUrl ? (
                  <img
                    src={ride.creator.avatarUrl}
                    alt="Driver"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {ride.creator.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-800">
                      {ride.creator.name.split(' / ')[0]}
                    </h4>
                    {ride.creator.isVerified && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {ride.creator.name.split(' / ')[1]}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(ride.creator.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {ride.creator.rating || 0} ({ride.creator.ridesCompleted || 0} rides)
                </span>
              </div>

              {/* Contact */}
              {ride.creator.phoneNumber && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center text-gray-700">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">{ride.creator.phoneNumber}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Seat Selection & Booking */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Book Seats / இருக்கை பதிவு</h3>
              
              {ride.seatsAvailable > 0 ? (
                <div className="space-y-4">
                  {/* Seat Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of seats / இருக்கைகளின் எண்ணிக்கை
                    </label>
                    <select
                      value={selectedSeats}
                      onChange={(e) => setSelectedSeats(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      {Array.from({ length: ride.seatsAvailable }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} seat{num > 1 ? 's' : ''} - ₹{ride.fare * num}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Total Fare */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-green-800">Total Fare:</span>
                      <span className="font-bold text-green-800 text-xl">₹{ride.fare * selectedSeats}</span>
                    </div>
                    <div className="text-green-600 text-sm mt-1">
                      மொத்த கட்டணம்: ₹{ride.fare * selectedSeats}
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isBooking || selectedSeats === 0}
                    onClick={handleSeatBooking}
                  >
                    {isBooking ? 'Booking… / பதிவு செய்கிறோம்…' : 'Book Now / இப்போது பதிவு செய்'}
                  </button>

                  {bookingStatus && (
                    <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      {bookingStatus}
                    </div>
                  )}

                  {bookingError && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {bookingError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <h4 className="font-medium text-red-600 mb-1">Ride Full</h4>
                  <p className="text-red-500 text-sm">சவாரி முழுவதும் நிரம்பியது</p>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-medium text-gray-800 mb-2">Ride Status / சவாரி நிலை</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize
                ${ride.status === 'upcoming' ? 'bg-amber-100 text-amber-800' :
                  ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                  ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'}
              `}>
                {ride.status}
              </span>
              <p className="text-xs text-gray-500 mt-3">
                {isUsingBackend
                  ? 'Live data from Chennai Auto Share servers'
                  : 'Offline-first mode — syncs when servers are available'}
              </p>
            </div>
          </div>
        </div>

        {/* Chennai Cultural Footer */}
        <div className="text-center mt-8 text-amber-600 text-sm">
          <p>🏛️ Chennai Auto Share - Safe, Reliable, Community-Driven 🛺</p>
          <p className="text-xs text-amber-500 mt-1">சென்னை ஆட்டோ பகிர்வு - பாதுகாப்பான, நம்பகமான, சமூக உந்துதல்</p>
        </div>
      </div>
    </div>
  );
};

export default AutoShareDetailPage;