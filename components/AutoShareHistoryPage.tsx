import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ride } from "../utils/autoShareInterfaces";
import { mockRides } from "../utils/mockRides";

const AutoShareHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [offeredExpanded, setOfferedExpanded] = useState(true);
  const [joinedExpanded, setJoinedExpanded] = useState(false);

  const offeredRides = mockRides.filter(
    (ride) => ride.creator.id === "u1" && ride.status !== "upcoming"
  );
  const joinedRides = mockRides.filter(
    (ride) => ride.creator.id !== "u1" && ride.status !== "upcoming"
  );

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="text-green-500">✅ Completed</span>;
      case "cancelled":
        return <span className="text-red-500">❌ Cancelled</span>;
      case "no-show":
        return <span className="text-yellow-500">⚠️ No-show</span>;
      default:
        return null;
    }
  };

  const renderRides = (rides: Ride[]) => {
    if (rides.length === 0) {
      return <p className="text-center text-gray-500">No history available.</p>;
    }

    return (
      <ul className="space-y-4">
        {rides.map((ride) => (
          <li key={ride.id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  {ride.pickup} → {ride.drop}
                </h2>
                <p className="text-sm text-gray-600">Time: {new Date(ride.time).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Fare: ₹{ride.fare}</p>
                <p className="text-sm text-gray-600">
                  Seats Filled: {ride.seatsTotal - ride.seatsAvailable}/{ride.seatsTotal}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                  Created by: <span className="ml-2 font-medium">{ride.creator.name}</span>
                  {ride.creator.avatarUrl && (
                    <img
                      src={ride.creator.avatarUrl}
                      alt="avatar"
                      className="w-6 h-6 rounded-full ml-2"
                    />
                  )}
                </p>
              </div>
              <div>{renderStatusBadge(ride.status)}</div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <button
        className="text-blue-500 hover:underline mb-4"
        onClick={() => navigate("/auto-share/my")}
      >
        Back
      </button>

      <div>
        <button
          className="w-full text-left font-medium text-lg mb-2"
          onClick={() => setOfferedExpanded(!offeredExpanded)}
        >
          Offered Rides (Past) / <span className="text-gray-500">நான் வழங்கியவை (முந்தையவை)</span>
        </button>
        {offeredExpanded && <div>{renderRides(offeredRides)}</div>}
      </div>

      <div>
        <button
          className="w-full text-left font-medium text-lg mb-2"
          onClick={() => setJoinedExpanded(!joinedExpanded)}
        >
          Joined Rides (Past) / <span className="text-gray-500">நான் சேர்ந்தவை (முந்தையவை)</span>
        </button>
        {joinedExpanded && <div>{renderRides(joinedRides)}</div>}
      </div>
    </div>
  );
};

export default AutoShareHistoryPage;
