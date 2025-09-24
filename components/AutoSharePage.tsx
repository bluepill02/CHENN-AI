import React from "react";
import { Link } from "react-router-dom";
import { Ride } from "../utils/autoShareInterfaces";
import { mockRides } from "../utils/mockRides";

const AutoSharePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          Auto Share / <span className="text-gray-500">ஆட்டோ பகிர்வு</span>
        </h1>
      </header>

      <nav className="flex justify-center space-x-4 mb-6">
        <Link to="/auto-share/my" className="text-blue-500 hover:underline">
          My Rides
        </Link>
        <Link to="/auto-share/history" className="text-blue-500 hover:underline">
          History
        </Link>
      </nav>

      {mockRides.length > 0 ? (
        <ul className="space-y-4">
          {mockRides.map((ride: Ride) => (
            <li key={ride.id} className="border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {ride.pickup} → {ride.drop}
                  </h2>
                  <p className="text-sm text-gray-600">Time: {new Date(ride.time).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    ₹{ride.fare}
                  </span>
                  <p className="text-sm text-gray-600">
                    Seats: {ride.seatsAvailable}/{ride.seatsTotal}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No rides available.</p>
      )}

      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        onClick={() => (window.location.href = "/auto-share/create")}
      >
        +
      </button>
    </div>
  );
};

export default AutoSharePage;
