import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockRides } from "../utils/mockRides";

const AutoShareDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ride = mockRides.find((r) => r.id === id);

  const [seatStatus, setSeatStatus] = useState(
    Array(ride?.seatsTotal).fill("Available")
  );
  const navigate = useNavigate();

  const handleJoinRide = () => {
    const firstAvailableIndex = seatStatus.indexOf("Available");
    if (firstAvailableIndex !== -1) {
      const updatedSeats = [...seatStatus];
      updatedSeats[firstAvailableIndex] = "Reserved";
      setSeatStatus(updatedSeats);
      alert("Seat reserved! Please check in closer to the ride time.");
    } else {
      alert("No seats available.");
    }
  };

  const handleCheckIn = () => {
    const reservedIndex = seatStatus.indexOf("Reserved");
    if (reservedIndex !== -1) {
      const updatedSeats = [...seatStatus];
      updatedSeats[reservedIndex] = "Confirmed";
      setSeatStatus(updatedSeats);
      alert("Checked in successfully!");
    }
  };

  const renderSeatStatus = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <span className="text-green-500">🟢</span>;
      case "Reserved":
        return <span className="text-yellow-500">🟡</span>;
      case "Available":
      default:
        return <span className="text-red-500">🔴</span>;
    }
  };

  if (!ride) {
    return <p className="text-center text-red-500">Ride not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <button
        className="text-blue-500 hover:underline mb-4"
        onClick={() => navigate("/auto-share")}
      >
        Back
      </button>

      <div className="border p-4 rounded shadow mb-6">
        <h1 className="text-xl font-bold mb-2">
          {ride.pickup} → {ride.drop}
        </h1>
        <p className="text-gray-600">
          Time: {new Date(ride.time).toLocaleString()}
        </p>
        <p className="text-gray-600">Fare: ₹{ride.fare}</p>
        <p className="text-gray-600">
          Seats: {ride.seatsAvailable}/{ride.seatsTotal}
        </p>
        {ride.creator && (
          <p className="text-gray-600">Driver: {ride.creator.name}</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Seat Status</h2>
        <div className="flex space-x-2">
          {seatStatus.map((status, index) => (
            <div key={index} className="text-center">
              {renderSeatStatus(status)}
              <p className="text-sm">Seat {index + 1}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleJoinRide}
        >
          Join Ride
        </button>
        {seatStatus.includes("Reserved") && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleCheckIn}
          >
            Check In
          </button>
        )}
      </div>
    </div>
  );
};

export default AutoShareDetailPage;
