import {
  ArrowLeftIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  PencilIcon,
  UserGroupIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoShare } from "../services/AutoShareService";
import type { Ride } from "../utils/autoShareInterfaces";

const AutoShareMyRidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"offered" | "joined">("offered");
  const [leavingRideId, setLeavingRideId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { rides, currentUser, loading, leaveRide } = useAutoShare();

  const { offeredRides, joinedRides } = useMemo(() => {
    const offered = rides.filter(ride => ride.creator.id === currentUser.id);
    const joined = rides.filter(ride =>
      ride.creator.id !== currentUser.id &&
      (ride.seatBookings ?? []).some(booking => booking.passenger.id === currentUser.id)
    );

    const sortByTime = (list: Ride[]) =>
      [...list].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
      offeredRides: sortByTime(offered),
      joinedRides: sortByTime(joined),
    };
  }, [rides, currentUser.id]);

  const handleManageRide = (rideId: string) => {
    navigate(`/auto-share/${rideId}`);
  };

  const handleLeaveRide = async (ride: Ride) => {
    const confirmLeave = window.confirm(
      "Leaving this ride will free up your seats for others.\nநீங்கள் விலகினால் உங்கள் இருக்கை விடுவிக்கப்படும். தொடர வேண்டுமா?"
    );

    if (!confirmLeave) {
      return;
    }

    setLeavingRideId(ride.id);
    try {
      const updated = await leaveRide(ride.id);
      if (!updated || !(updated.seatBookings ?? []).some(booking => booking.passenger.id === currentUser.id)) {
        window.alert(
          "You have left the ride successfully.\nநீங்கள் பயணத்திலிருந்து வெளியேறிவிட்டீர்கள்."
        );
      } else {
        window.alert(
          "We couldn't update your booking. Please try again.\nஉங்கள் பதிவு புதுப்பிக்கப்படவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
        );
      }
    } finally {
      setLeavingRideId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "no-show": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatLocation = (location: Ride["pickup"]) => {
    if (typeof location === "string") {
      return location;
    }

    const bilingualName = location.tamil
      ? `${location.english} / ${location.tamil}`
      : location.english;

    return location.landmark ? `${bilingualName} (${location.landmark})` : bilingualName;
  };

  const renderRides = (ridesList: Ride[], isOffered: boolean) => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (ridesList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">
            {isOffered ? "🚗" : "🤝"}
          </div>
          <p className="text-gray-500 text-lg">
            {isOffered
              ? "No offered rides yet / இதுவரை வழங்கிய பயணங்கள் இல்லை"
              : "No joined rides yet / இதுவரை சேர்ந்த பயணங்கள் இல்லை"}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {isOffered
              ? "Share your first ride to help others!"
              : "Join a ride to start your journey!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {ridesList.map((ride) => (
          <div key={ride.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
                {ride.status === "upcoming" && "Upcoming / வரவுள்ள"}
                {ride.status === "completed" && "Completed / முடிந்தது"}
                {ride.status === "cancelled" && "Cancelled / ரத்து"}
                {ride.status === "no-show" && "No Show / வராமல்"}
              </span>
              <button
                className={`${
                  isOffered
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={() =>
                  isOffered ? handleManageRide(ride.id) : handleLeaveRide(ride)
                }
                disabled={!isOffered && leavingRideId === ride.id}
              >
                {isOffered ? (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    <span>Manage</span>
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-4 h-4" />
                    <span>Leave</span>
                  </>
                )}
              </button>
            </div>

            {/* Route */}
            <div className="flex items-center space-x-3 mb-4">
              <MapPinIcon className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{formatLocation(ride.pickup)}</div>
                <div className="text-sm text-gray-500">to / க்க்</div>
                <div className="font-semibold text-gray-800">{formatLocation(ride.drop)}</div>
              </div>
            </div>

            {/* Ride Details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-gray-600">{new Date(ride.time).toLocaleDateString()}</div>
                  <div className="text-gray-600">{new Date(ride.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <CurrencyRupeeIcon className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium">Fare</div>
                  <div className="text-gray-600">₹{ride.fare}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <UserGroupIcon className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-medium">Seats</div>
                  <div className="text-gray-600">{ride.seatsAvailable}/{ride.seatsTotal}</div>
                </div>
              </div>
            </div>

            {/* Creator Info (for joined rides) */}
            {!isOffered && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {ride.creator.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Offered by</div>
                    <div className="text-sm text-gray-600">{ride.creator.name}</div>
                    {ride.seatBookings && (
                      <div className="text-xs text-gray-400 mt-1">
                        {ride.seatBookings.filter(booking => booking.passenger.id === currentUser.id).length} seat(s) reserved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
          onClick={() => navigate("/auto-share")}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Auto Share
        </button>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Rides / <span className="text-gray-600">என் பயணங்கள்</span>
          </h1>
          <p className="text-gray-600">Manage your offered and joined rides</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg p-1 mb-8 shadow-md max-w-md mx-auto">
          <button
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "offered"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("offered")}
          >
            Offered ({offeredRides.length})
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === "joined"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab("joined")}
          >
            Joined ({joinedRides.length})
          </button>
        </div>

        {/* Rides Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "offered" && renderRides(offeredRides, true)}
          {activeTab === "joined" && renderRides(joinedRides, false)}
        </div>

        {/* Action Button */}
        {activeTab === "offered" && (
          <div className="fixed bottom-6 right-6">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/auto-share/create")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoShareMyRidesPage;