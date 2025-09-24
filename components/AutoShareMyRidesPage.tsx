import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ride } from "../utils/autoShareInterfaces";
import { mockRides } from "../utils/mockRides";

const AutoShareMyRidesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("offered");
  const navigate = useNavigate();

  const offeredRides = mockRides.filter((ride) => ride.creator.id === "u1"); // Mock user ID
  const joinedRides = mockRides.filter((ride) => ride.creator.id !== "u1");

  const handleManageRide = (rideId: string) => {
    alert(`Manage ride ${rideId}`);
  };

  const handleLeaveRide = (rideId: string) => {
    alert(`Leave ride ${rideId}`);
  };

  const renderRides = (rides: Ride[], isOffered: boolean) => {
    if (rides.length === 0) {
      return (
        <p className="text-center text-gray-500">
          {isOffered
            ? "No offered rides / நான் வழங்கிய பயணங்கள் இல்லை"
            : "No joined rides / நான் சேர்ந்த பயணங்கள் இல்லை"}
        </p>
      );
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
              </div>
              <button
                className={`${
                  isOffered
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white px-4 py-2 rounded`}
                onClick={() =>
                  isOffered ? handleManageRide(ride.id) : handleLeaveRide(ride.id)
                }
              >
                {isOffered ? "Manage" : "Leave Ride"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          My Rides / <span className="text-gray-500">என் பயணங்கள்</span>
        </h1>
      </header>

      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg border-b-2 font-medium ${
            activeTab === "offered"
              ? "border-blue-500 text-blue-500"
              : "border-gray-300 text-gray-500"
          }`}
          onClick={() => setActiveTab("offered")}
        >
          Offered Rides / நான் வழங்கியவை
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg border-b-2 font-medium ${
            activeTab === "joined"
              ? "border-blue-500 text-blue-500"
              : "border-gray-300 text-gray-500"
          }`}
          onClick={() => setActiveTab("joined")}
        >
          Joined Rides / நான் சேர்ந்தவை
        </button>
      </div>

      {activeTab === "offered"
        ? renderRides(offeredRides, true)
        : renderRides(joinedRides, false)}

      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        onClick={() => navigate("/auto-share/create")}
      >
        +
      </button>
    </div>
  );
};

export default AutoShareMyRidesPage;
